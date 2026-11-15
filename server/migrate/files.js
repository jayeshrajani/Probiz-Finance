// `files` command: copies legacy public KYC documents into private Firebase Storage and rewrites the Firestore field
// to the `pf:` reference, only after the stored copy is read back and matches the source SHA-256 and size.
// Originals are never modified or deleted; the retirement report lists them for a separately approved step.
const fs = require('fs');
const path = require('path');
const { FieldPath, FieldValue } = require('firebase-admin/firestore');
const source = require('./source');
const { sha256, getPath } = require('./transform');
const { MANIFEST, entryId } = require('./manifest');
const { withRetry, pool } = require('./run');
const { detectFileType } = require('../storage/sniff');
const { objectPath, PRIVATE_PATH } = require('../storage/firebase');
const { getStorageBucket } = require('../firebase/admin');

const DOCUMENT_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;
const KEY_RE = /^(?:image|video)\/[A-Za-z0-9_-][A-Za-z0-9._-]*$/;
const LIST_LIMIT = 100;

// Legacy reference -> { kind, key }. Anything not produced by the legacy storage provider is left alone.
function classify(value, legacy) {
  if (typeof value !== 'string' || !value) return { kind: 'empty' };
  if (value.startsWith('pf:')) return { kind: 'private' };
  if (value.startsWith('/uploads/')) {
    const key = value.slice('/uploads/'.length);
    return KEY_RE.test(key) ? { kind: 'local', key } : { kind: 'unrecognised' };
  }
  if (legacy.supabasePrefix && value.startsWith(legacy.supabasePrefix)) {
    const key = value.slice(legacy.supabasePrefix.length);
    return KEY_RE.test(key) ? { kind: 'supabase', key } : { kind: 'unrecognised' };
  }
  return { kind: 'unrecognised' };
}

class SourceError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

function readLocal(root, key) {
  if (!root) throw new SourceError('local uploads folder not found');
  const target = path.resolve(root, ...key.split('/'));
  if (!target.startsWith(root + path.sep)) throw new SourceError('outside the uploads folder');
  let stat;
  try {
    stat = fs.lstatSync(target);
  } catch {
    throw new SourceError('source file not found');
  }
  if (!stat.isFile()) throw new SourceError('not a regular file');
  if (stat.size > MAX_BYTES) throw new SourceError('larger than 10 MB');
  return fs.readFileSync(target);
}

// Public, unauthenticated GET of a legacy object; no redirects, bounded size and time.
async function readRemote(prefix, key) {
  let res;
  try {
    res = await fetch(prefix + key, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  } catch {
    throw new SourceError('download failed');
  }
  if (res.status === 404 || res.status === 400) throw new SourceError('source file not found');
  if (!res.ok) throw new SourceError(`download failed (HTTP ${res.status})`);
  if (Number(res.headers.get('content-length')) > MAX_BYTES) throw new SourceError('larger than 10 MB');
  const chunks = [];
  let size = 0;
  for await (const chunk of res.body) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new SourceError('larger than 10 MB');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

const detect = (bytes) => {
  for (const mime of DOCUMENT_TYPES) {
    const found = detectFileType(bytes, mime, DOCUMENT_TYPES);
    if (found) return found;
  }
  return null;
};

// String leaves under `uploadedDocuments` (the 19 private document forms): [{ field: [...path], value }].
function documentRefs(data) {
  const out = [];
  const walk = (value, at) => {
    if (typeof value === 'string') out.push({ field: at, value });
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...at, String(i)]));
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, [...at, k]);
  };
  walk(data?.uploadedDocuments, ['uploadedDocuments']);
  return out;
}

async function processRef(ctx, legacy, table, row, ref, stats) {
  const { kind, key } = classify(ref.value, legacy);
  if (kind === 'empty') return;
  if (kind === 'private') { stats.alreadyPrivate += 1; return; }
  const record = { collection: table, docId: row.id, field: ref.field.join('.') };
  const note = (bucket, reason) => {
    stats[bucket] += 1;
    if (stats.lists[bucket] && stats.lists[bucket].length < LIST_LIMIT) stats.lists[bucket].push(reason ? { ...record, reason } : record);
  };
  if (kind === 'unrecognised') return note('refused', 'not a file stored by the legacy provider (left unchanged)');
  if (kind === 'supabase' && !legacy.supabasePrefix) return note('refused', 'legacy bucket URL not configured');
  if (ref.field.some((p) => /^\d+$/.test(p))) return note('refused', 'file reference inside an array (not supported)');

  const id = entryId(table, row.id, ref.field, ref.value);
  const mref = ctx.db.collection(MANIFEST).doc(id);
  const tref = ctx.db.collection(table).doc(row.id);
  const [entrySnap, targetSnap] = await withRetry(() => ctx.db.getAll(mref, tref));
  ctx.meter.reads += 2;
  const entry = entrySnap.exists ? entrySnap.data() : null;
  if (!targetSnap.exists) return note('skipped', 'record not migrated yet (run the data command first)');
  const current = getPath(targetSnap.data(), ref.field);
  if (entry?.status === 'migrated' && current === entry.pfRef) { stats.alreadyMigrated += 1; return; }
  if (current !== ref.value) return note('skipped', 'the Firestore field differs from the source (left unchanged)');

  let bytes;
  try {
    bytes = kind === 'local' ? readLocal(legacy.uploadsRoot, key) : await readRemote(legacy.supabasePrefix, key);
  } catch (err) {
    if (err instanceof SourceError) return note('failed', err.reason);
    throw err;
  }
  const type = detect(bytes);
  if (!type) return note('refused', 'content is not a PNG, JPEG or PDF document');
  const hash = sha256(bytes);
  if (entry && (entry.sha256 !== hash || entry.size !== bytes.length)) return note('failed', 'source file changed since an earlier run (left unchanged)');
  if (!ctx.apply) { stats.toMigrate += 1; stats.bytes += bytes.length; return; }
  // Up to 4 writes per file and 4 files in flight.
  if (ctx.budget.left < 16) { stats.stoppedAtBudget = true; return; }

  const objectName = entry?.objectPath || objectPath('private', type.ext);
  if (!PRIVATE_PATH.test(objectName)) throw new Error('Unexpected private object path.');
  if (!entry) {
    await withRetry(() => mref.create({
      collection: table, docId: row.id, field: ref.field, legacySource: kind, legacyKey: key,
      legacyRefSha256: sha256(ref.value), objectPath: objectName, sha256: hash, size: bytes.length, contentType: type.mime,
      status: 'pending', createdAt: FieldValue.serverTimestamp(),
    }));
    ctx.budget.used += 1;
    ctx.meter.writes += 1;
  }

  const file = getStorageBucket().file(objectName);
  const [exists] = await file.exists();
  if (!exists) {
    await file.save(bytes, {
      resumable: false,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: {
        contentType: type.mime,
        cacheControl: 'private, no-store',
        metadata: { originalName: path.posix.basename(key).slice(0, 100), sha256: hash, migratedFrom: `legacy-${kind}` },
      },
    });
  }
  const [stored] = await file.download();
  if (stored.length !== bytes.length || sha256(stored) !== hash) {
    await withRetry(() => mref.update({ status: 'verify-failed', updatedAt: FieldValue.serverTimestamp() }));
    ctx.budget.used += 1;
    ctx.meter.writes += 1;
    return note('failed', 'stored copy does not match the source (reference not changed)');
  }

  const pfRef = `pf:${objectName}`;
  const outcome = await withRetry(() => ctx.db.runTransaction(async (t) => {
    const [doc] = await t.getAll(tref);
    if (!doc.exists || getPath(doc.data(), ref.field) !== ref.value) return 'changed';
    t.update(tref, new FieldPath(...ref.field), pfRef);
    t.update(mref, { status: 'migrated', pfRef, verifiedAt: FieldValue.serverTimestamp(), migratedAt: FieldValue.serverTimestamp() });
    return 'migrated';
  }));
  ctx.meter.reads += 1;
  if (outcome !== 'migrated') return note('skipped', 'the Firestore field changed during the run (copy kept, reference not changed)');
  ctx.budget.used += 2;
  ctx.meter.writes += 2;
  stats.migrated += 1;
  stats.bytes += bytes.length;
}

async function runFiles(ctx, legacy) {
  const tables = new Set(await source.listTables());
  const selected = [...ctx.models.values()]
    .filter((M) => M.$fields.uploadedDocuments && tables.has(M.tableName))
    .filter((M) => !ctx.collections || ctx.collections.includes(M.tableName))
    .map((M) => M.tableName)
    .sort();
  const stats = {
    references: 0, toMigrate: 0, migrated: 0, alreadyMigrated: 0, alreadyPrivate: 0, refused: 0, failed: 0, skipped: 0, bytes: 0,
    stoppedAtBudget: false, lists: { refused: [], failed: [], skipped: [] },
  };
  for (const table of selected) {
    let after = null;
    for (;;) {
      const rows = await source.readPage(table, after, ctx.batchSize);
      if (!rows.length) break;
      after = rows[rows.length - 1].id;
      const work = rows.flatMap((row) => documentRefs(row.data).map((ref) => ({ row, ref })));
      stats.references += work.filter((w) => classify(w.ref.value, legacy).kind !== 'empty').length;
      await pool(work, 4, ({ row, ref }) => (stats.stoppedAtBudget ? null : processRef(ctx, legacy, table, row, ref, stats)));
      if (stats.stoppedAtBudget) break;
    }
    ctx.log(`[files] ${table}: ${ctx.apply ? `migrated ${stats.migrated}` : `to migrate ${stats.toMigrate}`}, already ${stats.alreadyMigrated + stats.alreadyPrivate}, refused ${stats.refused}, failed ${stats.failed}, skipped ${stats.skipped} (running totals)`);
    if (stats.stoppedAtBudget) break;
  }
  return { collections: selected, ...stats };
}

// Every manifest entry, for the retirement report. Only verified, rewritten files may be secured or deleted.
async function retirementList(ctx) {
  const snap = await withRetry(() => ctx.db.collection(MANIFEST).get());
  ctx.meter.reads += Math.max(1, snap.size);
  const ready = [];
  const keep = [];
  for (const doc of snap.docs) {
    const e = doc.data();
    const item = {
      legacySource: e.legacySource, legacyKey: e.legacyKey, collection: e.collection, docId: e.docId, field: e.field.join('.'),
      sha256: e.sha256, size: e.size, status: e.status,
      migratedAt: e.migratedAt ? e.migratedAt.toDate().toISOString() : null,
    };
    (e.status === 'migrated' ? ready : keep).push(item);
  }
  const order = (a, b) => (a.legacyKey < b.legacyKey ? -1 : a.legacyKey > b.legacyKey ? 1 : 0);
  return { ready: ready.sort(order), keep: keep.sort(order) };
}

module.exports = { runFiles, retirementList, classify, documentRefs };
