// Minimal Mongoose-compatible ODM backed by Postgres: one table per model, documents stored as JSONB.
// Supports the subset of the Mongoose API used by server/controllers.
const { randomUUID } = require('crypto');
const db = require('./db');

const OBJECT_ID = 'ObjectId';
const MIXED = 'Mixed';

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

// A function (not a class) because some models call `mongoose.Schema({...})` without `new`.
function Schema(definition = {}, options = {}) {
  if (!(this instanceof Schema)) return new Schema(definition, options);
  this.options = options;
  this.timestamps = Boolean(options.timestamps);
  this.fields = compileFields(definition);
}
Schema.ObjectId = OBJECT_ID;
Schema.Types = { ObjectId: OBJECT_ID, Mixed: MIXED, String, Number, Boolean, Date };

function kindOf(type) {
  if (type === String || /^string$/i.test(type)) return 'string';
  if (type === Number || /^number$/i.test(type)) return 'number';
  if (type === Boolean || /^boolean$/i.test(type)) return 'boolean';
  if (type === Date || /^date$/i.test(type)) return 'date';
  if (type === OBJECT_ID || /^objectid$/i.test(type)) return 'objectid';
  return 'mixed';
}

function compileFields(definition) {
  const fields = {};
  for (const [key, spec] of Object.entries(definition)) fields[key] = compileField(spec);
  return fields;
}

function compileField(spec) {
  if (spec instanceof Schema) return { kind: 'nested', fields: spec.fields };
  if (Array.isArray(spec)) return { kind: 'array', of: spec.length ? compileField(spec[0]) : { kind: 'mixed' } };
  if (isPlainObject(spec)) {
    const t = spec.type;
    const isTypeDecl = t !== undefined && !(isPlainObject(t) && t.type !== undefined);
    if (!isTypeDecl) return { kind: 'nested', fields: compileFields(spec) };
    const { type, ...options } = spec;
    return { ...compileField(type), ...options };
  }
  if (spec === Object) return { kind: 'mixed' };
  return { kind: kindOf(spec) };
}

class CastError extends Error {
  constructor(kind, value, path) {
    const shown = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    super(`Cast to ${kind} failed for value ${shown} (type ${typeof value}) at path "${path}"`);
    this.name = 'CastError';
    this.kind = kind;
    this.path = path;
    this.value = value;
  }
}

class ValidationError extends Error {
  constructor(modelName, errors) {
    const list = Object.values(errors);
    super(`${modelName} validation failed: ${list.map((e) => `${e.path}: ${e.message}`).join(', ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
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

// Casts `input` against `fields`; unknown keys are dropped (Mongoose strict mode).
function castObject(fields, input, prefix, opts, errors) {
  const out = {};
  for (const [key, field] of Object.entries(fields)) {
    const path = prefix ? `${prefix}.${key}` : key;
    let value = input ? input[key] : undefined;
    if (value === undefined && opts.defaults) {
      if ('default' in field) {
        value = typeof field.default === 'function' ? field.default.call(opts.doc) : clone(field.default);
      } else if (field.kind === 'array') {
        value = [];
      }
    }
    const casted = castValue(field, value, path, opts, errors);
    if (casted !== undefined) out[key] = casted;
  }
  return out;
}

function castValue(field, value, path, opts, errors) {
  try {
    if (field.kind === 'nested') {
      if (value === null) return null;
      if (value !== undefined && !isPlainObject(value) && typeof value !== 'object') {
        throw new CastError('Embedded', value, path);
      }
      const nested = castObject(field.fields, value || {}, path, opts, errors);
      return Object.keys(nested).length || value !== undefined ? nested : undefined;
    }
    if (field.kind === 'array') {
      if (value === undefined || value === null) return value;
      const list = Array.isArray(value) ? value : [value];
      return list.map((item, i) => castValue(field.of, item, `${path}.${i}`, opts, errors));
    }
    return castScalar(field, value, path);
  } catch (err) {
    if (!(err instanceof CastError)) throw err;
    errors[path] = { name: 'CastError', kind: err.kind, path, value, message: err.message };
    return undefined;
  }
}

function clone(v) {
  if (v instanceof Date) return new Date(v.getTime());
  if (Array.isArray(v)) return v.map(clone);
  if (isPlainObject(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)]));
  return v;
}

const optionValue = (opt) => (Array.isArray(opt) ? opt[0] : opt);
const optionMessage = (opt, fallback) => (Array.isArray(opt) && opt[1]) || (opt && opt.message) || fallback;

function validateFields(fields, data, prefix, doc, errors) {
  for (const [key, field] of Object.entries(fields)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (errors[path]) continue;
    const value = data ? data[key] : undefined;
    let required = optionValue(field.required);
    if (typeof required === 'function') required = required.call(doc);
    const missing = field.kind === 'string' ? value == null || value === '' : value == null;
    if (required && missing) {
      errors[path] = { name: 'ValidatorError', kind: 'required', path, value,
        message: optionMessage(field.required, `Path \`${path}\` is required.`) };
      continue;
    }
    if (value == null) continue;
    if (field.kind === 'nested') validateFields(field.fields, value, path, doc, errors);
    if (field.kind === 'array' && field.of.kind === 'nested') {
      value.forEach((item, i) => validateFields(field.of.fields, item, `${path}.${i}`, doc, errors));
    }
    if (field.enum && field.kind === 'string') {
      const values = Array.isArray(field.enum) ? field.enum : field.enum.values;
      if (!values.includes(value)) {
        errors[path] = { name: 'ValidatorError', kind: 'enum', path, value,
          message: (!Array.isArray(field.enum) && field.enum.message) ||
            `\`${value}\` is not a valid enum value for path \`${path}\`.` };
        continue;
      }
    }
    if (field.match && field.kind === 'string' && value !== '') {
      const re = optionValue(field.match);
      if (!re.test(value)) {
        errors[path] = { name: 'ValidatorError', kind: 'regexp', path, value,
          message: optionMessage(field.match, `Path \`${path}\` is invalid (${value}).`) };
        continue;
      }
    }
    if (field.kind === 'number') {
      const min = optionValue(field.min);
      const max = optionValue(field.max);
      if (min != null && value < min) {
        errors[path] = { name: 'ValidatorError', kind: 'min', path, value,
          message: optionMessage(field.min, `Path \`${path}\` (${value}) is less than minimum allowed value (${min}).`) };
      } else if (max != null && value > max) {
        errors[path] = { name: 'ValidatorError', kind: 'max', path, value,
          message: optionMessage(field.max, `Path \`${path}\` (${value}) is more than maximum allowed value (${max}).`) };
      }
    }
  }
}

// ---------- SQL helpers ----------

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

function jsonPath(path) {
  const parts = path.split('.');
  for (const p of parts) if (!/^[\w$-]+$/.test(p)) throw new Error(`Invalid field path: ${path}`);
  return `'{${parts.map((p) => `"${p}"`).join(',')}}'`;
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

function buildWhere(filter, fields, params) {
  const add = (v) => { params.push(v); return `$${params.length}`; };
  const clauses = [];
  for (const [key, value] of Object.entries(filter || {})) {
    if (value === undefined) continue;
    if (key === '$or' || key === '$and' || key === '$nor') {
      const parts = value.map((f) => `(${buildWhere(f, fields, params)})`);
      if (!parts.length) continue;
      const joined = parts.join(key === '$and' ? ' AND ' : ' OR ');
      clauses.push(key === '$nor' ? `NOT (${joined})` : `(${joined})`);
      continue;
    }
    clauses.push(condition(key, value, fields, add));
  }
  return clauses.length ? clauses.join(' AND ') : 'TRUE';
}

function condition(key, value, fields, add) {
  const column = COLUMN_PATHS[key];
  const field = column ? { kind: column === 'id' ? 'id' : 'date' } : fieldAt(fields, key);
  const json = column ? null : `(data #> ${jsonPath(key)})`;
  const text = column ? `${column}::text` : `(data #>> ${jsonPath(key)})`;

  const eq = (v) => {
    if (column === 'id') return v == null ? 'FALSE' : `id = ${add(String(v._id || v))}`;
    if (column) return v == null ? 'FALSE' : `${column} = ${add(new Date(v).toISOString())}::timestamptz`;
    if (v === null) return `(${json} IS NULL OR ${json} = 'null'::jsonb)`;
    const jv = toJsonValue(field, v, key);
    if (field.kind === 'array' && !Array.isArray(v)) return `COALESCE(${json} @> ${add(JSON.stringify([jv]))}::text::jsonb, FALSE)`;
    return `COALESCE(${json} = ${add(JSON.stringify(jv))}::text::jsonb, FALSE)`;
  };
  const regex = (re, options = '') => {
    const source = re instanceof RegExp ? re.source : String(re);
    const flags = re instanceof RegExp ? re.flags : options;
    return `COALESCE(${text} ${flags.includes('i') ? '~*' : '~'} ${add(source)}, FALSE)`;
  };
  const compare = (op, v) => {
    if (column === 'id') return `id ${op} ${add(String(v))}`;
    if (column) return `${column} ${op} ${add(new Date(v).toISOString())}::timestamptz`;
    if (field.kind === 'number') {
      return `COALESCE(CASE WHEN jsonb_typeof(${json}) = 'number' THEN (${text})::numeric END ${op} ${add(String(Number(v)))}::numeric, FALSE)`;
    }
    if (field.kind === 'date') {
      const d = v instanceof Date ? v : new Date(v);
      return `COALESCE(CASE WHEN jsonb_typeof(${json}) = 'string' THEN (${text})::timestamptz END ${op} ${add(d.toISOString())}::timestamptz, FALSE)`;
    }
    return `COALESCE(${text} ${op} ${add(String(v))}, FALSE)`;
  };

  if (value instanceof RegExp) return regex(value);
  if (!isPlainObject(value) || !Object.keys(value).some((k) => k.startsWith('$'))) return eq(value);

  const parts = [];
  for (const [op, v] of Object.entries(value)) {
    switch (op) {
      case '$eq': parts.push(eq(v)); break;
      case '$ne': parts.push(`NOT (${eq(v)})`); break;
      case '$in': parts.push(v.length ? `(${v.map(eq).join(' OR ')})` : 'FALSE'); break;
      case '$nin': parts.push(v.length ? `NOT (${v.map(eq).join(' OR ')})` : 'TRUE'); break;
      case '$gt': parts.push(compare('>', v)); break;
      case '$gte': parts.push(compare('>=', v)); break;
      case '$lt': parts.push(compare('<', v)); break;
      case '$lte': parts.push(compare('<=', v)); break;
      case '$regex': parts.push(regex(v, value.$options)); break;
      case '$options': break;
      case '$exists':
        parts.push(column ? (v ? 'TRUE' : 'FALSE') : `${json} IS ${v ? 'NOT ' : ''}NULL`);
        break;
      default: throw new Error(`Unsupported query operator ${op}`);
    }
  }
  return parts.length ? parts.join(' AND ') : 'TRUE';
}

function buildOrder(sort) {
  if (!sort) return 'created_at ASC, id ASC';
  const entries = typeof sort === 'string'
    ? sort.split(/\s+/).filter(Boolean).map((k) => (k.startsWith('-') ? [k.slice(1), -1] : [k, 1]))
    : Object.entries(sort);
  const parts = entries.map(([key, dir]) => {
    const desc = dir === -1 || dir === '-1' || /^desc/i.test(String(dir));
    const col = key === '_id' || key === 'id' ? 'created_at' : COLUMN_PATHS[key] || `(data #> ${jsonPath(key)})`;
    return `${col} ${desc ? 'DESC' : 'ASC'}`;
  });
  return [...parts, 'id ASC'].join(', ');
}

function applyProjection(obj, projection) {
  if (!projection) return obj;
  const spec = typeof projection === 'string'
    ? Object.fromEntries(projection.split(/\s+/).filter(Boolean).map((k) => (k.startsWith('-') ? [k.slice(1), 0] : [k, 1])))
    : projection;
  const include = Object.entries(spec).filter(([k, v]) => v && k !== '_id').map(([k]) => k);
  if (include.length) {
    for (const k of Object.keys(obj)) if (k !== '_id' && !include.includes(k)) delete obj[k];
  } else {
    for (const [k, v] of Object.entries(spec)) if (!v) delete obj[k];
  }
  return obj;
}

function setPath(target, path, value) {
  const parts = path.split('.');
  let cur = target;
  for (const p of parts.slice(0, -1)) {
    if (!isPlainObject(cur[p]) && !Array.isArray(cur[p])) cur[p] = {};
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (value === undefined) delete cur[last];
  else cur[last] = value;
}

function getPath(target, path) {
  return path.split('.').reduce((cur, p) => (cur == null ? undefined : cur[p]), target);
}

function applyUpdate(doc, update) {
  for (const [key, value] of Object.entries(update || {})) {
    if (key === '$set') for (const [p, v] of Object.entries(value)) setPath(doc, p, v);
    else if (key === '$unset') for (const p of Object.keys(value)) setPath(doc, p, undefined);
    else if (key === '$inc') for (const [p, v] of Object.entries(value)) setPath(doc, p, (Number(getPath(doc, p)) || 0) + v);
    else if (key === '$push') {
      for (const [p, v] of Object.entries(value)) {
        const list = Array.isArray(getPath(doc, p)) ? getPath(doc, p) : [];
        setPath(doc, p, [...list, ...(v && v.$each ? v.$each : [v])]);
      }
    } else if (key === '$pull') {
      for (const [p, v] of Object.entries(value)) {
        const list = Array.isArray(getPath(doc, p)) ? getPath(doc, p) : [];
        setPath(doc, p, list.filter((x) => String(x) !== String(v)));
      }
    } else if (key.startsWith('$')) throw new Error(`Unsupported update operator ${key}`);
    else if (key !== '_id') setPath(doc, key, value);
  }
}

// ---------- Models ----------

const tableName = (name) =>
  name.trim().replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();

function model(modelName, schema) {
  const table = tableName(modelName);
  const { fields } = schema;

  class Document {
    constructor(data = {}) {
      Object.defineProperties(this, {
        $isNew: { value: true, writable: true },
        $errors: { value: {}, writable: true },
        $partial: { value: false, writable: true },
      });
      this._id = data._id ? String(data._id) : randomUUID();
      Object.assign(this, castObject(fields, data, '', { defaults: true, doc: this }, this.$errors));
      if (schema.timestamps) {
        if (data.createdAt) this.createdAt = new Date(data.createdAt);
        if (data.updatedAt) this.updatedAt = new Date(data.updatedAt);
      }
    }

    get id() {
      return this._id;
    }

    $data() {
      const errors = {};
      for (const [path, err] of Object.entries(this.$errors)) {
        if (getPath(this, path) === undefined) errors[path] = err;
      }
      const data = castObject(fields, this, '', { defaults: false, doc: this }, errors);
      return { data, errors };
    }

    validateSync() {
      const { data, errors } = this.$data();
      validateFields(fields, data, '', this, errors);
      return Object.keys(errors).length ? new ValidationError(modelName, errors) : undefined;
    }

    async validate() {
      const err = this.validateSync();
      if (err) throw err;
    }

    async save(options = {}) {
      const { data, errors } = this.$data();
      if (options.validateBeforeSave !== false) validateFields(fields, data, '', this, errors);
      if (Object.keys(errors).length) throw new ValidationError(modelName, errors);
      await checkUnique(this._id, data);
      await db.ensureTable(table);
      const json = JSON.stringify(data);
      // ::text::jsonb stops postgres.js from JSON-encoding the already-serialized string again.
      const rows = this.$isNew
        ? await db.query(`INSERT INTO "${table}" (id, data) VALUES ($1, $2::text::jsonb) RETURNING created_at, updated_at`, [this._id, json])
        : await db.query(
          `UPDATE "${table}" SET data = ${this.$partial ? 'data || $2::text::jsonb' : '$2::text::jsonb'}, updated_at = now() WHERE id = $1 RETURNING created_at, updated_at`,
          [this._id, json],
        );
      Object.assign(this, data);
      if (schema.timestamps && rows[0]) {
        this.createdAt = new Date(rows[0].created_at);
        this.updatedAt = new Date(rows[0].updated_at);
      }
      this.$isNew = false;
      this.$errors = {};
      return this;
    }

    async deleteOne() {
      await db.ensureTable(table);
      await db.query(`DELETE FROM "${table}" WHERE id = $1`, [this._id]);
      return this;
    }

    toObject() {
      const out = {};
      for (const [k, v] of Object.entries(this)) out[k] = clone(v);
      return out;
    }

    toJSON() {
      return this.toObject();
    }

    static $hydrate(row, lean) {
      const doc = new Document({ ...row.data, _id: row.id, createdAt: row.created_at, updatedAt: row.updated_at });
      doc.$isNew = false;
      doc.$errors = {};
      return lean ? doc.toObject() : doc;
    }

    static find(filter = {}, projection) {
      return new Query(Document, 'find', filter, projection);
    }

    static findOne(filter = {}, projection) {
      return new Query(Document, 'findOne', filter, projection);
    }

    static findById(id, projection) {
      return new Query(Document, 'findOne', id == null ? null : { _id: id }, projection);
    }

    static countDocuments(filter = {}) {
      return new Query(Document, 'count', filter);
    }

    static estimatedDocumentCount() {
      return new Query(Document, 'count', {});
    }

    static async exists(filter) {
      const doc = await Document.findOne(filter).lean();
      return doc ? { _id: doc._id } : null;
    }

    static async create(data) {
      if (Array.isArray(data)) return Promise.all(data.map((d) => new Document(d).save()));
      return new Document(data).save();
    }

    static insertMany(list) {
      return Document.create(list);
    }

    static findByIdAndUpdate(id, update, options) {
      return new Query(Document, 'update', id == null ? null : { _id: id }, null, { update, options });
    }

    static findOneAndUpdate(filter, update, options) {
      return new Query(Document, 'update', filter, null, { update, options });
    }

    static updateOne(filter, update, options) {
      return new Query(Document, 'updateMany', filter, null, { update, options, limit: 1 });
    }

    static updateMany(filter, update, options) {
      return new Query(Document, 'updateMany', filter, null, { update, options });
    }

    static findByIdAndDelete(id) {
      return new Query(Document, 'delete', id == null ? null : { _id: id });
    }

    static findOneAndDelete(filter) {
      return new Query(Document, 'delete', filter);
    }

    static deleteOne(filter) {
      return new Query(Document, 'deleteMany', filter, null, { limit: 1 });
    }

    static deleteMany(filter) {
      return new Query(Document, 'deleteMany', filter);
    }
  }

  async function checkUnique(id, data) {
    for (const [key, field] of Object.entries(fields)) {
      if (!field.unique || data[key] == null) continue;
      await db.ensureTable(table);
      const params = [id];
      const where = buildWhere({ [key]: data[key] }, fields, params);
      const rows = await db.query(`SELECT 1 FROM "${table}" WHERE id <> $1 AND ${where} LIMIT 1`, params);
      if (rows.length) {
        const err = new Error(`E11000 duplicate key error collection: ${table} index: ${key}_1 dup key: { ${key}: ${JSON.stringify(data[key])} }`);
        err.name = 'MongoServerError';
        err.code = 11000;
        err.keyValue = { [key]: data[key] };
        throw err;
      }
    }
  }

  Object.defineProperty(Document, 'name', { value: modelName });
  Document.modelName = modelName;
  Document.tableName = table;
  Document.schema = schema;
  Document.$fields = fields;
  return Document;
}

class Query {
  constructor(Model, op, filter, projection, extra = {}) {
    this.Model = Model;
    this.op = op;
    this.filter = filter;
    this.projection = projection;
    this.extra = extra;
    this.sortSpec = null;
    this.skipN = 0;
    this.limitN = extra.limit || null;
    this.isLean = false;
  }

  sort(spec) { this.sortSpec = spec; return this; }
  skip(n) { this.skipN = Number(n) || 0; return this; }
  limit(n) { this.limitN = Number(n) || null; return this; }
  select(spec) { this.projection = spec; return this; }
  lean() { this.isLean = true; return this; }
  populate() { return this; }

  then(resolve, reject) { return this.exec().then(resolve, reject); }
  catch(reject) { return this.exec().catch(reject); }
  finally(fn) { return this.exec().finally(fn); }

  async rows(single) {
    if (this.filter === null) return [];
    const { Model } = this;
    await db.ensureTable(Model.tableName);
    const params = [];
    const where = buildWhere(this.filter, Model.$fields, params);
    let sql = `SELECT id, data, created_at, updated_at FROM "${Model.tableName}" WHERE ${where} ORDER BY ${buildOrder(this.sortSpec)}`;
    const limit = single ? 1 : this.limitN;
    if (limit) sql += ` LIMIT ${Number(limit)}`;
    if (this.skipN) sql += ` OFFSET ${Number(this.skipN)}`;
    return db.query(sql, params);
  }

  hydrate(row) {
    const doc = this.Model.$hydrate(row, this.isLean);
    if (this.projection) {
      applyProjection(doc, this.projection);
      if (!this.isLean) doc.$partial = true;
    }
    return doc;
  }

  async exec() {
    const { Model, op } = this;
    switch (op) {
      case 'find':
        return (await this.rows(false)).map((r) => this.hydrate(r));
      case 'findOne': {
        const [row] = await this.rows(true);
        return row ? this.hydrate(row) : null;
      }
      case 'count': {
        await db.ensureTable(Model.tableName);
        const params = [];
        const where = buildWhere(this.filter, Model.$fields, params);
        const [row] = await db.query(`SELECT count(*)::int AS n FROM "${Model.tableName}" WHERE ${where}`, params);
        return Number(row.n);
      }
      case 'update': {
        const [row] = await this.rows(true);
        if (!row) return null;
        const doc = Model.$hydrate(row, false);
        const before = this.isLean ? doc.toObject() : Model.$hydrate(row, false);
        applyUpdate(doc, this.extra.update);
        const opts = this.extra.options || {};
        if (opts.runValidators) await doc.validate();
        await doc.save({ validateBeforeSave: false });
        const result = opts.new || opts.returnDocument === 'after' ? doc : before;
        return this.isLean && result.toObject ? result.toObject() : result;
      }
      case 'updateMany': {
        const rows = await this.rows(false);
        for (const row of rows) {
          const doc = Model.$hydrate(row, false);
          applyUpdate(doc, this.extra.update);
          await doc.save({ validateBeforeSave: false });
        }
        return { acknowledged: true, matchedCount: rows.length, modifiedCount: rows.length };
      }
      case 'delete': {
        const [row] = await this.rows(true);
        if (!row) return null;
        await db.query(`DELETE FROM "${Model.tableName}" WHERE id = $1`, [row.id]);
        return this.hydrate(row);
      }
      case 'deleteMany': {
        const rows = await this.rows(false);
        for (const row of rows) await db.query(`DELETE FROM "${Model.tableName}" WHERE id = $1`, [row.id]);
        return { acknowledged: true, deletedCount: rows.length };
      }
      default:
        throw new Error(`Unknown query op ${op}`);
    }
  }
}

const Types = {
  ObjectId: Object.assign((v) => (v ? String(v) : randomUUID()), {
    isValid: (v) => typeof v === 'string' && v.length > 0,
  }),
};

module.exports = { Schema, model, Types, ValidationError, CastError, Promise: global.Promise };
