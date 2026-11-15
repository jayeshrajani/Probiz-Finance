// Date-range numbers for the admin dashboard: volume, conversion, where leads come from and how each advisor performs.
const { byType } = require('./leads');

const DAY = 24 * 60 * 60 * 1000;
const IST_OFFSET = 330 * 60 * 1000;
const PRESETS = new Set([7, 30, 90]);
const MAX_DAYS = 366;
const STALE_MS = 3 * DAY;
const OPEN = new Set(['new', 'contacted', 'in_progress']);
const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost'];
const CHANNEL_LABEL = { web_form: 'Website forms', assistant: 'Website assistant', staff: 'Added by staff', legacy_api: 'Older forms', legacy_import: 'Older forms' };
const OWN_HOST = /(^|\.)probizfinance\.com$/;

// Days are counted in India time so "today" matches the office.
const dayKey = (t) => new Date(t + IST_OFFSET).toISOString().slice(0, 10);
const dayStart = (key) => Date.parse(`${key}T00:00:00Z`) - IST_OFFSET;
const time = (v) => new Date(v).getTime();

// Inclusive YYYY-MM-DD dates in India time, at most a year apart; null when missing or invalid.
function parseDayRange(from, to) {
  const ymd = /^\d{4}-\d{2}-\d{2}$/;
  if (!ymd.test(String(from || '')) || !ymd.test(String(to || ''))) return null;
  const start = dayStart(from);
  const end = dayStart(to) + DAY;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end || end - start > MAX_DAYS * DAY) return null;
  return { start, end };
}

// ?days=7|30|90, or ?from=YYYY-MM-DD&to=YYYY-MM-DD (inclusive, up to a year). Defaults to the last 30 days.
function resolveRange(query = {}, now = Date.now()) {
  const custom = parseDayRange(query.from, query.to);
  if (custom) return { ...custom, from: String(query.from), to: String(query.to), days: Math.round((custom.end - custom.start) / DAY), preset: null };
  const days = PRESETS.has(Number(query.days)) ? Number(query.days) : 30;
  const end = dayStart(dayKey(now)) + DAY;
  const start = end - days * DAY;
  return { start, end, from: dayKey(start), to: dayKey(end - DAY), days, preset: days };
}

function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

function referrerHost(ref) {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '');
    return host && !OWN_HOST.test(host) ? host : null;
  } catch {
    return null;
  }
}

function pathOf(url) {
  if (!url) return null;
  try {
    return new URL(url, 'https://probizfinance.com').pathname;
  } catch {
    return null;
  }
}

function sourceLabel(lead) {
  const s = lead.source || {};
  const utm = s.utm || {};
  if (utm.source) return utm.medium ? `${utm.source} / ${utm.medium}` : utm.source;
  const host = referrerHost(s.referrer);
  if (host) return host;
  if (s.channel === 'staff') return 'Added by staff';
  if (s.channel === 'legacy_api' || s.channel === 'legacy_import' || !s.channel) return 'Older forms';
  return 'Direct';
}

function tally(leads, keyOf, limit) {
  const map = new Map();
  for (const lead of leads) {
    const key = keyOf(lead);
    if (!key) continue;
    const entry = map.get(key) || { label: key, total: 0, won: 0 };
    entry.total += 1;
    if (lead.status === 'won') entry.won += 1;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)).slice(0, limit);
}

// First staff action (status change or note) per lead: the moment someone actually worked it.
function firstContacts(events) {
  const first = new Map();
  for (const e of events) {
    if (e.actor?.kind !== 'staff') continue;
    const id = String(e.leadId);
    const at = time(e.at);
    const prev = first.get(id);
    if (!prev || at < prev.at) first.set(id, { at, by: e.actor.id ? String(e.actor.id) : null });
  }
  return first;
}

function analytics({ leads, events, employees, query, now = Date.now() }) {
  const range = resolveRange(query, now);
  const span = range.end - range.start;
  const created = (l) => time(l.createdAt);
  const inRange = leads.filter((l) => created(l) >= range.start && created(l) < range.end);
  const previous = leads.filter((l) => created(l) >= range.start - span && created(l) < range.start).length;
  const first = firstContacts(events);
  const responseMs = (l) => {
    const f = first.get(String(l._id));
    return f ? Math.max(0, f.at - created(l)) : null;
  };

  // Long ranges are grouped by week so the chart stays readable.
  const bucketDays = range.days > 90 ? 7 : 1;
  const series = [];
  for (let t = range.start; t < range.end; t += bucketDays * DAY) series.push({ date: dayKey(t), count: 0, won: 0 });
  for (const l of inRange) {
    const point = series[Math.floor((created(l) - range.start) / (bucketDays * DAY))];
    if (!point) continue;
    point.count += 1;
    if (l.status === 'won') point.won += 1;
  }

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, inRange.filter((l) => (l.status || 'new') === s).length]));
  const responses = inRange.map(responseMs).filter((v) => v !== null);

  const team = employees
    .map((e) => {
      const id = String(e._id);
      const theirs = leads.filter((l) => l.assignedTo === id);
      const theirsInRange = theirs.filter((l) => created(l) >= range.start && created(l) < range.end);
      const won = theirsInRange.filter((l) => l.status === 'won').length;
      const lost = theirsInRange.filter((l) => l.status === 'lost').length;
      const theirResponses = inRange
        .filter((l) => first.get(String(l._id))?.by === id)
        .map(responseMs)
        .filter((v) => v !== null);
      const open = theirs.filter((l) => OPEN.has(l.status || 'new'));
      return {
        id,
        name: e.name,
        assigned: theirsInRange.length,
        won,
        lost,
        conversion: theirsInRange.length ? won / theirsInRange.length : null,
        medianResponseMs: median(theirResponses),
        active: open.length,
        stale: open.filter((l) => now - time(l.lastActivityAt || l.createdAt) > STALE_MS).length,
      };
    })
    .sort((a, b) => b.assigned - a.assigned || b.active - a.active || a.name.localeCompare(b.name));

  const typeTotals = tally(inRange, (l) => l.type, 50).map((t) => ({
    type: t.label,
    label: byType[t.label]?.label || t.label,
    total: t.total,
    won: t.won,
    open: inRange.filter((l) => l.type === t.label && (l.status || 'new') === 'new').length,
  }));

  return {
    range: { ...range, bucketDays },
    totals: {
      leads: inRange.length,
      previous,
      won: statusCounts.won,
      lost: statusCounts.lost,
      conversion: inRange.length ? statusCounts.won / inRange.length : null,
      medianResponseMs: median(responses),
      uncontacted: inRange.filter((l) => (l.status || 'new') === 'new' && !first.has(String(l._id))).length,
    },
    statusCounts,
    series,
    byType: typeTotals,
    sources: {
      sources: tally(inRange, sourceLabel, 10),
      channels: tally(inRange, (l) => CHANNEL_LABEL[l.source?.channel] || 'Older forms', 10),
      campaigns: tally(inRange, (l) => l.source?.utm?.campaign || null, 10),
      pages: tally(inRange, (l) => pathOf(l.source?.landingPage || l.source?.page), 10),
    },
    team,
  };
}

module.exports = { analytics, dayKey, resolveRange, parseDayRange };
