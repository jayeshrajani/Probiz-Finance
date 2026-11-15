// Source row -> Firestore document, using the same conversion as the Firestore adapter (server/data/firestore.js),
// plus the reported transforms from the migration plan (section 4).
const { createHash } = require('crypto');
const { Timestamp } = require('firebase-admin/firestore');
const { toStored, lowercaseCopies } = require('../data/firestore');

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const MAX_DOC_BYTES = 1000000; // a little under Firestore's 1 MiB document limit

// Values that must stay unique, as enforced by the ODM (`unique: true`) and the account controllers.
const EXTRA_UNIQUE = {
  admin: [{ field: 'admin_Email', ci: true }],
  employee: [{ field: 'email', ci: true, active: true }, { field: 'employeeId', active: true }],
  user: [{ field: 'user_Email', ci: true }, { field: 'mobile_no' }],
};

function uniqueRules(Model) {
  const rules = [...(EXTRA_UNIQUE[Model.tableName] || [])];
  for (const [field, spec] of Object.entries(Model.$fields)) {
    if (spec.unique && !rules.some((r) => r.field === field)) rules.push({ field });
  }
  return rules;
}

function timestampFromMicros(us) {
  const n = BigInt(us);
  let seconds = n / 1000000n;
  let micros = n % 1000000n;
  if (micros < 0n) {
    micros += 1000000n;
    seconds -= 1n;
  }
  return new Timestamp(Number(seconds), Number(micros) * 1000);
}

// Stable text form: sorted keys, timestamps as seconds.nanoseconds.
function canonical(value) {
  if (value instanceof Timestamp) return `{"$ts":"${value.seconds}.${String(value.nanoseconds).padStart(9, '0')}"}`;
  if (value instanceof Date) return canonical(Timestamp.fromDate(value));
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

const docHash = (doc) => sha256(canonical(doc));

const getPath = (obj, parts) => parts.reduce((cur, p) => (cur == null ? undefined : cur[p]), obj);
function setPath(obj, parts, value) {
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p];
  cur[parts[parts.length - 1]] = value;
}

// Firestore rejects these IDs and field names, so such records are reported instead of written.
const validId = (id) => typeof id === 'string' && id.length > 0 && !id.includes('/') && id !== '.' && id !== '..' &&
  !/^__.*__$/.test(id) && Buffer.byteLength(id) <= 1500;

function invalidFieldName(value, depth = 0) {
  if (depth > 18) return 'nesting deeper than Firestore allows';
  if (Array.isArray(value)) {
    for (const v of value) {
      if (Array.isArray(v)) return 'array directly inside an array';
      const bad = invalidFieldName(v, depth + 1);
      if (bad) return bad;
    }
    return null;
  }
  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Timestamp)) {
    for (const [k, v] of Object.entries(value)) {
      if (k === '' || /^__.*__$/.test(k)) return 'reserved or empty field name';
      const bad = invalidFieldName(v, depth + 1);
      if (bad) return bad;
    }
  }
  return null;
}

// fileMap: Map(docId -> [{ field: ['uploadedDocuments', 'panCard'], legacyRefSha256, pfRef }]) from _migration_files.
function toTarget(Model, row, fileMap) {
  const data = JSON.parse(JSON.stringify(row.data || {}));
  let filesMapped = 0;
  for (const entry of (fileMap && fileMap.get(row.id)) || []) {
    const current = getPath(data, entry.field);
    if (typeof current === 'string' && sha256(current) === entry.legacyRefSha256) {
      setPath(data, entry.field, entry.pfRef);
      filesMapped += 1;
    }
  }
  const json = toStored(Model, data);
  const nullsFilled = Object.keys(json).filter((k) => !(k in data)).length;
  const createdAt = timestampFromMicros(row.created_us);
  let lastActivityFilled = false;
  if (Model.tableName === 'lead' && json.lastActivityAt == null) {
    json.lastActivityAt = createdAt;
    lastActivityFilled = true;
  }
  const lc = lowercaseCopies(Model, json);
  const doc = { ...json, ...(Object.keys(lc).length ? { _lc: lc } : {}), createdAt, updatedAt: timestampFromMicros(row.updated_us) };

  let invalid = null;
  if (!validId(row.id)) invalid = 'document ID not allowed in Firestore';
  else if (Buffer.byteLength(canonical(doc)) > MAX_DOC_BYTES) invalid = 'document larger than 1 MB';
  else invalid = invalidFieldName(doc);
  return { id: row.id, doc, hash: invalid ? null : docHash(doc), invalid, nullsFilled, lastActivityFilled, filesMapped };
}

// Report-only schema check: the application already accepted these records, so violations never block the copy.
function schemaErrors(Model, row) {
  const err = new Model({ ...(row.data || {}), _id: row.id }).validateSync();
  return err ? Object.keys(err.errors) : [];
}

function maskValue(value) {
  const s = String(value ?? '');
  const at = s.indexOf('@');
  if (at > 0) {
    const [user, domain] = [s.slice(0, at), s.slice(at + 1)];
    const dot = domain.lastIndexOf('.');
    return `${user[0]}***@${domain[0] || ''}***${dot > 0 ? domain.slice(dot) : ''}`;
  }
  return s.length > 4 ? `${'*'.repeat(Math.min(6, s.length - 4))}${s.slice(-4)}` : '****';
}

module.exports = {
  sha256, canonical, docHash, timestampFromMicros, toTarget, schemaErrors, uniqueRules, maskValue, getPath, validId,
};
