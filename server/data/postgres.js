// PostgreSQL/PGlite persistence: one table per model, documents stored as JSONB.
// The SQL below is the original ODM code, moved here unchanged (plus the optional `$ci` operator).
// Inside transaction() every query runs on the transaction's connection and reads lock their rows.
const db = require('../db');
const tx = require('./tx');
const { isPlainObject, fieldAt, checkPath, COLUMN_PATHS, toJsonValue } = require('./values');

const RETRYABLE = new Set(['40001', '40P01']); // serialization failure, deadlock detected
const inTx = () => tx.currentState()?.handle || null;
const q = (text, params) => (inTx()?.query || db.query)(text, params);
const ensureTable = (table) => db.ensureTable(table, inTx()?.query || db.query);

function jsonPath(path) {
  const parts = checkPath(path);
  return `'{${parts.map((p) => `"${p}"`).join(',')}}'`;
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
      case '$ci': parts.push(v == null ? 'FALSE' : `COALESCE(lower(${text}) = lower(${add(String(v))}), FALSE)`); break;
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

async function insert(Model, id, data, { createdAt = null } = {}) {
  await ensureTable(Model.tableName);
  // ::text::jsonb stops postgres.js from JSON-encoding the already-serialized string again.
  if (createdAt) {
    const rows = await q(
      `INSERT INTO "${Model.tableName}" (id, data, created_at) VALUES ($1, $2::text::jsonb, $3::timestamptz) RETURNING created_at, updated_at`,
      [id, JSON.stringify(data), new Date(createdAt).toISOString()],
    );
    return rows[0] || null;
  }
  const rows = await q(
    `INSERT INTO "${Model.tableName}" (id, data) VALUES ($1, $2::text::jsonb) RETURNING created_at, updated_at`,
    [id, JSON.stringify(data)],
  );
  return rows[0] || null;
}

async function update(Model, id, data, { partial } = {}) {
  await ensureTable(Model.tableName);
  const rows = await q(
    `UPDATE "${Model.tableName}" SET data = ${partial ? 'data || $2::text::jsonb' : '$2::text::jsonb'}, updated_at = now() WHERE id = $1 RETURNING created_at, updated_at`,
    [id, JSON.stringify(data)],
  );
  return rows[0] || null;
}

async function remove(Model, id) {
  await ensureTable(Model.tableName);
  await q(`DELETE FROM "${Model.tableName}" WHERE id = $1`, [id]);
}

async function removeMany(Model, ids) {
  for (const id of ids) await remove(Model, id);
}

async function find(Model, filter, { sort = null, skip = 0, limit = null } = {}) {
  await ensureTable(Model.tableName);
  const params = [];
  const where = buildWhere(filter, Model.$fields, params);
  let sql = `SELECT id, data, created_at, updated_at FROM "${Model.tableName}" WHERE ${where} ORDER BY ${buildOrder(sort)}`;
  if (limit) sql += ` LIMIT ${Number(limit)}`;
  if (skip) sql += ` OFFSET ${Number(skip)}`;
  // Rows read inside a transaction stay locked until it ends, so read-modify-write cannot lose updates.
  if (inTx()) sql += ' FOR UPDATE';
  return q(sql, params);
}

async function count(Model, filter) {
  await ensureTable(Model.tableName);
  const params = [];
  const where = buildWhere(filter, Model.$fields, params);
  const [row] = await q(`SELECT count(*)::int AS n FROM "${Model.tableName}" WHERE ${where}`, params);
  return Number(row.n);
}

// Unique-field check: is there another document (id <> given id) matching the filter?
async function hasOther(Model, id, filter) {
  await ensureTable(Model.tableName);
  const params = [id];
  const where = buildWhere(filter, Model.$fields, params);
  const rows = await q(`SELECT 1 FROM "${Model.tableName}" WHERE id <> $1 AND ${where} LIMIT 1`, params);
  return rows.length > 0;
}

const ping = () => db.ping();

// ---------- Transactions ----------

// Transaction-scoped advisory locks: they also protect values that do not exist yet (duplicate checks).
async function lock(state, keys) {
  for (const key of keys) await state.handle.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [key]);
}

async function begin(attempt) {
  for (let n = 1; ; n += 1) {
    try {
      return await db.transaction((query) => attempt({ query }));
    } catch (err) {
      if (n >= tx.MAX_ATTEMPTS || !RETRYABLE.has(err?.code)) throw err;
    }
  }
}

const transaction = (fn) => tx.run(begin, lock, fn);

// ---------- Rate limiting (fixed-window counters; SQL moved unchanged from server/leads/rateLimit.js) ----------

let rateTable = null;
const ensureRateTable = () =>
  (rateTable ||= db
    .query(`CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL, count integer NOT NULL)`)
    .catch((err) => {
      rateTable = null;
      throw err;
    }));

async function hit(key, windowSeconds) {
  await ensureRateTable();
  const rows = await db.query(
    `INSERT INTO rate_limits (key, window_start, count) VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start < now() - $2::interval THEN 1 ELSE rate_limits.count + 1 END,
       window_start = CASE WHEN rate_limits.window_start < now() - $2::interval THEN now() ELSE rate_limits.window_start END
     RETURNING count`,
    [key, `${windowSeconds} seconds`]
  );
  return Number(rows[0]?.count || 0);
}

// Each statement is atomic, so concurrent requests cannot both read the same count.
async function rateLimit(rules) {
  for (const { key, limit, windowSeconds } of rules) {
    if ((await hit(key, windowSeconds)) > limit) return false;
  }
  return true;
}

module.exports = { name: 'postgres', insert, update, remove, removeMany, find, count, hasOther, ping, transaction, rateLimit };
