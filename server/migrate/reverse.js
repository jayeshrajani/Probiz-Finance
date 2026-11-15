// `data --direction=to-postgres` and `verify --direction=to-postgres`: copies Firestore documents back into
// Postgres/PGlite for a rollback (with --since for the post-cutover window). Same IDs and timestamps as Firestore;
// existing rows are never overwritten unless the Firestore copy is newer and --update-older is set.
const { FieldPath, Timestamp } = require('firebase-admin/firestore');
const db = require('../db');
const source = require('./source');
const { canonical, sha256, getPath, timestampFromMicros } = require('./transform');
const { loadFileMap } = require('./manifest');
const { referenceIssues, sourceReader } = require('./verify');
const { withRetry } = require('./run');

const LIST_LIMIT = 50;

const micros = (ts) => (ts instanceof Timestamp ? (BigInt(ts.seconds) * 1000000n + BigInt(Math.floor(ts.nanoseconds / 1000))).toString() : null);

// Microsecond ISO text, so timestamptz keeps the full precision.
function isoMicros(us) {
  const n = BigInt(us);
  const base = new Date(Number(n / 1000000n) * 1000).toISOString().slice(0, 19);
  return `${base}.${String(n % 1000000n).padStart(6, '0')}Z`;
}

// Values as the Postgres adapter stores them: JSON with dates as ISO strings.
function toJson(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toJson);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJson(v)]));
  return value;
}

function toRow(snap) {
  const { createdAt, updatedAt, _lc, ...data } = snap.data();
  const row = { id: snap.id, data: toJson(data), created_us: micros(createdAt), updated_us: micros(updatedAt) };
  if (!row.created_us || !row.updated_us) row.invalid = 'missing createdAt or updatedAt';
  return row;
}

const rowKey = (row) => canonical({ data: row.data, c: String(row.created_us), u: String(row.updated_us) });

// Postgres rows still holding a legacy file URL that the file migration replaced with a `pf:` reference.
function withFileRefs(row, fileMap) {
  const entries = fileMap.get(row.id);
  if (!entries) return row;
  const data = JSON.parse(JSON.stringify(row.data || {}));
  for (const e of entries) {
    const parent = getPath(data, e.field.slice(0, -1));
    const key = e.field[e.field.length - 1];
    if (parent && typeof parent[key] === 'string' && sha256(parent[key]) === e.legacyRefSha256) parent[key] = e.pfRef;
  }
  return { ...row, data };
}

function classify(src, tgt, fileMap) {
  if (!tgt) return 'missing';
  const key = rowKey(src);
  if (key === rowKey(tgt)) return 'unchanged';
  if (key === rowKey(withFileRefs(tgt, fileMap))) return 'fileRefs';
  return BigInt(src.updated_us) > BigInt(tgt.updated_us) ? 'sourceNewer' : 'targetNewer';
}

function collectionsFor(ctx) {
  const all = [...ctx.models.keys()].sort();
  if (!ctx.collections) return all;
  const unknown = ctx.collections.filter((t) => !ctx.models.has(t));
  if (unknown.length) throw new Error(`Unknown collection(s): ${unknown.join(', ')}`);
  return all.filter((t) => ctx.collections.includes(t));
}

function pageQuery(ctx, coll, cursor) {
  if (ctx.since) {
    let q = coll.where('updatedAt', '>', Timestamp.fromDate(new Date(ctx.since))).orderBy('updatedAt').orderBy(FieldPath.documentId());
    if (cursor) q = q.startAfter(timestampFromMicros(cursor.updatedUs), cursor.id);
    return q.limit(ctx.batchSize);
  }
  let q = coll.orderBy(FieldPath.documentId());
  if (cursor) q = q.startAfter(cursor.id);
  return q.limit(ctx.batchSize);
}

async function targetRows(table, ids, tables) {
  if (!tables.has(table)) return new Map();
  return new Map((await source.readByIds(table, ids)).map((r) => [r.id, r]));
}

const q = (t) => `"${t.replace(/[^a-z0-9_]/g, '')}"`;

async function writeRows(table, items) {
  return db.transaction(async (run) => {
    for (const i of items) {
      const params = [i.src.id, JSON.stringify(i.src.data), isoMicros(i.src.created_us), isoMicros(i.src.updated_us)];
      if (i.state === 'missing') {
        const done = await run(`INSERT INTO ${q(table)} (id, data, created_at, updated_at) VALUES ($1, $2::text::jsonb, $3::timestamptz, $4::timestamptz)
          ON CONFLICT (id) DO NOTHING RETURNING id`, params);
        i.state = done.length ? 'created' : 'targetNewer';
      } else {
        // Optimistic: only replaces the row that was compared.
        const done = await run(`UPDATE ${q(table)} SET data = $2::text::jsonb, created_at = $3::timestamptz, updated_at = $4::timestamptz
          WHERE id = $1 AND (extract(epoch from updated_at) * 1000000)::bigint::text = $5 RETURNING id`, [...params, String(i.tgt.updated_us)]);
        i.state = done.length ? (i.state === 'fileRefs' ? 'fileRefsUpdated' : 'updated') : 'targetNewer';
      }
    }
  });
}

const newStats = () => ({
  sourceDocs: 0, missing: 0, created: 0, unchanged: 0, fileRefs: 0, fileRefsUpdated: 0, updated: 0, sourceNewer: 0, targetNewer: 0, invalid: 0,
  conflicts: [], invalidRecords: [],
});

async function reverseCollection(ctx, table, tables) {
  const stats = newStats();
  const saved = ctx.checkpoint.get(table);
  if (ctx.resume && saved.done) {
    stats.skipped = 'completed in an earlier run (checkpoint)';
    return stats;
  }
  let cursor = ctx.resume ? saved.lastId && { id: saved.lastId, updatedUs: saved.lastUpdatedUs } : null;
  if (cursor) stats.resumed = true;
  const coll = ctx.db.collection(table);
  const fileMap = await loadFileMap(ctx.db, table, ctx.meter);
  for (;;) {
    if (ctx.readBudget.left < ctx.batchSize) {
      stats.stoppedAtBudget = true;
      return stats;
    }
    const snap = await withRetry(() => pageQuery(ctx, coll, cursor).get());
    ctx.meter.reads += Math.max(1, snap.size);
    ctx.readBudget.used += Math.max(1, snap.size);
    if (!snap.size) break;
    const items = snap.docs.map((d) => ({ src: toRow(d) }));
    const existing = await targetRows(table, items.map((i) => i.src.id), tables);
    for (const i of items) {
      i.tgt = existing.get(i.src.id) || null;
      i.state = i.src.invalid ? 'invalid' : classify(i.src, i.tgt, fileMap);
    }
    const writes = items.filter((i) => i.state === 'missing' || i.state === 'fileRefs' || (i.state === 'sourceNewer' && ctx.updateOlder));
    if (ctx.apply && writes.length) {
      if (!tables.has(table)) {
        await db.ensureTable(table);
        tables.add(table);
      }
      await writeRows(table, writes);
    }
    for (const i of items) {
      stats.sourceDocs += 1;
      stats[i.state] += 1;
      if ((i.state === 'sourceNewer' || i.state === 'targetNewer') && stats.conflicts.length < LIST_LIMIT) {
        stats.conflicts.push({ id: i.src.id, newer: i.state === 'sourceNewer' ? 'firestore' : 'postgres' });
      }
      if (i.state === 'invalid' && stats.invalidRecords.length < LIST_LIMIT) stats.invalidRecords.push({ id: i.src.id, reason: i.src.invalid });
    }
    const last = items[items.length - 1].src;
    cursor = { id: last.id, updatedUs: last.updated_us };
    if (ctx.apply) ctx.checkpoint.set(table, { lastId: cursor.id, lastUpdatedUs: cursor.updatedUs, done: false });
    ctx.log(`[reverse] ${table}: ${stats.sourceDocs} docs | ${ctx.apply ? `created ${stats.created}, updated ${stats.updated + stats.fileRefsUpdated}` : `to create ${stats.missing}, file refs to update ${stats.fileRefs}`}, unchanged ${stats.unchanged}, conflicts ${stats.sourceNewer + stats.targetNewer}`);
    if (snap.size < ctx.batchSize) break;
  }
  if (ctx.apply) ctx.checkpoint.set(table, { lastId: cursor?.id || null, lastUpdatedUs: cursor?.updatedUs || null, done: true });
  return stats;
}

async function runReverse(ctx) {
  const selected = collectionsFor(ctx);
  const tables = new Set(await source.listTables());
  const resumed = ctx.apply && ctx.resume ? ctx.checkpoint.load() : false;
  const collections = {};
  let stoppedAt = null;
  for (const table of selected) {
    const stats = await reverseCollection(ctx, table, tables);
    if (stats.sourceDocs || stats.skipped || stats.stoppedAtBudget) collections[table] = stats;
    if (stats.stoppedAtBudget) {
      stoppedAt = table;
      break;
    }
  }
  const keys = ['sourceDocs', 'missing', 'created', 'unchanged', 'fileRefs', 'fileRefsUpdated', 'updated', 'sourceNewer', 'targetNewer', 'invalid'];
  const totals = Object.fromEntries(keys.map((k) => [k, Object.values(collections).reduce((n, s) => n + (s[k] || 0), 0)]));
  return {
    direction: 'to-postgres',
    checkpointResumed: resumed,
    collections,
    totals,
    stoppedAtBudget: stoppedAt,
    notStarted: stoppedAt ? selected.slice(selected.indexOf(stoppedAt) + 1) : [],
    writesNeeded: totals.missing + totals.fileRefs + (ctx.updateOlder ? totals.sourceNewer : 0),
  };
}

// Rollback check: every Firestore document is in Postgres with the same content and timestamps.
async function runReverseVerify(ctx, { sample = 50, compareIds = false } = {}) {
  const { idDiff, targetReader } = require('./verify');
  const tables = new Set(await source.listTables());
  const collections = {};
  const failures = [];
  const review = [];
  let legacyRefs = 0;
  for (const table of collectionsFor(ctx)) {
    const coll = ctx.db.collection(table);
    const firestoreCount = (await withRetry(() => coll.count().get())).data().count;
    ctx.meter.reads += Math.max(1, Math.ceil(firestoreCount / 1000));
    const postgresCount = tables.has(table) ? await source.countRows(table) : 0;
    if (!firestoreCount && !postgresCount) continue;
    const snap = await withRetry(() => coll.orderBy(FieldPath.documentId()).limit(sample).get());
    ctx.meter.reads += Math.max(1, snap.size);
    const rows = snap.docs.map(toRow).filter((r) => !r.invalid);
    const existing = await targetRows(table, rows.map((r) => r.id), tables);
    const fileMap = await loadFileMap(ctx.db, table, ctx.meter);
    const missing = [];
    const different = [];
    let fileRefs = 0;
    for (const r of rows) {
      const state = classify(r, existing.get(r.id) || null, fileMap);
      if (state === 'missing') missing.push(r.id);
      else if (state === 'fileRefs') fileRefs += 1;
      else if (state !== 'unchanged') different.push(r.id);
    }
    legacyRefs += fileRefs;
    collections[table] = {
      firestoreCount, postgresCount, sampled: rows.length, sampleMissing: missing.slice(0, LIST_LIMIT), sampleDifferent: different.slice(0, LIST_LIMIT), legacyFileRefs: fileRefs,
    };
    if (compareIds) {
      const ids = idDiff(await targetReader(ctx.db, ctx.meter).ids(table), tables.has(table) ? await source.allIds(table) : new Set());
      collections[table].ids = ids;
      if (ids.missingInTarget) failures.push(`${table}: ${ids.missingInTarget} Firestore document(s) missing in Postgres`);
      if (ids.extraInTarget) review.push(`${table}: ${ids.extraInTarget} Postgres row(s) not in Firestore (deleted in Firestore after the cutover?)`);
    }
    if (postgresCount < firestoreCount) failures.push(`${table}: Postgres has fewer rows than Firestore`);
    if (missing.length || different.length) failures.push(`${table}: ${missing.length} sampled row(s) missing, ${different.length} different`);
    ctx.log(`[verify] ${table}: firestore ${firestoreCount}, postgres ${postgresCount}, sample ${rows.length} (missing ${missing.length}, different ${different.length}, legacy file refs ${fileRefs})`);
  }
  const { targetReader: firestoreReader } = require('./verify');
  const firestoreIssues = new Set((await referenceIssues(firestoreReader(ctx.db, ctx.meter))).issues);
  const postgresIssues = (await referenceIssues(sourceReader)).issues;
  const introduced = postgresIssues.filter((i) => !firestoreIssues.has(i));
  if (introduced.length) failures.push(`${introduced.length} broken reference(s) in Postgres that Firestore does not have`);
  const admins = tables.has('admin') ? (await source.fieldValues('admin', 'deleteFlag')).filter((r) => r.value !== true).length : 0;
  if (!admins) failures.push('no active admin in Postgres');
  return {
    direction: 'to-postgres',
    collections,
    references: { introduced: introduced.slice(0, LIST_LIMIT), postgresIssues: postgresIssues.length, firestoreIssues: firestoreIssues.size },
    activeAdmins: admins,
    // Rows still pointing at legacy public file URLs: after the legacy originals are retired these links break,
    // so a rollback must then copy the `pf:` references too (run without --since for the document collections).
    legacyFileRefs: legacyRefs,
    review,
    failures,
    ok: failures.length === 0,
  };
}

module.exports = { runReverse, runReverseVerify, toRow, isoMicros };
