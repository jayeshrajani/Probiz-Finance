const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model');
const Employee = require('../models/employee.model');
const LeadMeta = require('../models/leadMeta.model');
const User = require('../models/user.model');
const Property = require('../models/property.model');
const Newsletter = require('../models/newslatter.model');
const { signStaffToken } = require('../middlewares/staffAuth');
const { LEAD_TYPES, GROUPS, byType, summarize } = require('../admin/leads');

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost'];
const OPEN = new Set(['new', 'contacted', 'in_progress']);
const DAY = 24 * 60 * 60 * 1000;
const HIDDEN_FIELDS = new Set(['_id', '__v', 'password', 'deleteFlag']);

const isAdmin = (req) => req.staff.role === 'admin';
const metaKey = (type, id) => `${type}:${id}`;
const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
const fail = (res, status, message) => res.status(status).json({ message, status });

// Employees work their own leads plus the unassigned pool; admins see everything.
const canSee = (req, lead) => isAdmin(req) || !lead.assignedTo || lead.assignedTo === req.staff.id;

async function loadMetas(types) {
  const metas = await LeadMeta.find(types ? { type: { $in: types } } : {}).lean();
  return new Map(metas.map((meta) => [metaKey(meta.type, meta.leadId), meta]));
}

async function loadLeads(defs, types) {
  const [lists, metas] = await Promise.all([
    Promise.all(defs.map(async (def) => (await def.model.find({}).lean()).map((doc) => summarize(def, doc)))),
    loadMetas(types),
  ]);
  return lists.flat().map((row) => {
    const meta = metas.get(metaKey(row.type, row.id));
    return { ...row, status: meta?.status || 'new', assignedTo: meta?.assignedTo || null, assignedName: meta?.assignedName || null };
  });
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
      employees: employees.map((e) => ({ id: String(e._id), name: e.name })),
    },
  });
};

exports.overview = async (req, res) => {
  const all = await loadLeads(LEAD_TYPES);
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
    recent: [...mine].sort(byNewest).slice(0, 8),
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
  const defs = type === 'all' ? LEAD_TYPES : byType[type] ? [byType[type]] : null;
  if (!defs) return fail(res, 404, 'Unknown lead type.');

  let leads = (await loadLeads(defs, type === 'all' ? null : [type])).filter((l) => canSee(req, l)).sort(byNewest);

  const scope = String(req.query.scope || '');
  if (scope === 'mine') leads = leads.filter((l) => l.assignedTo === req.staff.id);
  else if (scope === 'unassigned') leads = leads.filter((l) => !l.assignedTo);
  else if (scope && isAdmin(req)) leads = leads.filter((l) => l.assignedTo === scope);

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
  const doc = await def.model.findById(req.params.id).lean();
  if (!doc) {
    fail(res, 404, 'Lead not found.');
    return null;
  }
  const meta = await LeadMeta.findOne({ type: def.type, leadId: String(doc._id) });
  if (!canSee(req, { assignedTo: meta?.assignedTo })) {
    fail(res, 403, 'This lead belongs to another advisor.');
    return null;
  }
  return { def, doc, meta };
}

const view = (meta) => ({
  status: meta?.status || 'new',
  assignedTo: meta?.assignedTo || null,
  assignedName: meta?.assignedName || null,
  notes: (meta?.notes || []).slice().reverse(),
});

exports.get = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, doc, meta } = found;
  const fields = Object.fromEntries(Object.entries(doc).filter(([k]) => !HIDDEN_FIELDS.has(k)));
  res.json({ data: { lead: { ...summarize(def, doc), page: def.page || null }, fields, ...view(meta) } });
};

exports.update = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, doc } = found;
  let { meta } = found;
  const body = req.body || {};
  const note = String(body.note || '').trim().slice(0, 2000);
  if (body.status !== undefined && !STATUSES.includes(body.status)) return fail(res, 400, 'Unknown status.');

  if (!meta) meta = new LeadMeta({ type: def.type, leadId: String(doc._id), status: 'new', notes: [] });
  const by = req.staff.name || req.staff.email;
  const log = (text) => (meta.notes = [...(meta.notes || []), { text, by, at: new Date() }]);

  if (body.assignTo !== undefined) {
    if (!isAdmin(req)) return fail(res, 403, 'Only admins can reassign leads.');
    if (body.assignTo) {
      const employee = await Employee.findOne({ _id: body.assignTo, deleteFlag: false }).lean();
      if (!employee) return fail(res, 400, 'That employee no longer exists.');
      meta.assignedTo = String(employee._id);
      meta.assignedName = employee.name;
      log(`Assigned to ${employee.name}`);
    } else if (meta.assignedTo) {
      meta.assignedTo = null;
      meta.assignedName = null;
      log('Moved back to the unassigned pool');
    }
  }

  // An employee who works an unassigned lead takes ownership of it.
  if (!isAdmin(req) && !meta.assignedTo && (body.claim || body.status || note)) {
    meta.assignedTo = req.staff.id;
    meta.assignedName = req.staff.name;
    log(`${req.staff.name} picked up this lead`);
  }

  if (body.status && body.status !== meta.status) {
    log(`Status changed to ${body.status.replace('_', ' ')}`);
    meta.status = body.status;
  }
  if (note) log(note);
  await meta.save();
  res.json({ data: view(meta) });
};

exports.remove = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, doc } = found;
  await def.model.findByIdAndDelete(doc._id);
  await LeadMeta.deleteMany({ type: def.type, leadId: String(doc._id) });
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
  const [employees, leads] = await Promise.all([Employee.find({ deleteFlag: false }).lean(), loadLeads(LEAD_TYPES)]);
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
  const metas = await LeadMeta.find({ assignedTo: String(target._id) });
  for (const meta of metas) {
    if (!OPEN.has(meta.status)) continue;
    meta.assignedTo = null;
    meta.assignedName = null;
    meta.notes = [...(meta.notes || []), { text: `${target.name} left; moved back to the unassigned pool`, by: req.staff.name, at: new Date() }];
    await meta.save();
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
