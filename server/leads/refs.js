// Lead references: product code + that code's own sequence (server/admin/leads.js CODES), e.g. HL0001, PL0001.
const { transaction } = require('../odm');
const Counter = require('../models/counter.model');
const Lead = require('../models/lead.model');
const { byType } = require('../admin/leads');

const COUNTER = 'lead-ref';

const codeOf = (type) => byType[type]?.code || 'LD';
const formatRef = (type, seq) => (seq ? `${codeOf(type)}${String(seq).padStart(4, '0')}` : null);
// Also false for refs from the earlier single shared sequence (HL-000042), so those are renumbered.
const hasRef = (lead) => Boolean(lead.seq && lead.ref === formatRef(lead.type, lead.seq));

// Must run inside a transaction: the code's counter is locked, read and written with the caller's other writes.
async function nextSeq(tx, type) {
  const id = `${COUNTER}:${codeOf(type)}`;
  await tx.lock(`counter:${id}`);
  const counter = (await Counter.findById(id)) || new Counter({ _id: id, value: 0 });
  counter.value = (counter.value || 0) + 1;
  await counter.save();
  return counter.value;
}

// Leads created before references existed get one the first time staff load them, oldest first.
async function ensureRefs(leads) {
  const missing = leads.filter((l) => !hasRef(l)).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  for (const row of missing) {
    const assigned = await transaction(async (tx) => {
      await tx.lock(`lead:ref-assign:${row._id}`);
      const lead = await Lead.findById(row._id);
      if (!lead) return null;
      if (!hasRef(lead)) {
        lead.seq = await nextSeq(tx, lead.type);
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
