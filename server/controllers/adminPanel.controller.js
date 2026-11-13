const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model');
const LeadMeta = require('../models/leadMeta.model');
const User = require('../models/user.model');
const Property = require('../models/property.model');
const Newsletter = require('../models/newslatter.model');
const { LEAD_TYPES, GROUPS, byType, summarize } = require('../admin/leads');

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost'];
const DAY = 24 * 60 * 60 * 1000;
const HIDDEN_FIELDS = new Set(['_id', '__v', 'password', 'deleteFlag']);

const metaKey = (type, id) => `${type}:${id}`;

async function loadMetas(types) {
  const metas = await LeadMeta.find(types ? { type: { $in: types } } : {}).lean();
  return new Map(metas.map((meta) => [metaKey(meta.type, meta.leadId), meta]));
}

async function loadSummaries(defs) {
  const lists = await Promise.all(defs.map(async (def) => (await def.model.find({}).lean()).map((doc) => summarize(def, doc))));
  return lists.flat();
}

const withStatus = (rows, metas) =>
  rows.map((row) => ({ ...row, status: metas.get(metaKey(row.type, row.id))?.status || 'new' }));

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

exports.me = (req, res) => res.json({ data: req.admin });

exports.config = (req, res) =>
  res.json({
    data: {
      statuses: STATUSES,
      groups: GROUPS,
      types: LEAD_TYPES.map(({ type, label, group, page }) => ({ type, label, group, page: page || null })),
    },
  });

exports.overview = async (req, res) => {
  const [rows, metas, users, properties, subscribers] = await Promise.all([
    loadSummaries(LEAD_TYPES),
    loadMetas(),
    User.countDocuments({ deleteFlag: false }),
    Property.countDocuments({}),
    Newsletter.countDocuments({}),
  ]);
  const leads = withStatus(rows, metas);
  const now = Date.now();
  const age = (row) => now - new Date(row.createdAt).getTime();

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * DAY);
    return { date: date.toISOString().slice(0, 10), count: 0 };
  });
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  const perType = new Map();
  for (const row of leads) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    if (dayIndex.has(key)) days[dayIndex.get(key)].count += 1;
    const entry = perType.get(row.type) || { type: row.type, label: row.typeLabel, total: 0, open: 0 };
    entry.total += 1;
    if (row.status === 'new') entry.open += 1;
    perType.set(row.type, entry);
  }
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length]));

  res.json({
    data: {
      totals: {
        leads: leads.length,
        last7: leads.filter((l) => age(l) <= 7 * DAY).length,
        last30: leads.filter((l) => age(l) <= 30 * DAY).length,
        open: statusCounts.new,
        users,
        properties,
        subscribers,
      },
      statusCounts,
      daily: days,
      byType: [...perType.values()].sort((a, b) => b.total - a.total),
      recent: leads.sort(byNewest).slice(0, 8),
    },
  });
};

exports.list = async (req, res) => {
  const type = String(req.query.type || 'all');
  const defs = type === 'all' ? LEAD_TYPES : byType[type] ? [byType[type]] : null;
  if (!defs) return res.status(404).json({ message: 'Unknown lead type.', status: 404 });

  const [rows, metas] = await Promise.all([loadSummaries(defs), loadMetas(type === 'all' ? null : [type])]);
  let leads = withStatus(rows, metas).sort(byNewest);

  const q = String(req.query.q || '').trim().toLowerCase();
  if (q) leads = leads.filter((l) => [l.name, l.phone, l.email, l.detail].some((v) => v && String(v).toLowerCase().includes(q)));
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length]));
  const status = String(req.query.status || '');
  if (STATUSES.includes(status)) leads = leads.filter((l) => l.status === status);

  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  res.json({
    data: leads.slice((page - 1) * limit, page * limit),
    total: leads.length,
    page,
    limit,
    statusCounts,
  });
};

async function findLead(req, res) {
  const def = byType[req.params.type];
  if (!def) {
    res.status(404).json({ message: 'Unknown lead type.', status: 404 });
    return null;
  }
  const doc = await def.model.findById(req.params.id).lean();
  if (!doc) {
    res.status(404).json({ message: 'Lead not found.', status: 404 });
    return null;
  }
  return { def, doc };
}

exports.get = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, doc } = found;
  const meta = await LeadMeta.findOne({ type: def.type, leadId: String(doc._id) }).lean();
  const fields = Object.fromEntries(Object.entries(doc).filter(([k]) => !HIDDEN_FIELDS.has(k)));
  res.json({
    data: {
      lead: { ...summarize(def, doc), status: meta?.status || 'new', page: def.page || null },
      fields,
      notes: (meta?.notes || []).slice().reverse(),
    },
  });
};

exports.update = async (req, res) => {
  const found = await findLead(req, res);
  if (!found) return;
  const { def, doc } = found;
  const status = req.body?.status;
  const note = String(req.body?.note || '').trim().slice(0, 2000);
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Unknown status.', status: 400 });
  }
  const leadId = String(doc._id);
  let meta = await LeadMeta.findOne({ type: def.type, leadId });
  if (!meta) meta = new LeadMeta({ type: def.type, leadId, status: 'new', notes: [] });
  const by = req.admin.admin_Name || req.admin.admin_Email;
  if (status && status !== meta.status) {
    meta.notes = [...(meta.notes || []), { text: `Status changed to ${status.replace('_', ' ')}`, by, at: new Date() }];
    meta.status = status;
  }
  if (note) meta.notes = [...(meta.notes || []), { text: note, by, at: new Date() }];
  await meta.save();
  res.json({ data: { status: meta.status, notes: (meta.notes || []).slice().reverse() } });
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
  if (String(req.params.id) === String(req.admin._id)) {
    return res.status(400).json({ message: "You can't remove your own account.", status: 400 });
  }
  const target = await Admin.findOne({ _id: req.params.id, deleteFlag: false });
  if (!target) return res.status(404).json({ message: 'Admin not found.', status: 404 });
  target.deleteFlag = true;
  await target.save();
  res.json({ message: 'Admin removed.' });
};

exports.changePassword = async (req, res) => {
  const current = String(req.body?.current || '');
  const next = String(req.body?.next || '');
  if (next.length < 8) return res.status(400).json({ message: 'Use at least 8 characters.', status: 400 });
  const me = await Admin.findById(req.admin._id);
  if (!me || !bcrypt.compareSync(current, me.password)) {
    return res.status(400).json({ message: 'Current password is wrong.', status: 400 });
  }
  me.password = bcrypt.hashSync(next, 10);
  await me.save();
  res.json({ message: 'Password updated.' });
};
