// Value casting and field-path helpers shared by the ODM and both persistence adapters.
const { inspect } = require('util');

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

// Messages keep the Mongoose wording (some API responses return them); logs show field paths only, never submitted values.
function hideValuesInLogs(err, summary) {
  Object.defineProperty(err, inspect.custom, {
    value: () => [summary, ...String(err.stack || '').split('\n').slice(1)].join('\n'),
  });
  return err;
}

class CastError extends Error {
  constructor(kind, value, path) {
    const shown = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    super(`Cast to ${kind} failed for value ${shown} (type ${typeof value}) at path "${path}"`);
    this.name = 'CastError';
    this.kind = kind;
    this.path = path;
    this.value = value;
    hideValuesInLogs(this, `CastError: cast to ${kind} failed at path "${path}" (value hidden)`);
  }
}

const unwrapSingle = (v) => (Array.isArray(v) && v.length === 1 ? v[0] : v);
const TRUE_VALUES = [true, 'true', 1, '1', 'yes'];
const FALSE_VALUES = [false, 'false', 0, '0', 'no'];

function castScalar(field, raw, path) {
  if (raw === undefined || raw === null) return raw;
  const value = unwrapSingle(raw);
  switch (field.kind) {
    case 'string': {
      if (typeof value === 'object' && !(value instanceof Date)) throw new CastError('string', value, path);
      let s = String(value);
      if (field.trim) s = s.trim();
      if (field.lowercase) s = s.toLowerCase();
      if (field.uppercase) s = s.toUpperCase();
      return s;
    }
    case 'number': {
      if (value === '') return null;
      const n = typeof value === 'string' ? Number(value.trim()) : Number(value);
      if (typeof value === 'object' || Number.isNaN(n)) throw new CastError('Number', value, path);
      return n;
    }
    case 'boolean':
      if (value === '') return null;
      if (TRUE_VALUES.includes(value)) return true;
      if (FALSE_VALUES.includes(value)) return false;
      throw new CastError('Boolean', value, path);
    case 'date': {
      if (value === '') return null;
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) throw new CastError('date', value, path);
      return d;
    }
    case 'objectid':
      if (value === '') return null;
      if (isPlainObject(value) || (value && typeof value === 'object' && value._id)) return String(value._id);
      return String(value);
    default:
      return raw;
  }
}

function fieldAt(fields, path) {
  let current = { kind: 'nested', fields };
  for (const part of path.split('.')) {
    if (current.kind === 'array') current = current.of;
    if (/^\d+$/.test(part) && current.kind === 'array') continue;
    if (current.kind !== 'nested' || !current.fields[part]) return { kind: 'mixed' };
    current = current.fields[part];
  }
  return current;
}

// Rejects anything but word characters, `$` and `-` per segment, so paths are safe in SQL and Firestore.
function checkPath(path) {
  const parts = path.split('.');
  for (const p of parts) if (!/^[\w$-]+$/.test(p)) throw new Error(`Invalid field path: ${path}`);
  return parts;
}

const COLUMN_PATHS = { _id: 'id', id: 'id', createdAt: 'created_at', updatedAt: 'updated_at' };

function toJsonValue(field, value, path) {
  if (value instanceof Date) return value.toISOString();
  if (field.kind === 'mixed' || field.kind === 'nested') return value;
  const kind = field.kind === 'array' ? field.of : field;
  try {
    const v = castScalar(kind, value, path);
    return v instanceof Date ? v.toISOString() : v;
  } catch {
    return value;
  }
}

module.exports = { isPlainObject, CastError, castScalar, fieldAt, checkPath, COLUMN_PATHS, toJsonValue, hideValuesInLogs };
