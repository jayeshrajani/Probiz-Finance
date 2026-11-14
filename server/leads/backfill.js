// Creates Lead envelopes for per-form records that don't have one yet (rows from before the intake pipeline,
// or a save whose envelope step failed). Idempotent: keyed on type + per-form record id.
const db = require('../db');
const Lead = require('../models/lead.model');
const LeadEvent = require('../models/leadEvent.model');
const LeadMeta = require('../models/leadMeta.model');
const { LEAD_TYPES, summarize } = require('../admin/leads');

const normalizePhone = (v) => {
  const digits = String(v || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : null;
};

async function backfillLeads() {
  const [leads, metas] = await Promise.all([Lead.find({}).lean(), LeadMeta.find({}).lean()]);
  const known = new Set(leads.flatMap((l) => (l.refIds?.length ? l.refIds : [l.refId]).map((ref) => `${l.type}:${ref}`)));
  const metaFor = new Map(metas.map((m) => [`${m.type}:${m.leadId}`, m]));
  let created = 0;

  for (const def of LEAD_TYPES) {
    const docs = await def.model.find({}).lean();
    for (const doc of docs) {
      const refId = String(doc._id);
      if (known.has(`${def.type}:${refId}`)) continue;
      const s = summarize(def, doc);
      const meta = metaFor.get(`${def.type}:${refId}`);
      const phone = normalizePhone(s.phone);
      const at = new Date(doc.createdAt || Date.now());
      const lead = await Lead.create({
        type: def.type,
        formKey: def.formKey,
        refId,
        refIds: [refId],
        name: s.name ? String(s.name) : null,
        phone: phone || (s.phone ? String(s.phone) : null),
        email: s.email ? String(s.email) : null,
        amount: s.amount ? String(s.amount) : null,
        detail: s.detail ? String(s.detail).slice(0, 300) : null,
        status: meta?.status || 'new',
        assignedTo: meta?.assignedTo || null,
        assignedName: meta?.assignedName || null,
        source: { channel: 'legacy_import' },
        dedupeKey: phone ? `${def.type}:${phone}` : null,
        repeatCount: 0,
        lastActivityAt: at,
      });
      await db.query(`UPDATE "${Lead.tableName}" SET created_at = $2::timestamptz WHERE id = $1`, [lead._id, at.toISOString()]);
      await LeadEvent.create({ leadId: lead._id, type: 'lead.created', at, actor: { kind: 'system' }, data: { refId, source: { channel: 'legacy_import' } } });
      for (const note of meta?.notes || []) {
        await LeadEvent.create({ leadId: lead._id, type: 'lead.note_added', at: new Date(note.at), actor: { kind: 'staff', name: note.by }, data: { text: note.text } });
      }
      known.add(`${def.type}:${refId}`);
      created += 1;
    }
  }
  return { created };
}

// Runs once per server process before the first admin read.
let pending = null;
const ensureBackfilled = () =>
  (pending ||= backfillLeads().catch((err) => {
    pending = null;
    throw err;
  }));

module.exports = { backfillLeads, ensureBackfilled, normalizePhone };
