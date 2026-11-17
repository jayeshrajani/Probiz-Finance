// Lead references: one sequence for every lead, prefixed with the product code (server/admin/leads.js CODES).
const { transaction } = require('../odm');
const Counter = require('../models/counter.model');
const Lead = require('../models/lead.model');
const { byType } = require('../admin/leads');

const COUNTER = 'lead-ref';

const formatRef = (type, seq) => (seq ? `${byType[type]?.code || 'LD'}-${String(seq).padStart(6, '0')}` : null);

// Must run inside a transaction: the counter is locked, read and written with the caller's other writes.
async function nextSeq(tx) {
  await tx.lock(`counter:${COUNTER}`);
  const counter = (await Counter.findById(COUNTER)) || new Counter({ _id: COUNTER, value: 0 });
  counter.value = (counter.value || 0) + 1;
  await counter.save();
  return counter.value;
}

// Leads created before references existed get one the first time staff load them, oldest first.
async function ensureRefs(leads) {
  const missing = leads.filter((l) => !l.seq).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  for (const row of missing) {
    const assigned = await transaction(async (tx) => {
      await tx.lock(`lead:ref-assign:${row._id}`);
      const lead = await Lead.findById(row._id);
      if (!lead) return null;
      if (!lead.seq) {
        lead.seq = await nextSeq(tx);
        lead.ref = formatRef(lead.type, lead.seq);
        await lead.save();
      }
      return lead;
    });
    if (assigned) Object.assign(row, { seq: assigned.seq, ref: assigned.ref });
  }
  return leads;
}

module.exports = { formatRef, nextSeq, ensureRefs };
