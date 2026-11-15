// Firestore persistence for the ODM (Stage 7). Selected only through server/data/index.js.
// Semantics follow the Postgres adapter: filters that Firestore cannot answer identically are
// evaluated in memory over a bounded read, and a query that would exceed the bound fails instead of
// returning partial results.
const { createHash } = require('crypto');
const { Filter, FieldPath, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getFirestoreDb } = require('../firebase/admin');
const tx = require('./tx');
const { isPlainObject, fieldAt, checkPath, COLUMN_PATHS, toJsonValue } = require('./values');

// Case-insensitive lookup copies (`$ci` operator), per collection.
const LOWERCASE_FIELDS = { area: ['name'], admin: ['admin_Email'], employee: ['email'], user: ['user_Email'] };
const MAX_DISJUNCTIONS = 30;
const MAX_IN_VALUES = 30;
const SCALAR_KINDS = new Set(['string', 'number', 'boolean', 'date', 'objectid']);

const scanLimit = () => Math.max(1, Number(process.env.FIRESTORE_SCAN_LIMIT) || 2000);

class FirestoreScanLimitError extends Error {
  constructor(collection, limit) {
    super(`Firestore query on "${collection}" needs in-memory filtering over more than ${limit} documents; ` +
      'narrow the query (Stage 8) or raise FIRESTORE_SCAN_LIMIT.');
    this.name = 'FirestoreScanLimitError';
    this.code = 'SCAN_LIMIT';
  }
}

// ---------- Read meter (estimates billed operations, per Firestore pricing rules) ----------

const meter = { reads: 0, writes: 0, deletes: 0, queries: 0 };
const stats = () => ({ ...meter });
const resetStats = () => { for (const k of Object.keys(meter)) meter[k] = 0; };

// ---------- Conversion between ODM data and Firestore documents ----------

const collection = (Model) => getFirestoreDb().collection(Model.tableName);
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
// Inside transaction(): { t, writes }. Reads go through the native transaction; writes are buffered and
// applied at the end, because Firestore requires every read of a transaction to come before its writes.
const inTx = () => tx.currentState()?.handle || null;

// Firestore document-ID rules; anything else can never exist, so lookups simply find nothing.
const validId = (id) =>
  typeof id === 'string' && id.length > 0 && !id.includes('/') && id !== '.' && id !== '..' &&
  !/^__.*__$/.test(id) && Buffer.byteLength(id) <= 1500;

function reviveDate(value) {
  if (typeof value !== 'string') return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d;
}

// Typed date fields become Timestamps; everything else keeps the JSON form Postgres stores.
function restoreDates(fields, obj) {
  if (!isPlainObject(obj)) return;
  for (const [key, field] of Object.entries(fields)) {
    const value = obj[key];
    if (value == null) continue;
    if (field.kind === 'date') obj[key] = reviveDate(value);
    else if (field.kind === 'nested') restoreDates(field.fields, value);
    else if (field.kind === 'array' && Array.isArray(value)) {
      if (field.of.kind === 'date') obj[key] = value.map(reviveDate);
      else if (field.of.kind === 'nested') value.forEach((item) => restoreDates(field.of.fields, item));
    }
  }
}

// Fields declared with `default: null` are always stored, so `== null` queries match them natively.
function fillNullDefaults(fields, obj) {
  for (const [key, field] of Object.entries(fields)) {
    if ('default' in field && field.default === null && !(key in obj)) obj[key] = null;
  }
}

function lowercaseCopies(Model, json) {
  const lc = {};
  for (const f of LOWERCASE_FIELDS[Model.tableName] || []) if (typeof json[f] === 'string') lc[f] = json[f].toLowerCase();
  return lc;
}

function toStored(Model, data, { partial } = {}) {
  const json = JSON.parse(JSON.stringify(data));
  restoreDates(Model.$fields, json);
  if (!partial) fillNullDefaults(Model.$fields, json);
  return json;
}

function toPlain(value) {
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

function fromStored(snap) {
  const { createdAt, updatedAt, _lc, ...data } = snap.data();
  return {
    id: snap.id,
    data: toPlain(data),
    created_at: createdAt instanceof Timestamp ? createdAt.toDate() : null,
    updated_at: updatedAt instanceof Timestamp ? updatedAt.toDate() : null,
  };
}

// ---------- In-memory evaluation with the same semantics as the Postgres SQL ----------

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function jsonEquals(a, b) {
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => jsonEquals(x, b[i]));
  }
  if (isObj(a) || isObj(b)) {
    if (!isObj(a) || !isObj(b)) return false;
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => k in b && jsonEquals(a[k], b[k]));
  }
  return typeof a === typeof b && a === b;
}

// jsonb `@>` containment; only the top level lets an array contain a bare primitive.
function jsonContains(container, contained, top = true) {
  if (Array.isArray(contained)) {
    if (!Array.isArray(container)) return false;
    return contained.every((c) => container.some((x) => jsonContains(x, c, false)));
  }
  if (isObj(contained)) {
    if (!isObj(container)) return false;
    return Object.entries(contained).every(([k, v]) => k in container && jsonContains(container[k], v, false));
  }
  if (top && Array.isArray(container)) return container.some((x) => jsonEquals(x, contained));
  return jsonEquals(container, contained);
}

const jsonbKeyOrder = (a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0);

// Text of a jsonb value (`#>>`): NULL for SQL NULL and JSON null; jsonb formatting for containers.
function pgJson(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `[${v.map(pgJson).join(', ')}]`;
  if (isObj(v)) return `{${Object.keys(v).sort(jsonbKeyOrder).map((k) => `${JSON.stringify(k)}: ${pgJson(v[k])}`).join(', ')}}`;
  return JSON.stringify(v);
}
function pgText(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return pgJson(v);
}

// jsonb ordering: Object > Array > Boolean > Number > String > Null.
const jsonbRank = (v) => (v === null ? 0 : typeof v === 'string' ? 1 : typeof v === 'number' ? 2 : typeof v === 'boolean' ? 3 : Array.isArray(v) ? 4 : 5);
function jsonbCompare(a, b) {
  const ra = jsonbRank(a);
  const rb = jsonbRank(b);
  if (ra !== rb) return ra - rb;
  if (ra === 0) return 0;
  if (ra === 1) return a < b ? -1 : a > b ? 1 : 0;
  if (ra === 2 || ra === 3) return Number(a) - Number(b);
  if (ra === 4) {
    if (a.length !== b.length) return a.length - b.length;
    for (let i = 0; i < a.length; i += 1) { const c = jsonbCompare(a[i], b[i]); if (c) return c; }
    return 0;
  }
  const ka = Object.keys(a).sort(jsonbKeyOrder);
  const kb = Object.keys(b).sort(jsonbKeyOrder);
  if (ka.length !== kb.length) return ka.length - kb.length;
  for (let i = 0; i < ka.length; i += 1) {
    const kc = jsonbKeyOrder(ka[i], kb[i]);
    if (kc) return kc;
    const vc = jsonbCompare(a[ka[i]], b[kb[i]]);
    if (vc) return vc;
  }
  return 0;
}

function pathValue(data, parts) {
  let cur = data;
  for (const p of parts) {
    if (cur === null || typeof cur !== 'object' || !(p in cur)) return { present: false, value: undefined };
    cur = cur[p];
  }
  return { present: true, value: cur };
}

const compareWith = (op, c) => (op === '>' ? c > 0 : op === '>=' ? c >= 0 : op === '<' ? c < 0 : c <= 0);
const normJson = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

function evalCondition(key, value, fields, view) {
  const column = COLUMN_PATHS[key];
  const field = column ? { kind: column === 'id' ? 'id' : 'date' } : fieldAt(fields, key);
  const { present, value: jsonValue } = column ? { present: true, value: undefined } : pathValue(view.data, checkPath(key));
  const text = column === 'id' ? view.id : column ? view[column].toISOString() : pgText(jsonValue);

  const eq = (v) => {
    if (column === 'id') return v == null ? false : view.id === String(v._id || v);
    if (column) return v == null ? false : view[column].getTime() === new Date(new Date(v).toISOString()).getTime();
    if (v === null) return !present || jsonValue === null;
    const jv = normJson(toJsonValue(field, v, key));
    if (jv === undefined || !present) return false;
    if (field.kind === 'array' && !Array.isArray(v)) return jsonContains(jsonValue, [jv]);
    return jsonEquals(jsonValue, jv);
  };
  const regex = (re, options = '') => {
    const source = re instanceof RegExp ? re.source : String(re);
    const flags = re instanceof RegExp ? re.flags : options;
    return text != null && new RegExp(source, flags.includes('i') ? 'i' : '').test(text);
  };
  const compare = (op, v) => {
    if (column === 'id') return compareWith(op, view.id < String(v) ? -1 : view.id > String(v) ? 1 : 0);
    if (column) return compareWith(op, view[column].getTime() - new Date(new Date(v).toISOString()).getTime());
    if (field.kind === 'number') return typeof jsonValue === 'number' && compareWith(op, jsonValue - Number(v));
    if (field.kind === 'date') {
      const d = v instanceof Date ? v : new Date(v);
      const bound = new Date(d.toISOString()).getTime();
      return typeof jsonValue === 'string' && compareWith(op, new Date(jsonValue).getTime() - bound);
    }
    const s = String(v);
    return text != null && compareWith(op, text < s ? -1 : text > s ? 1 : 0);
  };

  if (value instanceof RegExp) return regex(value);
  if (!isPlainObject(value) || !Object.keys(value).some((k) => k.startsWith('$'))) return eq(value);

  for (const [op, v] of Object.entries(value)) {
    let ok;
    switch (op) {
      case '$eq': ok = eq(v); break;
      case '$ne': ok = !eq(v); break;
      case '$in': ok = v.some(eq); break;
      case '$nin': ok = !v.some(eq); break;
      case '$gt': ok = compare('>', v); break;
      case '$gte': ok = compare('>=', v); break;
      case '$lt': ok = compare('<', v); break;
      case '$lte': ok = compare('<=', v); break;
      case '$regex': ok = regex(v, value.$options); break;
      case '$options': ok = true; break;
      case '$exists': ok = column ? Boolean(v) : v ? present : !present; break;
      case '$ci': ok = v != null && text != null && text.toLowerCase() === String(v).toLowerCase(); break;
      default: throw new Error(`Unsupported query operator ${op}`);
    }
    if (!ok) return false;
  }
  return true;
}

function evalWhere(filter, fields, view) {
  for (const [key, value] of Object.entries(filter || {})) {
    if (value === undefined) continue;
    if (key === '$or' || key === '$and' || key === '$nor') {
      if (!value.length) continue;
      const results = value.map((f) => evalWhere(f, fields, view));
      const ok = key === '$and' ? results.every(Boolean) : results.some(Boolean);
      if (key === '$nor' ? ok : !ok) return false;
      continue;
    }
    if (!evalCondition(key, value, fields, view)) return false;
  }
  return true;
}

const viewOf = (row) => ({ id: row.id, data: JSON.parse(JSON.stringify(row.data)), created_at: row.created_at || new Date(0), updated_at: row.updated_at || new Date(0) });
const matches = (Model, row, filter) => evalWhere(filter, Model.$fields, viewOf(row));

// ---------- Sorting (Postgres ORDER BY semantics, including NULLS LAST/FIRST and `id ASC` ties) ----------

function normSort(sort) {
  if (!sort) return [];
  const entries = typeof sort === 'string'
    ? sort.split(/\s+/).filter(Boolean).map((k) => (k.startsWith('-') ? [k.slice(1), -1] : [k, 1]))
    : Object.entries(sort);
  return entries.map(([key, dir]) => {
    const desc = dir === -1 || dir === '-1' || /^desc/i.test(String(dir));
    const column = key === '_id' || key === 'id' ? 'created_at' : COLUMN_PATHS[key] || null;
    return { key, column, parts: column ? null : checkPath(key), desc };
  });
}

function sortRows(rows, entries) {
  const order = entries.length ? entries : [{ column: 'created_at', desc: false }];
  const views = new Map(rows.map((r) => [r, viewOf(r)]));
  return rows.sort((ra, rb) => {
    const a = views.get(ra);
    const b = views.get(rb);
    for (const e of order) {
      let c;
      if (e.column) {
        c = a[e.column].getTime() - b[e.column].getTime();
        if (e.desc) c = -c;
      } else {
        const va = pathValue(a.data, e.parts);
        const vb = pathValue(b.data, e.parts);
        if (!va.present || !vb.present) {
          // SQL NULL (missing): last when ascending, first when descending.
          c = va.present === vb.present ? 0 : (va.present ? -1 : 1) * (e.desc ? -1 : 1);
        } else {
          c = jsonbCompare(va.value, vb.value);
          if (e.desc) c = -c;
        }
      }
      if (c) return c;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

// ---------- Query planning ----------

const fieldRef = (key) => new FieldPath(...checkPath(key));
const columnField = (column) => (column === 'created_at' ? 'createdAt' : 'updatedAt');
const isRangeOp = (op) => op === '$gt' || op === '$gte' || op === '$lt' || op === '$lte';
const RANGE_OPS = { $gt: '>', $gte: '>=', $lt: '<', $lte: '<=' };

function nativeEqValue(field, v, key) {
  const jv = normJson(toJsonValue(field, v, key));
  const kind = field.kind === 'array' ? field.of.kind : field.kind;
  return kind === 'date' ? reviveDate(jv) : jv;
}

const isScalarJson = (v) => v !== null && v !== undefined && typeof v !== 'object';
const isNativeScalar = (v) => isScalarJson(v) || v instanceof Date;

// One conjunct of the filter: native constraints that narrow the read, or a note that the
// in-memory pass must decide it. The in-memory pass always re-checks the complete filter.
function planField(Model, key, value, state) {
  const column = COLUMN_PATHS[key];
  const out = [];
  const push = (filter) => { out.push(filter); if (!column) state.constrained.add(key); };
  if (column === 'id') {
    if (value instanceof RegExp) { state.residual = true; return out; }
    const plain = !isPlainObject(value) || !Object.keys(value).some((k) => k.startsWith('$'));
    const ops = plain ? { $eq: value } : value;
    for (const [op, v] of Object.entries(ops)) {
      if (op === '$eq') {
        if (v == null) state.impossible = true;
        else state.ids = intersectIds(state.ids, [String(v._id || v)]);
      } else if (op === '$in') {
        state.ids = intersectIds(state.ids, v.filter((x) => x != null).map((x) => String(x._id || x)));
      } else if (op === '$ne') {
        state.cheapResidual = true;
      } else if (['$nin', '$gt', '$gte', '$lt', '$lte', '$regex', '$options', '$exists', '$ci'].includes(op)) {
        state.residual = true;
      } else {
        throw new Error(`Unsupported query operator ${op}`);
      }
    }
    return out;
  }

  const target = column ? columnField(column) : fieldRef(key);
  const field = column ? { kind: 'date' } : fieldAt(Model.$fields, key);
  if (value instanceof RegExp) { state.residual = true; return out; }
  const plain = !isPlainObject(value) || !Object.keys(value).some((k) => k.startsWith('$'));
  const ops = plain ? { $eq: value } : value;

  for (const [op, v] of Object.entries(ops)) {
    if (op === '$eq') {
      if (column) {
        if (v == null) state.impossible = true;
        else out.push(Filter.where(target, '==', new Date(new Date(v).toISOString())));
      } else if (v === null) {
        if ('default' in field && field.default === null) push(Filter.where(target, '==', null));
        else state.residual = true;
      } else if (field.kind === 'array') {
        const ev = Array.isArray(v) ? undefined : nativeEqValue(field, v, key);
        if (SCALAR_KINDS.has(field.of.kind) && isNativeScalar(ev) && state.arrayContains === 0) {
          state.arrayContains += 1;
          push(Filter.where(target, 'array-contains', ev));
        } else state.residual = true;
      } else {
        const ev = nativeEqValue(field, v, key);
        if (isNativeScalar(ev)) push(Filter.where(target, '==', ev));
        else state.residual = true;
      }
    } else if (op === '$ne') {
      if (!column && v === null && state.notEqual === 0) {
        state.notEqual += 1;
        state.inequalities.add(key);
        push(Filter.where(target, '!=', null));
      } else state.residual = true;
    } else if (op === '$in') {
      if (!v.length) { state.impossible = true; continue; }
      const kindField = column ? field : field.kind === 'array' ? field.of : field;
      const values = v.map((x) => (column ? (x == null ? null : new Date(new Date(x).toISOString())) : x == null ? null : nativeEqValue(field, x, key)));
      const nativeOk = values.length <= MAX_IN_VALUES && values.every(isNativeScalar) &&
        (column || SCALAR_KINDS.has(kindField.kind) || kindField.kind === 'mixed');
      if (!nativeOk) { state.residual = true; continue; }
      if (!column && field.kind === 'array') {
        if (state.arrayContains > 0) { state.residual = true; continue; }
        state.arrayContains += 1;
        push(Filter.where(target, 'array-contains-any', values));
      } else {
        push(Filter.where(target, 'in', values));
      }
      state.disjunctions *= values.length;
    } else if (isRangeOp(op)) {
      if (column) {
        out.push(Filter.where(target, RANGE_OPS[op], new Date(new Date(v).toISOString())));
        state.inequalities.add(key === 'createdAt' || key === 'updatedAt' ? key : columnField(column));
      } else if (field.kind === 'number' && Number.isFinite(Number(v))) {
        push(Filter.where(target, RANGE_OPS[op], Number(v)));
        state.inequalities.add(key);
      } else if (field.kind === 'date') {
        const d = v instanceof Date ? v : new Date(v);
        push(Filter.where(target, RANGE_OPS[op], new Date(d.toISOString())));
        state.inequalities.add(key);
      } else if (field.kind === 'string' || field.kind === 'objectid') {
        push(Filter.where(target, RANGE_OPS[op], String(v)));
        state.inequalities.add(key);
      } else state.residual = true;
    } else if (op === '$ci') {
      const lc = LOWERCASE_FIELDS[Model.tableName] || [];
      if (v == null) state.impossible = true;
      else if (!column && lc.includes(key)) out.push(Filter.where(new FieldPath('_lc', key), '==', String(v).toLowerCase()));
      else state.residual = true;
    } else if (['$nin', '$regex', '$options', '$exists'].includes(op)) {
      if (op !== '$options') state.residual = true;
    } else {
      throw new Error(`Unsupported query operator ${op}`);
    }
  }
  return out;
}

function intersectIds(current, next) {
  if (current === null) return [...new Set(next)];
  return current.filter((id) => next.includes(id));
}

const newState = () => ({
  impossible: false, residual: false, cheapResidual: false, ids: null,
  arrayContains: 0, notEqual: 0, inequalities: new Set(), disjunctions: 1,
  // Fields that a native constraint guarantees to exist on every match.
  constrained: new Set(),
});

// Validates every path and operator (same errors as the SQL builder), then returns native filters.
function planFilter(Model, filter, state = newState(), nested = false) {
  const filters = [];
  for (const [key, value] of Object.entries(filter || {})) {
    if (value === undefined) continue;
    if (key === '$and') {
      for (const f of value) filters.push(...planFilter(Model, f, state, nested).filters);
      continue;
    }
    if (key === '$or' || key === '$nor') {
      const branches = value.map((f) => {
        const s = newState();
        const planned = planFilter(Model, f, s, true);
        return { s, filters: planned.filters };
      });
      if (!branches.length) continue;
      const exact = key === '$or' && !nested && branches.every(({ s }) =>
        !s.residual && !s.cheapResidual && !s.impossible && s.ids === null && s.inequalities.size === 0 && s.notEqual === 0 && s.arrayContains === 0);
      const total = branches.reduce((n, { s }) => n + s.disjunctions, 0);
      if (exact && branches.every(({ filters: f }) => f.length) && state.disjunctions * total <= MAX_DISJUNCTIONS) {
        filters.push(Filter.or(...branches.map(({ filters: f }) => (f.length === 1 ? f[0] : Filter.and(...f)))));
        state.disjunctions *= total;
      } else {
        state.residual = true;
      }
      continue;
    }
    filters.push(...planField(Model, key, value, state));
  }
  if (state.disjunctions > MAX_DISJUNCTIONS) state.residual = true;
  return { filters: state.disjunctions > MAX_DISJUNCTIONS ? [] : filters, state };
}

function baseQuery(Model, filters) {
  const coll = collection(Model);
  if (!filters.length) return coll;
  return coll.where(filters.length === 1 ? filters[0] : Filter.and(...filters));
}

async function runQuery(query, skipped = 0) {
  const h = inTx();
  const snap = await (h ? h.t.get(query) : query.get());
  meter.queries += 1;
  meter.reads += Math.max(1, snap.size + skipped);
  return snap;
}

async function runCount(query) {
  const h = inTx();
  const snap = await (h ? h.t.get(query.count()) : query.count().get());
  const n = snap.data().count;
  meter.queries += 1;
  meter.reads += Math.max(1, Math.ceil(n / 1000));
  return n;
}

async function fetchByIds(Model, ids) {
  const valid = ids.filter(validId);
  if (!valid.length) return [];
  const coll = collection(Model);
  const refs = valid.map((id) => coll.doc(id));
  const h = inTx();
  const snaps = await (h ? h.t.getAll(...refs) : getFirestoreDb().getAll(...refs));
  meter.reads += valid.length;
  return snaps.filter((s) => s.exists).map(fromStored);
}

const always = (column) => column === 'created_at' || column === 'updated_at';

function pushdownEligible(Model, plan, entries, hasFilters) {
  const { state } = plan;
  if (state.residual || state.cheapResidual || state.ids !== null) return false;
  if (!entries.length && hasFilters) return false;
  const order = entries.length ? entries : [{ column: 'created_at', desc: false }];
  for (const e of order) {
    if (e.column) continue;
    if (!SCALAR_KINDS.has(fieldAt(Model.$fields, e.key).kind)) return false;
  }
  const first = order[0].column ? columnField(order[0].column) : order[0].key;
  return [...state.inequalities].every((f) => f === first) && state.inequalities.size <= 1;
}

function applyOrder(query, entries) {
  const order = entries.length ? entries : [{ column: 'created_at', desc: false }];
  let q = query;
  for (const e of order) q = q.orderBy(e.column ? columnField(e.column) : new FieldPath(...e.parts), e.desc ? 'desc' : 'asc');
  return q;
}

// Rows for the ODM: [{ id, data, created_at, updated_at }] in Postgres order.
async function find(Model, filter, { sort = null, skip = 0, limit = null } = {}) {
  const entries = normSort(sort);
  const plan = planFilter(Model, filter);
  const { state } = plan;
  if (state.impossible) return [];
  const window = (rows) => rows.slice(skip || 0, limit ? (skip || 0) + limit : undefined);

  if (state.ids !== null) {
    const rows = (await fetchByIds(Model, state.ids)).filter((r) => matches(Model, r, filter));
    return window(sortRows(rows, entries));
  }

  const base = baseQuery(Model, plan.filters);
  const wantsWindow = Boolean(limit || skip);
  if (wantsWindow && pushdownEligible(Model, plan, entries, plan.filters.length > 0)) {
    const order = entries.length ? entries : [{ column: 'created_at' }];
    const guaranteed = order.every((e) => always(e.column) || state.constrained.has(e.key));
    let push = guaranteed;
    if (!guaranteed) {
      // Firestore omits documents that lack an orderBy field; Postgres sorts them as NULLs. Only push the
      // sort down when every matching document has the sort fields.
      const total = await runCount(base);
      if (total > (skip || 0) + (limit || 0) + 20) push = (await runCount(applyOrder(base, entries))) === total;
      if (!push && total > scanLimit()) throw new FirestoreScanLimitError(Model.tableName, scanLimit());
    }
    if (push) {
      let q = applyOrder(base, entries);
      if (skip) q = q.offset(skip);
      if (limit) q = q.limit(limit);
      const snap = await runQuery(q, skip || 0);
      const rows = snap.docs.map(fromStored);
      if (rows.some((r) => !matches(Model, r, filter))) {
        throw new Error(`Firestore query on "${Model.tableName}" returned rows that do not match the filter (planner bug).`);
      }
      return rows;
    }
  }

  const bounded = state.residual || wantsWindow;
  const snap = await runQuery(bounded ? base.limit(scanLimit() + 1) : base);
  if (bounded && snap.size > scanLimit()) throw new FirestoreScanLimitError(Model.tableName, scanLimit());
  if (!bounded && snap.size > scanLimit()) {
    console.warn(`[firestore] "${Model.tableName}" query returned ${snap.size} documents (one read each).`);
  }
  const rows = snap.docs.map(fromStored).filter((r) => matches(Model, r, filter));
  return window(sortRows(rows, entries));
}

async function count(Model, filter) {
  const plan = planFilter(Model, filter);
  const { state } = plan;
  if (state.impossible) return 0;
  if (state.ids !== null) return (await fetchByIds(Model, state.ids)).filter((r) => matches(Model, r, filter)).length;
  const base = baseQuery(Model, plan.filters);
  if (!state.residual && !state.cheapResidual) return runCount(base);
  const snap = await runQuery(base.limit(scanLimit() + 1));
  if (snap.size > scanLimit()) throw new FirestoreScanLimitError(Model.tableName, scanLimit());
  return snap.docs.map(fromStored).filter((r) => matches(Model, r, filter)).length;
}

async function hasOther(Model, id, filter) {
  const rows = await find(Model, filter, { limit: null });
  return rows.some((r) => r.id !== id);
}

// ---------- Writes ----------

async function insert(Model, id, data, { createdAt = null } = {}) {
  if (!validId(id)) throw new Error(`Invalid document id for Firestore: ${JSON.stringify(id)}`);
  const now = new Date();
  const created = createdAt ? new Date(createdAt) : now;
  const json = toStored(Model, data);
  const lc = lowercaseCopies(Model, json);
  const ref = collection(Model).doc(id);
  const doc = { ...json, ...(Object.keys(lc).length ? { _lc: lc } : {}), createdAt: created, updatedAt: now };
  const h = inTx();
  if (h) h.writes.push((t) => t.create(ref, doc));
  else await ref.create(doc);
  meter.writes += 1;
  return { created_at: created, updated_at: now };
}

async function update(Model, id, data, { partial = false, createdAt = null } = {}) {
  if (!validId(id)) return null;
  const now = new Date();
  const json = toStored(Model, data, { partial });
  const payload = { ...json, updatedAt: now };
  const lc = lowercaseCopies(Model, json);
  if (partial) {
    for (const [f, v] of Object.entries(lc)) payload[`_lc.${f}`] = v;
  } else {
    // Full replacement, like Postgres `data = $2`: remove fields that are no longer set.
    for (const key of Object.keys(Model.$fields)) if (!(key in json)) payload[key] = FieldValue.delete();
    payload._lc = Object.keys(lc).length ? lc : FieldValue.delete();
  }
  const ref = collection(Model).doc(id);
  const h = inTx();
  if (h) {
    // The document was read in this transaction; if it is deleted meanwhile, the commit fails and retries.
    h.writes.push((t) => t.update(ref, payload));
  } else {
    try {
      await ref.update(payload);
    } catch (err) {
      if (err && err.code === 5) return null; // NOT_FOUND: Postgres updates no row either
      throw err;
    }
  }
  meter.writes += 1;
  return { created_at: createdAt, updated_at: now };
}

async function remove(Model, id) {
  if (!validId(id)) return;
  const ref = collection(Model).doc(id);
  const h = inTx();
  if (h) h.writes.push((t) => t.delete(ref));
  else await ref.delete();
  meter.deletes += 1;
}

async function removeMany(Model, ids) {
  const valid = ids.filter(validId);
  const h = inTx();
  if (h) {
    for (const id of valid) h.writes.push((t) => t.delete(collection(Model).doc(id)));
    meter.deletes += valid.length;
    return;
  }
  const db = getFirestoreDb();
  for (let i = 0; i < valid.length; i += 500) {
    const batch = db.batch();
    for (const id of valid.slice(i, i + 500)) batch.delete(collection(Model).doc(id));
    await batch.commit();
    meter.deletes += Math.min(500, valid.length - i);
  }
}

async function ping() {
  await getFirestoreDb().collection('system_health').doc('ping').get();
  meter.reads += 1;
}

// ---------- Transactions ----------

// Lock documents (`locks/{sha256(key)}`) are read and rewritten inside the transaction, so two transactions
// using the same key conflict and Firestore retries one of them. This also protects values that do not exist
// yet, such as a duplicate check before a create.
async function lock(state, keys) {
  const coll = getFirestoreDb().collection('locks');
  const refs = keys.map((key) => coll.doc(sha256(key)));
  await state.handle.t.getAll(...refs);
  meter.reads += refs.length;
  const at = new Date();
  for (const ref of refs) state.handle.writes.push((t) => t.set(ref, { at }));
  meter.writes += refs.length;
}

function begin(attempt) {
  return getFirestoreDb().runTransaction(async (t) => {
    const handle = { t, writes: [] };
    const result = await attempt(handle);
    for (const write of handle.writes) write(t);
    return result;
  }, { maxAttempts: tx.MAX_ATTEMPTS });
}

const transaction = (fn) => tx.run(begin, lock, fn);

// ---------- Rate limiting ----------

// Same fixed windows as the Postgres counters. Documents are keyed by a hash because the raw key holds the
// client IP; both rules are read and updated in one transaction.
async function rateLimit(rules) {
  const db = getFirestoreDb();
  const refs = rules.map((r) => db.collection('rate_limits').doc(sha256(r.key)));
  const allowed = await db.runTransaction(async (t) => {
    const snaps = await t.getAll(...refs);
    meter.reads += refs.length;
    const now = Date.now();
    for (const [i, rule] of rules.entries()) {
      const cur = snaps[i].exists ? snaps[i].data() : null;
      const start = cur?.windowStart instanceof Timestamp ? cur.windowStart.toMillis() : 0;
      const fresh = !cur || start < now - rule.windowSeconds * 1000;
      const windowStart = fresh ? now : start;
      const count = fresh ? 1 : Number(cur.count || 0) + 1;
      t.set(refs[i], {
        kind: String(rule.key).split(':')[0],
        windowStart: new Date(windowStart),
        windowSeconds: rule.windowSeconds,
        count,
        expiresAt: new Date(windowStart + rule.windowSeconds * 1000),
      });
      meter.writes += 1;
      if (count > rule.limit) return false;
    }
    return true;
  }, { maxAttempts: tx.MAX_ATTEMPTS });
  // No TTL policies without billing: about 1 in 100 requests removes up to 50 expired counters.
  if (Math.random() < 0.01) cleanupRateLimits().catch((err) => console.warn('[firestore] rate-limit cleanup failed', err.message));
  return allowed;
}

async function cleanupRateLimits(max = 50) {
  const snap = await getFirestoreDb().collection('rate_limits').where('expiresAt', '<', new Date()).limit(max).get();
  meter.reads += Math.max(1, snap.size);
  let removed = 0;
  for (const doc of snap.docs) {
    try {
      // Skipped if a request renewed the counter after it was read.
      await doc.ref.delete({ lastUpdateTime: doc.updateTime });
      removed += 1;
    } catch {
      // renewed meanwhile
    }
  }
  meter.deletes += removed;
  return removed;
}

module.exports = {
  name: 'firestore', insert, update, remove, removeMany, find, count, hasOther, ping, transaction, rateLimit,
  cleanupRateLimits, stats, resetStats, FirestoreScanLimitError, LOWERCASE_FIELDS, toStored, lowercaseCopies,
};
