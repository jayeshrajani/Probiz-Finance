// Monthly sales targets: only leads a sales executive added that converted this month (India time) count.
const IST_OFFSET = 330 * 60 * 1000;

const monthKey = (t) => new Date(t + IST_OFFSET).toISOString().slice(0, 7);
const amountOf = (v) => {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
// wonAt is set when a lead converts; conversions from before it existed fall back to their last activity.
const wonTime = (l) => new Date(l.wonAt || l.lastActivityAt || l.updatedAt || l.createdAt).getTime();
const targetOf = (employee) => ({ leads: employee?.salesTarget?.leads ?? null, amount: employee?.salesTarget?.amount ?? null });

function salesProgress(leads, employee, now = Date.now()) {
  const id = String(employee._id);
  const month = monthKey(now);
  const won = leads.filter((l) => !l.archived && l.status === 'won' && l.source?.addedBy?.id === id && monthKey(wonTime(l)) === month);
  return { id, name: employee.name, month, target: targetOf(employee), won: won.length, wonAmount: won.reduce((n, l) => n + amountOf(l.amount), 0) };
}

// Each target is optional: a whole number above 0, or empty to switch that tracker off. null when invalid.
function parseTarget(body = {}) {
  const out = {};
  for (const [key, max] of [['leads', 100000], ['amount', 1e12]]) {
    const v = body[key];
    if (v === null || v === undefined || v === '') {
      out[key] = null;
      continue;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > max) return null;
    out[key] = n;
  }
  return out;
}

module.exports = { salesProgress, parseTarget, targetOf };
