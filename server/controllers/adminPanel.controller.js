const bcrypt = require('bcryptjs');
const { ci, transaction } = require('../odm');
const Admin = require('../models/admin.model');
const Employee = require('../models/employee.model');
const Lead = require('../models/lead.model');
const LeadEvent = require('../models/leadEvent.model');
const DocumentAccess = require('../models/documentAccess.model');
const User = require('../models/user.model');
const Property = require('../models/property.model');
const Newsletter = require('../models/newslatter.model');
const { signStaffToken, isPlatformManager, signPlatformToken } = require('../middlewares/staffAuth');
const { LEAD_TYPES, GROUPS, byType } = require('../admin/leads');
const { analytics, dayKey, resolveRange, parseDayRange } = require('../admin/analytics');
const { ensureBackfilled } = require('../leads/backfill');
const { emit } = require('../leads/events');
const { withFileLinks, storedValues, deleteStoredFile, uploadToken } = require('../storage');
const { PERSONAS, STAGES, STAGE_LABEL, EMAIL_DOMAIN, personaOf, levelOf, stageOf, staffEmail } = require('../admin/personas');
const { ensureRefs } = require('../leads/refs');
const { purgeSigninLeads } = require('../leads/mobile');
const { salesProgress, parseTarget } = require('../admin/targets');

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost'];
const OPEN = new Set(['new', 'contacted', 'in_progress']);
const CHANNELS = ['web_form', 'assistant', 'otp_signin', 'staff', 'legacy_api', 'legacy_import'];
const DAY = 24 * 60 * 60 * 1000;
const HIDDEN_FIELDS = new Set(['_id', '__v', 'password', 'deleteFlag']);

const isAdmin = (req) => req.staff.role === 'admin';
const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
const byActivity = (a, b) => new Date(b.lastActivityAt || b.createdAt) - new Date(a.lastActivityAt || a.createdAt);
const fail = (res, status, message) => res.status(status).json({ message, status });

const isSales = (req) => !isAdmin(req) && req.staff.persona === 'sales';
const myLevel = (req) => (isAdmin(req) ? null : levelOf(req.staff.persona));
const addedById = (lead) => lead.source?.addedBy?.id || null;
const handled = (lead, id) => lead.assignedTo === id || (lead.handledBy || []).includes(id);

// Operations work their own leads and the unassigned pool at their level; admins can change anything.
const canEdit = (req, lead) =>
  isAdmin(req) || (!lead.archived && Boolean(myLevel(req)) && stageOf(lead) === myLevel(req) && (!lead.assignedTo || lead.assignedTo === req.staff.id));
// Read-only on top of that: sales see the leads they added, operations the leads they worked before.
const canSee = (req, lead) =>
  canEdit(req, lead) || (!lead.archived && (isSales(req) ? addedById(lead) === req.staff.id : handled(lead, req.staff.id)));

const addToHandled = (lead, id) => {
  if (id && !(lead.handledBy || []).includes(id)) lead.handledBy = [...(lead.handledBy || []), id];
};

const row = (lead, req) => ({
  id: String(lead._id),
  ref: lead.ref || null,
  convertedFrom: lead.convertedFrom || null,
  phoneVerified: Boolean(lead.phoneVerified),
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
  stage: stageOf(lead),
  channel: lead.source?.channel || null,
  addedBy: lead.source?.addedBy?.name || null,
  addedById: addedById(lead),
  repeatCount: lead.repeatCount || 0,
  archived: Boolean(lead.archived),
  ...(req ? { readOnly: !canEdit(req, lead) } : {}),
});

async function loadLeads(filter = {}) {
  await ensureBackfilled();
  return (await Lead.find(filter).lean()).map((l) => row(l));
}

const staffActor = (req) => ({ kind: 'staff', id: req.staff.id, name: req.staff.name || req.staff.email });

// Mobile sign-in (NUL) leads older than 7 days go; the daily cron does the same, this covers hosts without it.
let lastPurge = 0;
async function maybePurge() {
  if (Date.now() - lastPurge < 60 * 60 * 1000) return;
  lastPurge = Date.now();
  try {
    await purgeSigninLeads();
  } catch (err) {
    console.error('[leads] sign-in cleanup failed', err.message);
  }
}

const CHANNEL_LABEL = { web_form: 'website form', assistant: 'website assistant', otp_signin: 'mobile sign-in', staff: 'staff entry', legacy_api: 'older form', legacy_import: 'older form' };
const VERIFIED_VIA = { signin: 'signed in with a mobile code', account: 'from their account', application: 'after applying' };

// The activity feed shown on the lead page, newest first.
function activity(events) {
  const text = (e) => {
    const d = e.data || {};
    switch (e.type) {
      case 'lead.created':
        return `Came in through the ${CHANNEL_LABEL[d.source?.channel] || 'website'}${d.source?.topic ? ` (${d.source.topic})` : ''}`;
      case 'lead.repeat':
        return 'Submitted the form again';
      case 'lead.signed_in':
        return 'Signed in on the website with a mobile code';
      case 'lead.interest':
        return `Interested in ${d.label}`;
      case 'lead.converted':
        return `Applied for ${d.label || 'a product'}: ${d.from || 'mobile sign-in'} became ${d.to}`;
      case 'lead.phone_verified':
        return `Mobile number verified (${VERIFIED_VIA[d.via] || 'by code'})`;
      case 'lead.assigned':
        return d.claimed ? `${d.name} picked up this lead` : `Assigned to ${d.name}`;
      case 'lead.unassigned':
        return d.reason || 'Moved back to the unassigned pool';
      case 'lead.status_changed':
        return `Status changed to ${String(d.to).replace('_', ' ')}`;
      case 'lead.forwarded':
        return 'Forwarded to Operations L2';
      case 'lead.sent_back':
        return `Sent back to Operations L1${d.name ? ` (${d.name})` : ''}: ${d.reason}`;
      case 'lead.stage_changed':
        return `Moved to ${STAGE_LABEL[d.to] || d.to}`;
      case 'lead.note_added':
        return d.text;
      case 'lead.archived':
        return 'Archived';
      case 'lead.unarchived':
        return 'Restored from the archive';
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
      status: e.type === 'lead.status_changed' ? e.data?.to || null : null,
      by: e.actor?.name || (e.actor?.kind === 'customer' ? 'Customer' : 'Probiz'),
      at: e.at,
    }));
}

const staffView = (s) => ({
  id: s.id,
  role: s.role,
  persona: s.persona || null,
  platform: Boolean(s.platform),
  name: s.name,
  email: s.email,
  employeeId: s.employeeId || null,
  title: s.title || null,
});

exports.me = (req, res) => res.json({ data: staffView(req.staff) });

exports.employeeLogin = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return fail(res, 400, 'Enter your email and password.');
  const found = await Employee.findOne({ email: ci(email), deleteFlag: false }).lean();
  if (!found || !bcrypt.compareSync(password, found.password)) return fail(res, 401, "That email and password don't match an employee account.");
  res.json({ accessToken: signStaffToken(String(found._id), 'employee'), data: { name: found.name, email: found.email } });
};

// One sign-in for all staff: the account the credentials match decides the role (admin wins on a shared email).
exports.staffLogin = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return fail(res, 400, 'Enter your email and password.');
  if (isPlatformManager(email, password)) {
    return res.json({ accessToken: signPlatformToken(), role: 'admin', data: { name: 'Platform manager', email } });
  }
  const [admin, employee] = await Promise.all([
    Admin.findOne({ admin_Email: ci(email), deleteFlag: false }).lean(),
    Employee.findOne({ email: ci(email), deleteFlag: false }).lean(),
  ]);
  if (admin && bcrypt.compareSync(password, admin.password)) {
    return res.json({ accessToken: signStaffToken(String(admin._id), 'admin'), role: 'admin', data: { name: admin.admin_Name, email: admin.admin_Email } });
  }
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
      persona: req.staff.persona || null,
      personas: Object.entries(PERSONAS).map(([id, p]) => ({ id, label: p.label, level: p.level, emailTag: p.emailTag })),
      emailDomain: EMAIL_DOMAIN,
      stages: STAGES.map((id) => ({ id, label: STAGE_LABEL[id] })),
      statuses: STATUSES,
      groups: GROUPS,
      types: LEAD_TYPES.map(({ type, label, group, page, formKey }) => ({ type, label, group, page: page || null, formKey })),
      channels: CHANNELS,
      employees: employees.map((e) => ({ id: String(e._id), name: e.name, persona: personaOf(e) })),
    },
  });
};

exports.overview = async (req, res) => {
  await ensureBackfilled();
  const everything = await ensureRefs(await Lead.find({}).lean());
  // Admins can narrow the dashboard to the leads one sales executive added.
  const addedByFilter = isAdmin(req) ? String(req.query.addedBy || '') : '';
  const raw = everything.filter((l) => !l.archived && (!addedByFilter || addedById(l) === addedByFilter));
  const all = raw.map((l) => row(l, req));
  const level = myLevel(req);
  // Sales "own" the leads they added; operations the ones assigned to them.
  const mine = isAdmin(req) ? all : isSales(req) ? all.filter((l) => l.addedById === req.staff.id) : all.filter((l) => l.assignedTo === req.staff.id);
  // Only open leads are waiting to be picked up; closed ones can stay unassigned. Operations see their level's pool.
  const pool = all.filter((l) => !l.assignedTo && OPEN.has(l.status));
  const unassigned = isAdmin(req) ? pool : level ? pool.filter((l) => l.stage === level) : [];
  const visible = isAdmin(req) ? all : all.filter((l, i) => canSee(req, raw[i]));
  const now = Date.now();
  const age = (row) => now - new Date(row.createdAt).getTime();

  const days = Array.from({ length: 30 }, (_, i) => ({ date: dayKey(now - (29 - i) * DAY), count: 0, won: 0, open: 0, lost: 0 }));
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  const perType = new Map();
  for (const row of mine) {
    const key = dayKey(new Date(row.createdAt).getTime());
    if (!dayIndex.has(key)) continue;
    const day = days[dayIndex.get(key)];
    day.count += 1;
    day[row.status === 'won' ? 'won' : row.status === 'lost' ? 'lost' : 'open'] += 1;
  }
  // Sidebar badges: new leads per product among the ones this person can open.
  for (const row of visible) {
    const entry = perType.get(row.type) || { type: row.type, label: row.typeLabel, total: 0, open: 0 };
    entry.total += 1;
    if (row.status === 'new') entry.open += 1;
    perType.set(row.type, entry);
  }
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, mine.filter((l) => l.status === s).length]));
  const openMine = mine.filter((l) => OPEN.has(l.status));

  const data = {
    role: req.staff.role,
    persona: req.staff.persona || null,
    totals: {
      leads: mine.length,
      last7: mine.filter((l) => age(l) <= 7 * DAY).length,
      last30: mine.filter((l) => age(l) <= 30 * DAY).length,
      open: statusCounts.new,
      active: openMine.length,
      won: statusCounts.won,
      lost: statusCounts.lost,
      rejection: mine.length ? statusCounts.lost / mine.length : null,
      unassigned: unassigned.length,
      archived: isAdmin(req) ? everything.filter((l) => l.archived && (!addedByFilter || addedById(l) === addedByFilter)).length : 0,
    },
    statusCounts,
    // Open leads by operations level, and how many of those still wait in that level's pool.
    stageCounts: Object.fromEntries(
      STAGES.map((s) => [s, { open: openMine.filter((l) => l.stage === s).length, waiting: openMine.filter((l) => l.stage === s && !l.assignedTo).length }])
    ),
    daily: days,
    byType: [...perType.values()].sort((a, b) => b.total - a.total),
    recent: [...mine].sort(byActivity).slice(0, 8),
    pool: [...unassigned].sort(byNewest).slice(0, 5),
  };

  if (isSales(req)) {
    const me = await Employee.findOne({ _id: req.staff.id, deleteFlag: false }).lean();
    if (me) data.target = salesProgress(raw, me, now);
  }

  if (isAdmin(req)) {
    const [users, properties, subscribers, employees] = await Promise.all([
      User.countDocuments({ deleteFlag: false }),
      Property.countDocuments({}),
      Newsletter.countDocuments({}),
      Employee.find({ deleteFlag: false }).lean(),
    ]);
    Object.assign(data.totals, { users, properties, subscribers });
    // The panel shell also calls this endpoint for badge counts, so the heavier numbers are opt-in.
    if (req.query.analytics === '1') {
      const { start } = resolveRange(req.query);
      // Range-only query: type + range together would need a Firestore composite index.
      const events = (await LeadEvent.find({ at: { $gte: new Date(start) } }).lean()).filter((e) => e.type === 'lead.status_changed' || e.type === 'lead.note_added');
      data.analytics = analytics({ leads: raw, events, employees, query: req.query });
      data.targets = employees.filter((e) => personaOf(e) === 'sales' && (!addedByFilter || String(e._id) === addedByFilter)).map((e) => salesProgress(raw, e, now));
    }
  }
  res.json({ data });
};

exports.list = async (req, res) => {
  const type = String(req.query.type || 'all');
  if (type !== 'all' && !byType[type]) return fail(res, 404, 'Unknown lead type.');
  const group = String(req.query.group || '');
  if (group && !GROUPS.some((g) => g.id === group)) return fail(res, 404, 'Unknown lead category.');

  await ensureBackfilled();
  await maybePurge();
  const found = await ensureRefs(await Lead.find(type === 'all' ? {} : { type }).lean());
  let leads = found.filter((l) => canSee(req, l)).map((l) => row(l, req)).sort(byActivity);
  if (group) leads = leads.filter((l) => byType[l.type]?.group === group);

  const scope = String(req.query.scope || '');
  const showArchived = scope === 'archived' && isAdmin(req);
  leads = leads.filter((l) => l.archived === showArchived);
  if (scope === 'mine') leads = leads.filter((l) => (isSales(req) ? l.addedById === req.staff.id : l.assignedTo === req.staff.id));
  else if (scope === 'unassigned') leads = leads.filter((l) => !l.assignedTo && (isAdmin(req) || l.stage === myLevel(req)));
  else if (scope === 'handled') leads = leads.filter((l) => l.readOnly);
  else if (scope && !showArchived && isAdmin(req)) leads = leads.filter((l) => l.assignedTo === scope);

  const stage = String(req.query.stage || '');
  if (STAGES.includes(stage)) leads = leads.filter((l) => l.stage === stage);
  const addedBy = String(req.query.addedBy || '');
  if (addedBy && isAdmin(req)) leads = leads.filter((l) => l.addedById === addedBy);

  const channel = String(req.query.channel || '');
  if (CHANNELS.includes(channel)) leads = leads.filter((l) => l.channel === channel);

  const range = parseDayRange(req.query.from, req.query.to);
  if (range) leads = leads.filter((l) => new Date(l.createdAt) >= range.start && new Date(l.createdAt) < range.end);

  const q = String(req.query.q || '').trim().toLowerCase();
  if (q) leads = leads.filter((l) => [l.name, l.phone, l.email, l.detail, l.ref, l.convertedFrom, l.addedBy].some((v) => v && String(v).toLowerCase().includes(q)));
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length]));
  const status = String(req.query.status || '');
  if (STATUSES.includes(status)) leads = leads.filter((l) => l.status === status);

  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  res.json({ data: leads.slice((page - 1) * limit, page * limit), total: leads.length, page, limit, statusCounts });
};

async function findLead(req, res) {
  let def = byType[req.params.type];
  if (!def) {
    fail(res, 404, 'Unknown lead type.');
    return null;
  }
  await ensureBackfilled();
  const id = String(req.params.id);
  // Older links used the per-form record id; resolve those to the envelope that holds it. A mobile sign-in that
  // became an application keeps its id but changes type, so links from the WhatsApp alert still work.
  const lead =
    (await Lead.findOne({ _id: id, type: def.type })) ||
    (await Lead.find({ type: def.type })).find((l) => (l.refIds?.length ? l.refIds : [l.refId]).includes(id)) ||
    (await Lead.findById(id));
  if (lead && byType[lead.type]) def = byType[lead.type];
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

async function view(lead, req) {
  const events = await LeadEvent.find({ leadId: String(lead._id) }).lean();
  return {
    status: lead.status || 'new',
    assignedTo: lead.assignedTo || null,
    assignedName: lead.assignedName || null,
    stage: stageOf(lead),
    l1OwnerName: lead.l1Owner?.name || null,
    archived: Boolean(lead.archived),
    canEdit: canEdit(req, lead),
    notes: activity(events),
  };
}

const clean = (doc) => Object.fromEntries(Object.entries(doc).filter(([k]) => !HIDDEN_FIELDS.has(k)));

exports.get = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, lead } = found;
  await ensureRefs([lead]);
  res.setHeader('Cache-Control', 'no-store');
  // Sales follow progress only: no application fields, documents or customer account.
  if (isSales(req)) {
    return res.json({
      data: { lead: { ...row(lead, req), page: def.page || null, source: lead.source || null, consent: null }, fields: {}, submissions: [], customer: null, ...(await view(lead, req)) },
    });
  }
  const refs = lead.refIds?.length ? lead.refIds : [lead.refId];
  const docs = (await Promise.all(refs.map((ref) => def.model.findById(ref).lean()))).filter(Boolean).sort(byNewest);
  const customer = lead.userId ? await User.findById(lead.userId).lean() : null;
  // findLead has checked canSee, so private documents get short-lived links; the response is never cached.
  const by = { staffId: req.staff.id, staffName: req.staff.name || req.staff.email || null, role: req.staff.role, leadId: String(lead._id), leadType: def.type };
  res.json({
    data: {
      lead: { ...row(lead, req), page: def.page || null, source: lead.source || null, consent: lead.consent || null },
      fields: docs[0] ? withFileLinks(clean(docs[0]), by) : {},
      submissions: docs.map((d) => ({ id: String(d._id), createdAt: d.createdAt, fields: withFileLinks(clean(d), by) })),
      coApplicantFiles: withFileLinks(lead.coApplicantDocuments || {}, by),
      otherFiles: withFileLinks(lead.otherDocuments || [], by),
      customer: customer ? { id: String(customer._id), name: customer.user_Name || null, email: customer.user_Email || null, mobileVerified: Boolean(customer.mobileVerified) } : null,
      ...(await view(lead, req)),
    },
  });
};

exports.update = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const body = req.body || {};
  const note = String(body.note || '').trim().slice(0, 2000);
  const reason = String(body.reason || '').trim().slice(0, 2000);
  if (body.status !== undefined && !STATUSES.includes(body.status)) return fail(res, 400, 'Unknown status.');
  if (body.assignTo !== undefined && !isAdmin(req)) return fail(res, 403, 'Only admins can reassign leads.');
  if (body.archive !== undefined && !isAdmin(req)) return fail(res, 403, 'Only admins can archive leads.');
  if (body.stage !== undefined && !isAdmin(req)) return fail(res, 403, 'Only admins can move leads between levels.');
  if (body.stage !== undefined && !STAGES.includes(body.stage)) return fail(res, 400, 'Unknown level.');
  if (body.forward && body.sendBack) return fail(res, 400, 'Forward or send back, not both.');
  if (body.sendBack && !reason) return fail(res, 400, 'Say why you are sending it back.');

  // Read-modify-write in one transaction: a claim only succeeds if the lead is still unassigned, and
  // concurrent status, note, assignment and level changes cannot overwrite each other.
  const result = await transaction(async (tx) => {
    const lead = await Lead.findById(found.lead._id);
    if (!lead) return { error: [404, 'Lead not found.'] };
    if (!canEdit(req, lead)) return { error: [403, canSee(req, lead) ? 'You can view this lead but not change it.' : 'This lead belongs to another advisor.'] };
    const events = [];
    const assign = (id, name, data = {}) => {
      lead.assignedTo = id;
      lead.assignedName = name;
      addToHandled(lead, id);
      events.push(['lead.assigned', { to: id, name, ...data }]);
    };
    const unassign = () => {
      lead.assignedTo = null;
      lead.assignedName = null;
    };
    const moveTo = (to, type = 'lead.stage_changed') => {
      const from = stageOf(lead);
      if (from === 'l1' && to === 'l2' && lead.assignedTo) lead.l1Owner = { id: lead.assignedTo, name: lead.assignedName };
      lead.stage = to;
      events.push([type, { from, to }]);
    };

    if (body.stage !== undefined && body.stage !== stageOf(lead)) {
      moveTo(body.stage);
      unassign();
    }

    if (body.assignTo !== undefined) {
      if (body.assignTo) {
        const employee = await Employee.findOne({ _id: body.assignTo, deleteFlag: false }).lean();
        if (!employee) return { error: [400, 'That employee no longer exists.'] };
        const level = levelOf(personaOf(employee));
        if (!level) return { error: [400, "Sales executives can't be assigned leads."] };
        if (level !== stageOf(lead)) moveTo(level);
        assign(String(employee._id), employee.name);
      } else if (lead.assignedTo) {
        unassign();
        events.push(['lead.unassigned', {}]);
      }
    }

    // An employee who works an unassigned lead at their level takes ownership of it.
    if (!isAdmin(req) && !lead.assignedTo && (body.claim || body.status || note || body.forward || body.sendBack)) {
      assign(req.staff.id, req.staff.name, { claimed: true });
    }

    if (body.status && body.status !== lead.status) {
      events.push(['lead.status_changed', { from: lead.status, to: body.status }]);
      lead.status = body.status;
      lead.wonAt = body.status === 'won' ? new Date() : null;
    }
    if (note) events.push(['lead.note_added', { text: note }]);

    if (body.forward) {
      if (stageOf(lead) !== 'l1') return { error: [409, 'This lead is already with Operations L2.'] };
      if (!OPEN.has(lead.status || 'new')) return { error: [400, 'Only open leads can be forwarded.'] };
      moveTo('l2', 'lead.forwarded');
      unassign();
    }
    if (body.sendBack) {
      if (stageOf(lead) !== 'l2') return { error: [409, 'This lead is not with Operations L2.'] };
      lead.stage = 'l1';
      unassign();
      // Back to the L1 owner who forwarded it if they still work at L1, otherwise to the L1 pool.
      const owner = lead.l1Owner?.id ? await Employee.findOne({ _id: lead.l1Owner.id, deleteFlag: false }).lean() : null;
      const back = owner && personaOf(owner) === 'ops_l1' ? owner : null;
      if (back) {
        lead.assignedTo = String(back._id);
        lead.assignedName = back.name;
        addToHandled(lead, lead.assignedTo);
      }
      events.push(['lead.sent_back', { from: 'l2', to: 'l1', reason, assignedTo: back ? String(back._id) : null, name: back?.name || null }]);
    }

    if (body.archive !== undefined && Boolean(body.archive) !== Boolean(lead.archived)) {
      lead.archived = Boolean(body.archive);
      lead.archivedAt = lead.archived ? new Date() : null;
      lead.archivedBy = lead.archived ? req.staff.name || req.staff.email || null : null;
      events.push([lead.archived ? 'lead.archived' : 'lead.unarchived', {}]);
    }
    if (events.length) {
      lead.lastActivityAt = new Date();
      await lead.save();
      tx.afterCommit(async () => {
        for (const [type, data] of events) await emit(lead, type, staffActor(req), data);
      });
    }
    return { lead };
  });
  if (result.error) return fail(res, ...result.error);
  res.json({ data: await view(result.lead, req) });
};

exports.upload = async (req, res) => {
  if (req.rejectedFiles?.length) return fail(res, 400, 'Upload a PDF, JPG or PNG file of up to 4.4 MB.');
  const file = req.files?.file?.[0];
  if (!file?.location) return fail(res, 400, 'Choose a file to upload.');
  res.json({ token: uploadToken(file.location, req.staff.id) });
};

exports.remove = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, lead } = found;
  const files = [...storedValues(lead.coApplicantDocuments || {}), ...(lead.otherDocuments || []).map((d) => d.file).filter(Boolean)];
  for (const ref of lead.refIds?.length ? lead.refIds : [lead.refId]) {
    const removed = await def.model.findByIdAndDelete(ref).lean();
    if (removed) files.push(...storedValues(removed));
  }
  await LeadEvent.deleteMany({ leadId: String(lead._id) });
  await Lead.findByIdAndDelete(lead._id);
  // After the records are gone; only files created by the current storage provider are deleted (best effort).
  for (const value of files) await deleteStoredFile(value);
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
        const id = String(e._id);
        const theirs = leads.filter((l) => l.assignedTo === id);
        const added = leads.filter((l) => l.addedById === id);
        return {
          ...e,
          persona: personaOf(e),
          active: theirs.filter((l) => OPEN.has(l.status)).length,
          won: theirs.filter((l) => l.status === 'won').length,
          added: added.length,
          addedWon: added.filter((l) => l.status === 'won').length,
        };
      })
      .sort(byNewest),
  });
};

// The sign-in email follows the name and persona (jayesh.sales@probiz.com); a number is added on a clash.
async function freeStaffEmail(tx, name, persona) {
  for (let n = 1; n < 100; n++) {
    const email = staffEmail(name, persona, n);
    await tx.lock(`unique:employee:email:${email}`);
    const [employee, admin] = await Promise.all([
      Employee.findOne({ email: ci(email), deleteFlag: false }).lean(),
      Admin.findOne({ admin_Email: ci(email), deleteFlag: false }).lean(),
    ]);
    if (!employee && !admin) return email;
  }
  return null;
}

exports.addEmployee = async (req, res) => {
  const { name, email, mobile, employeeId, password } = req.body || {};
  const persona = req.body?.persona || 'ops_l1';
  if (!name || !mobile || !employeeId || !password) return fail(res, 400, 'Name, mobile, employee ID and password are all required.');
  if (!PERSONAS[persona]) return fail(res, 400, 'Choose sales, operations L1 or operations L2.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'Enter a valid email.');
  if (String(password).length < 8) return fail(res, 400, 'Use a password of at least 8 characters.');
  const idKey = String(employeeId).trim();
  const hash = bcrypt.hashSync(String(password), 10);
  // The duplicate check and the create run in one transaction locked on both values, so two requests with
  // the same email or ID cannot both succeed.
  const saved = await transaction(async (tx) => {
    let emailKey = email ? String(email).trim().toLowerCase() : null;
    await tx.lock(`unique:employee:employeeId:${idKey}`, emailKey && `unique:employee:email:${emailKey}`);
    if (!emailKey) emailKey = await freeStaffEmail(tx, name, persona);
    if (!emailKey) return null;
    const existing = await Employee.findOne({ deleteFlag: false, $or: [{ email: ci(emailKey) }, { employeeId: idKey }] }).lean();
    if (existing) return null;
    return Employee.create({
      name: String(name).trim(),
      email: emailKey,
      mobile: String(mobile).trim(),
      employeeId: idKey,
      roll: PERSONAS[persona].label,
      persona,
      password: hash,
    });
  });
  if (!saved) return fail(res, 409, 'An employee with that email or ID already exists.');
  const { password: _hash, ...data } = saved.toObject();
  res.status(201).json({ data });
};

// Changing persona would strand the leads they own at their current level, so those must be reassigned first.
exports.updateEmployee = async (req, res) => {
  const persona = String(req.body?.persona || '');
  if (!PERSONAS[persona]) return fail(res, 400, 'Choose sales, operations L1 or operations L2.');
  await ensureBackfilled();
  const result = await transaction(async (tx) => {
    await tx.lock(`employee:persona:${req.params.id}`);
    const target = await Employee.findOne({ _id: req.params.id, deleteFlag: false });
    if (!target) return { error: [404, 'Employee not found.'] };
    if (personaOf(target) === persona) return { target };
    const open = (await Lead.find({ assignedTo: String(target._id) }).lean()).filter((l) => !l.archived && OPEN.has(l.status || 'new'));
    if (open.length) {
      const n = open.length;
      return { error: [409, `${target.name} still owns ${n} open ${n === 1 ? 'lead' : 'leads'}. Reassign ${n === 1 ? 'it' : 'them'} first.`] };
    }
    target.persona = persona;
    target.roll = PERSONAS[persona].label;
    await target.save();
    return { target };
  });
  if (result.error) return fail(res, ...result.error);
  const { password, ...data } = result.target.toObject();
  res.json({ data: { ...data, persona: personaOf(data) } });
};

exports.setSalesTarget = async (req, res) => {
  const salesTarget = parseTarget(req.body);
  if (!salesTarget) return fail(res, 400, 'Targets must be whole numbers above 0, or left empty.');
  const target = await Employee.findOne({ _id: req.params.id, deleteFlag: false });
  if (!target) return fail(res, 404, 'Employee not found.');
  if (personaOf(target) !== 'sales') return fail(res, 400, 'Targets are only for sales executives.');
  target.salesTarget = salesTarget;
  await target.save();
  res.json({ data: { id: String(target._id), target: salesTarget } });
};

exports.removeEmployee = async (req, res) => {
  const target = await Employee.findOne({ _id: req.params.id, deleteFlag: false });
  if (!target) return fail(res, 404, 'Employee not found.');
  target.deleteFlag = true;
  await target.save();
  // Their open leads go back to the pool so nothing is stranded; each lead is re-read in its own transaction.
  await ensureBackfilled();
  const employeeId = String(target._id);
  const theirs = await Lead.find({ assignedTo: employeeId }).lean();
  for (const { _id } of theirs) {
    await transaction(async (tx) => {
      const lead = await Lead.findById(_id);
      if (!lead || lead.assignedTo !== employeeId || !OPEN.has(lead.status)) return;
      lead.assignedTo = null;
      lead.assignedName = null;
      await lead.save();
      tx.afterCommit(() => emit(lead, 'lead.unassigned', staffActor(req), { reason: `${target.name} left; moved back to the unassigned pool` }));
    });
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
  if (req.staff.platform) return fail(res, 400, 'The platform manager password is set with PLATFORM_MANAGER_PASSWORD.');
  const Model = isAdmin(req) ? Admin : Employee;
  const me = await Model.findById(req.staff.id);
  if (!me || !bcrypt.compareSync(current, me.password)) return fail(res, 400, 'Current password is wrong.');
  me.password = bcrypt.hashSync(next, 10);
  await me.save();
  res.json({ message: 'Password updated.' });
};

// The forwarded chain as received and the address the rate limits use; the admin's own request only.
exports.clientIp = (req, res) => {
  const { clientIp } = require('../leads/intake');
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    data: {
      forwardedFor: String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean),
      trustProxyHops: process.env.TRUST_PROXY_HOPS || null,
      resolved: clientIp(req),
    },
  });
};

// Who opened this lead's private documents (admins only). Equality filter only, sorted here: no Firestore index needed.
exports.documentAccess = async (req, res) => {
  const leadId = String(req.query.leadId || '').trim();
  if (!leadId) return fail(res, 400, 'leadId is required.');
  const rows = await DocumentAccess.find({ leadId }).lean();
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    data: rows
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .map((r) => ({ at: r.at, staffId: r.staffId, staffName: r.staffName, role: r.role, leadType: r.leadType, path: r.path, ip: r.ip })),
  });
};
