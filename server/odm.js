// Minimal Mongoose-compatible ODM: one table/collection per model. Persistence goes through the adapter
// chosen in server/data (Postgres/PGlite by default). Supports the subset of the Mongoose API used by server/controllers.
const { randomUUID } = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');
const { adapter, transaction, currentTransaction } = require('./data');
const { isPlainObject, CastError, castScalar, hideValuesInLogs } = require('./data/values');

// Collects inserts made while handling one request, so the lead pipeline can find the record a controller saved.
const saveTracker = new AsyncLocalStorage();

const OBJECT_ID = 'ObjectId';
const MIXED = 'Mixed';

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

class ValidationError extends Error {
  constructor(modelName, errors) {
    const list = Object.values(errors);
    super(`${modelName} validation failed: ${list.map((e) => `${e.path}: ${e.message}`).join(', ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
    hideValuesInLogs(this, `ValidationError: ${modelName} validation failed at ${list.map((e) => `${e.path} (${e.kind})`).join(', ')} (values hidden)`);
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

// ---------- Projection and update helpers ----------

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

    // options.createdAt (inserts only) keeps the original creation time of imported records.
    async save(options = {}) {
      const { data, errors } = this.$data();
      if (options.validateBeforeSave !== false) validateFields(fields, data, '', this, errors);
      if (Object.keys(errors).length) throw new ValidationError(modelName, errors);
      const locks = uniqueLocks(data);
      const tx = currentTransaction();
      // Unique values are checked and written in one transaction, locked on the value.
      if (locks.length && !tx) return transaction(() => this.save(options));
      if (locks.length) await tx.lock(locks);
      await checkUnique(this._id, data);
      const inserting = this.$isNew;
      const before = { createdAt: this.createdAt, updatedAt: this.updatedAt };
      const stored = this.$isNew
        ? await adapter().insert(Document, this._id, data, { createdAt: options.createdAt || null })
        : await adapter().update(Document, this._id, data, { partial: this.$partial, createdAt: this.createdAt });
      Object.assign(this, data);
      if (schema.timestamps && stored) {
        if (stored.created_at) this.createdAt = new Date(stored.created_at);
        this.updatedAt = new Date(stored.updated_at);
      }
      this.$isNew = false;
      this.$errors = {};
      if (tx) {
        tx.onRetry(() => {
          this.$isNew = inserting;
          this.createdAt = before.createdAt;
          this.updatedAt = before.updatedAt;
        });
      }
      const tracked = inserting && saveTracker.getStore();
      if (tracked) {
        const record = () => tracked.push({ model: Document, id: this._id });
        if (tx) tx.afterCommit(record);
        else record();
      }
      return this;
    }

    async deleteOne() {
      await adapter().remove(Document, this._id);
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

  const uniqueLocks = (data) =>
    Object.entries(fields)
      .filter(([key, field]) => field.unique && data[key] != null)
      .map(([key]) => `unique:${table}:${key}:${JSON.stringify(data[key])}`);

  async function checkUnique(id, data) {
    for (const [key, field] of Object.entries(fields)) {
      if (!field.unique || data[key] == null) continue;
      if (await adapter().hasOther(Document, id, { [key]: data[key] })) {
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
    return adapter().find(this.Model, this.filter, {
      sort: this.sortSpec,
      skip: this.skipN,
      limit: single ? 1 : this.limitN,
    });
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
      case 'count':
        return adapter().count(Model, this.filter);
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
        await adapter().remove(Model, row.id);
        return this.hydrate(row);
      }
      case 'deleteMany': {
        const rows = await this.rows(false);
        await adapter().removeMany(Model, rows.map((r) => r.id));
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

// Case-insensitive exact match for filters, e.g. `{ admin_Email: ci(email) }`.
const ci = (value) => ({ $ci: value });

module.exports = { Schema, model, Types, ValidationError, CastError, Promise: global.Promise, saveTracker, ci, transaction };
