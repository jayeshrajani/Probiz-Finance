// `_migration_files`: one document per migrated file reference (collection, record, field, legacy value).
// It holds hashes, sizes, object paths and status only; no file contents and no personal data.
const { sha256 } = require('./transform');

const MANIFEST = '_migration_files';

const entryId = (collection, docId, field, legacyRef) => sha256(`${collection}\n${docId}\n${field.join('.')}\n${sha256(legacyRef)}`);

// Map(docId -> [{ field, legacyRefSha256, pfRef }]) of verified, rewritten files for one collection.
async function loadFileMap(db, collection, meter) {
  const snap = await db.collection(MANIFEST).where('collection', '==', collection).get();
  meter.reads += Math.max(1, snap.size);
  const map = new Map();
  for (const doc of snap.docs) {
    const e = doc.data();
    if (e.status !== 'migrated' || !e.pfRef) continue;
    if (!map.has(e.docId)) map.set(e.docId, []);
    map.get(e.docId).push({ field: e.field, legacyRefSha256: e.legacyRefSha256, pfRef: e.pfRef });
  }
  return map;
}

module.exports = { MANIFEST, entryId, loadFileMap };
