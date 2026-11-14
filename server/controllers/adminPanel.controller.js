const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model');
const Employee = require('../models/employee.model');
const Lead = require('../models/lead.model');
const LeadEvent = require('../models/leadEvent.model');
const User = require('../models/user.model');
const Property = require('../models/property.model');
const Newsletter = require('../models/newslatter.model');
const { signStaffToken } = require('../middlewares/staffAuth');
const { LEAD_TYPES, GROUPS, byType } = require('../admin/leads');
const { ensureBackfilled } = require('../leads/backfill');
const { emit } = require('../leads/events');

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost'];
const OPEN = new Set(['new', 'contacted', 'in_progress']);
const CHANNELS = ['web_form', 'assistant', 'staff', 'legacy_api', 'legacy_import'];
const DAY = 24 * 60 * 60 * 1000;
const HIDDEN_FIELDS = new Set(['_id', '__v', 'password', 'deleteFlag']);

const isAdmin = (req) => req.staff.role === 'admin';
const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
const byActivity = (a, b) => new Date(b.lastActivityAt || b.createdAt) - new Date(a.lastActivityAt || a.createdAt);
const fail = (res, status, message) => res.status(status).json({ message, status });

// Employees work their own leads plus the unassigned pool; admins see everything.
const canSee = (req, lead) => isAdmin(req) || !lead.assignedTo || lead.assignedTo === req.staff.id;

const row = (lead) => ({
  id: String(lead._id),
  type: lead.type,
  typeLabel: byType[lead.type]?.label || lead.type,
  name: lead.name || 'Unnamed',
  phone: lead.phone,
  email: lead.email,
  amount: lead.amount,
  detail: lead.detail,
  createdAt: lead.createdAt,
  lastActivityAt: lead.lastActivityAt || lead.createdAt,
  status: lead.status || 'new',
  assignedTo: lead.assignedTo || null,
  assignedName: lead.assignedName || null,
  channel: lead.source?.channel || null,
  repeatCount: lead.repeatCount || 0,
});

async function loadLeads(filter = {}) {
  await ensureBackfilled();
  return (await Lead.find(filter).lean()).map(row);
}

const staffActor = (req) => ({ kind: 'staff', id: req.staff.id, name: req.staff.name || req.staff.email });

const CHANNEL_LABEL = { web_form: 'website form', assistant: 'website assistant', staff: 'staff entry', legacy_api: 'older form', legacy_import: 'older form' };

// The activity feed shown on the lead page, newest first.
function activity(events) {
  const text = (e) => {
    const d = e.data || {};
    switch (e.type) {
      case 'lead.created':
        return `Came in through the ${CHANNEL_LABEL[d.source?.channel] || 'website'}${d.source?.topic ? ` (${d.source.topic})` : ''}`;
      case 'lead.repeat':
        return 'Submitted the form again';
      case 'lead.assigned':
        return d.claimed ? `${d.name} picked up this lead` : `Assigned to ${d.name}`;
      case 'lead.unassigned':
        return d.reason || 'Moved back to the unassigned pool';
      case 'lead.status_changed':
        return `Status changed to ${String(d.to).replace('_', ' ')}`;
      case 'lead.note_added':
        return d.text;
      case 'notification.sent':
        return 'WhatsApp alert sent to the team';
      case 'notification.failed':
        return `Alert failed: ${d.error || d.results?.find((r) => !r.ok)?.error || 'unknown error'}`;
      default:
        return e.type;
    }
  };
  return events
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .map((e) => ({
      id: String(e._id),
      kind: e.type === 'lead.note_added' ? 'note' : 'system',
      text: text(e),
      by: e.actor?.name || (e.actor?.kind === 'customer' ? 'Customer' : 'Probiz'),
      at: e.at,
    }));
}

const staffView = (s) => ({ id: s.id, role: s.role, name: s.name, email: s.email, employeeId: s.employeeId || null, title: s.title || null });

exports.me = (req, res) => res.json({ data: staffView(req.staff) });

exports.employeeLogin = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return fail(res, 400, 'Enter your email and password.');
  const employees = await Employee.find({ deleteFlag: false }).lean();
  const found = employees.find((e) => String(e.email).toLowerCase() === email);
  if (!found || !bcrypt.compareSync(password, found.password)) return fail(res, 401, "That email and password don't match an employee account.");
  res.json({ accessToken: signStaffToken(String(found._id), 'employee'), data: { name: found.name, email: found.email } });
};

// One sign-in for all staff: the account the credentials match decides the role (admin wins on a shared email).
exports.staffLogin = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return fail(res, 400, 'Enter your email and password.');
  const [admins, employees] = await Promise.all([Admin.find({ deleteFlag: false }).lean(), Employee.find({ deleteFlag: false }).lean()]);
  const admin = admins.find((a) => String(a.admin_Email).toLowerCase() === email);
  if (admin && bcrypt.compareSync(password, admin.password)) {
    return res.json({ accessToken: signStaffToken(String(admin._id), 'admin'), role: 'admin', data: { name: admin.admin_Name, email: admin.admin_Email } });
  }
  const employee = employees.find((e) => String(e.email).toLowerCase() === email);
  if (employee && bcrypt.compareSync(password, employee.password)) {
    return res.json({ accessToken: signStaffToken(String(employee._id), 'employee'), role: 'employee', data: { name: employee.name, email: employee.email } });
  }
  return fail(res, 401, "That email and password don't match a staff account.");
};

exports.config = async (req, res) => {
  const employees = isAdmin(req) ? await Employee.find({ deleteFlag: false }).lean() : [];
  res.json({
    data: {
      role: req.staff.role,
      statuses: STATUSES,
      groups: GROUPS,
      types: LEAD_TYPES.map(({ type, label, group, page }) => ({ type, label, group, page: page || null })),
      channels: CHANNELS,
      employees: employees.map((e) => ({ id: String(e._id), name: e.name })),
    },
  });
};

exports.overview = async (req, res) => {
  const all = await loadLeads();
  const mine = isAdmin(req) ? all : all.filter((l) => l.assignedTo === req.staff.id);
  const unassigned = all.filter((l) => !l.assignedTo);
  const now = Date.now();
  const age = (row) => now - new Date(row.createdAt).getTime();

  const days = Array.from({ length: 30 }, (_, i) => ({ date: new Date(now - (29 - i) * DAY).toISOString().slice(0, 10), count: 0 }));
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  const perType = new Map();
  for (const row of mine) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    if (dayIndex.has(key)) days[dayIndex.get(key)].count += 1;
    const entry = perType.get(row.type) || { type: row.type, label: row.typeLabel, total: 0, open: 0 };
    entry.total += 1;
    if (row.status === 'new') entry.open += 1;
    perType.set(row.type, entry);
  }
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, mine.filter((l) => l.status === s).length]));

  const data = {
    role: req.staff.role,
    totals: {
      leads: mine.length,
      last7: mine.filter((l) => age(l) <= 7 * DAY).length,
      last30: mine.filter((l) => age(l) <= 30 * DAY).length,
      open: statusCounts.new,
      active: mine.filter((l) => OPEN.has(l.status)).length,
      won: statusCounts.won,
      unassigned: unassigned.length,
    },
    statusCounts,
    daily: days,
    byType: [...perType.values()].sort((a, b) => b.total - a.total),
    recent: [...mine].sort(byActivity).slice(0, 8),
    pool: [...unassigned].sort(byNewest).slice(0, 5),
  };

  if (isAdmin(req)) {
    const [users, properties, subscribers, employees] = await Promise.all([
      User.countDocuments({ deleteFlag: false }),
      Property.countDocuments({}),
      Newsletter.countDocuments({}),
      Employee.find({ deleteFlag: false }).lean(),
    ]);
    Object.assign(data.totals, { users, properties, subscribers });
    data.team = employees.map((e) => {
      const theirs = all.filter((l) => l.assignedTo === String(e._id));
      return { id: String(e._id), name: e.name, active: theirs.filter((l) => OPEN.has(l.status)).length, won: theirs.filter((l) => l.status === 'won').length };
    });
  }
  res.json({ data });
};

exports.list = async (req, res) => {
  const type = String(req.query.type || 'all');
  if (type !== 'all' && !byType[type]) return fail(res, 404, 'Unknown lead type.');

  let leads = (await loadLeads(type === 'all' ? {} : { type })).filter((l) => canSee(req, l)).sort(byActivity);

  const scope = String(req.query.scope || '');
  if (scope === 'mine') leads = leads.filter((l) => l.assignedTo === req.staff.id);
  else if (scope === 'unassigned') leads = leads.filter((l) => !l.assignedTo);
  else if (scope && isAdmin(req)) leads = leads.filter((l) => l.assignedTo === scope);

  const channel = String(req.query.channel || '');
  if (CHANNELS.includes(channel)) leads = leads.filter((l) => l.channel === channel);

  const q = String(req.query.q || '').trim().toLowerCase();
  if (q) leads = leads.filter((l) => [l.name, l.phone, l.email, l.detail].some((v) => v && String(v).toLowerCase().includes(q)));
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length]));
  const status = String(req.query.status || '');
  if (STATUSES.includes(status)) leads = leads.filter((l) => l.status === status);

  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  res.json({ data: leads.slice((page - 1) * limit, page * limit), total: leads.length, page, limit, statusCounts });
};

async function findLead(req, res) {
  const def = byType[req.params.type];
  if (!def) {
    fail(res, 404, 'Unknown lead type.');
    return null;
  }
  await ensureBackfilled();
  const id = String(req.params.id);
  // Older links used the per-form record id; resolve those to the envelope that holds it.
  const lead =
    (await Lead.findOne({ _id: id, type: def.type })) ||
    (await Lead.find({ type: def.type })).find((l) => (l.refIds?.length ? l.refIds : [l.refId]).includes(id));
  if (!lead) {
    fail(res, 404, 'Lead not found.');
    return null;
  }
  if (!canSee(req, lead)) {
    fail(res, 403, 'This lead belongs to another advisor.');
    return null;
  }
  return { def, lead };
}

async function view(lead) {
  const events = await LeadEvent.find({ leadId: String(lead._id) }).lean();
  return {
    status: lead.status || 'new',
    assignedTo: lead.assignedTo || null,
    assignedName: lead.assignedName || null,
    notes: activity(events),
  };
}

const clean = (doc) => Object.fromEntries(Object.entries(doc).filter(([k]) => !HIDDEN_FIELDS.has(k)));

exports.get = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, lead } = found;
  const refs = lead.refIds?.length ? lead.refIds : [lead.refId];
  const docs = (await Promise.all(refs.map((ref) => def.model.findById(ref).lean()))).filter(Boolean).sort(byNewest);
  const customer = lead.userId ? await User.findById(lead.userId).lean() : null;
  res.json({
    data: {
      lead: { ...row(lead), page: def.page || null, source: lead.source || null, consent: lead.consent || null },
      fields: docs[0] ? clean(docs[0]) : {},
      submissions: docs.map((d) => ({ id: String(d._id), createdAt: d.createdAt, fields: clean(d) })),
      customer: customer ? { id: String(customer._id), name: customer.fullName || customer.name || null, email: customer.email || null } : null,
      ...(await view(lead)),
    },
  });
};

exports.update = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { lead } = found;
  const body = req.body || {};
  const note = String(body.note || '').trim().slice(0, 2000);
  if (body.status !== undefined && !STATUSES.includes(body.status)) return fail(res, 400, 'Unknown status.');
  const events = [];

  if (body.assignTo !== undefined) {
    if (!isAdmin(req)) return fail(res, 403, 'Only admins can reassign leads.');
    if (body.assignTo) {
      const employee = await Employee.findOne({ _id: body.assignTo, deleteFlag: false }).lean();
      if (!employee) return fail(res, 400, 'That employee no longer exists.');
      lead.assignedTo = String(employee._id);
      lead.assignedName = employee.name;
      events.push(['lead.assigned', { to: lead.assignedTo, name: employee.name }]);
    } else if (lead.assignedTo) {
      lead.assignedTo = null;
      lead.assignedName = null;
      events.push(['lead.unassigned', {}]);
    }
  }

  // An employee who works an unassigned lead takes ownership of it.
  if (!isAdmin(req) && !lead.assignedTo && (body.claim || body.status || note)) {
    lead.assignedTo = req.staff.id;
    lead.assignedName = req.staff.name;
    events.push(['lead.assigned', { to: req.staff.id, name: req.staff.name, claimed: true }]);
  }

  if (body.status && body.status !== lead.status) {
    events.push(['lead.status_changed', { from: lead.status, to: body.status }]);
    lead.status = body.status;
  }
  if (note) events.push(['lead.note_added', { text: note }]);
  if (events.length) {
    lead.lastActivityAt = new Date();
    await lead.save();
    for (const [type, data] of events) await emit(lead, type, staffActor(req), data);
  }
  res.json({ data: await view(lead) });
};

exports.remove = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, lead } = found;
  for (const ref of lead.refIds?.length ? lead.refIds : [lead.refId]) await def.model.findByIdAndDelete(ref);
  await LeadEvent.deleteMany({ leadId: String(lead._id) });
  await Lead.findByIdAndDelete(lead._id);
  res.json({ message: 'Lead deleted.' });
};

exports.admins = async (req, res) => {
  const admins = await Admin.find({ deleteFlag: false }).lean();
  res.json({ data: admins.map(({ password, ...a }) => a).sort(byNewest) });
};

exports.removeAdmin = async (req, res) => {
  if (String(req.params.id) === req.staff.id) return fail(res, 400, "You can't remove your own account.");
  const target = await Admin.findOne({ _id: req.params.id, deleteFlag: false });
  if (!target) return fail(res, 404, 'Admin not found.');
  target.deleteFlag = true;
  await target.save();
  res.json({ message: 'Admin removed.' });
};

exports.employees = async (req, res) => {
  const [employees, leads] = await Promise.all([Employee.find({ deleteFlag: false }).lean(), loadLeads()]);
  res.json({
    data: employees
      .map(({ password, ...e }) => {
        const theirs = leads.filter((l) => l.assignedTo === String(e._id));
        return { ...e, active: theirs.filter((l) => OPEN.has(l.status)).length, won: theirs.filter((l) => l.status === 'won').length };
      })
      .sort(byNewest),
  });
};

exports.addEmployee = async (req, res) => {
  const { name, email, mobile, employeeId, title, password } = req.body || {};
  if (!name || !email || !mobile || !employeeId || !password) return fail(res, 400, 'Name, email, mobile, employee ID and password are all required.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'Enter a valid email.');
  if (String(password).length < 8) return fail(res, 400, 'Use a password of at least 8 characters.');
  const existing = (await Employee.find({ deleteFlag: false }).lean()).find(
    (e) => String(e.email).toLowerCase() === String(email).toLowerCase() || String(e.employeeId) === String(employeeId)
  );
  if (existing) return fail(res, 409, 'An employee with that email or ID already exists.');
  const saved = await Employee.create({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    mobile: String(mobile).trim(),
    employeeId: String(employeeId).trim(),
    roll: String(title || 'Advisor').trim(),
    password: bcrypt.hashSync(String(password), 10),
  });
  const { password: _hash, ...data } = saved.toObject();
  res.status(201).json({ data });
};

exports.removeEmployee = async (req, res) => {
  const target = await Employee.findOne({ _id: req.params.id, deleteFlag: false });
  if (!target) return fail(res, 404, 'Employee not found.');
  target.deleteFlag = true;
  await target.save();
  // Their open leads go back to the pool so nothing is stranded.
  await ensureBackfilled();
  const theirs = await Lead.find({ assignedTo: String(target._id) });
  for (const lead of theirs) {
    if (!OPEN.has(lead.status)) continue;
    lead.assignedTo = null;
    lead.assignedName = null;
    await lead.save();
    await emit(lead, 'lead.unassigned', staffActor(req), { reason: `${target.name} left; moved back to the unassigned pool` });
  }
  res.json({ message: 'Employee removed.' });
};

exports.resetEmployeePassword = async (req, res) => {
  const next = String(req.body?.password || '');
  if (next.length < 8) return fail(res, 400, 'Use a password of at least 8 characters.');
  const target = await Employee.findOne({ _id: req.params.id, deleteFlag: false });
  if (!target) return fail(res, 404, 'Employee not found.');
  target.password = bcrypt.hashSync(next, 10);
  await target.save();
  res.json({ message: 'Password reset.' });
};

exports.changePassword = async (req, res) => {
  const current = String(req.body?.current || '');
  const next = String(req.body?.next || '');
  if (next.length < 8) return fail(res, 400, 'Use at least 8 characters.');
  const Model = isAdmin(req) ? Admin : Employee;
  const me = await Model.findById(req.staff.id);
  if (!me || !bcrypt.compareSync(current, me.password)) return fail(res, 400, 'Current password is wrong.');
  me.password = bcrypt.hashSync(next, 10);
  await me.save();
  res.json({ message: 'Password updated.' });
};
