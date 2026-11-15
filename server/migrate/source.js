// Read-only access to the PGlite/Postgres source: SELECT statements only, in primary-key order.
const fs = require('fs');
const path = require('path');
const db = require('../db');

function loadModels() {
  const dir = path.join(__dirname, '..', 'models');
  const models = new Map();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
    const Model = require(path.join(dir, file));
    models.set(Model.tableName, Model);
  }
  return models;
}

const ident = (table) => {
  if (!/^[a-z0-9_]+$/.test(table)) throw new Error(`Unexpected table name: ${JSON.stringify(table)}`);
  return `"${table}"`;
};

// Microsecond epoch values keep the full timestamptz precision (JavaScript Dates stop at milliseconds).
const COLUMNS = `id, data,
  (extract(epoch from created_at) * 1000000)::bigint::text AS created_us,
  (extract(epoch from updated_at) * 1000000)::bigint::text AS updated_us`;

async function listTables() {
  const rows = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name"
  );
  return rows.map((r) => r.table_name);
}

const readPage = (table, afterId, limit) =>
  db.query(`SELECT ${COLUMNS} FROM ${ident(table)} WHERE ($1::text IS NULL OR id > $1::text) ORDER BY id LIMIT ${Math.max(1, limit | 0)}`, [afterId]);

const readByIds = (table, ids) =>
  ids.length ? db.query(`SELECT ${COLUMNS} FROM ${ident(table)} WHERE id = ANY($1::text[]) ORDER BY id`, [ids]) : Promise.resolve([]);

async function countRows(table) {
  const [row] = await db.query(`SELECT count(*)::int AS n FROM ${ident(table)}`);
  return row.n;
}

async function sampleIds(table, n) {
  const rows = await db.query(`SELECT id FROM ${ident(table)} ORDER BY random() LIMIT ${Math.max(1, n | 0)}`);
  return rows.map((r) => r.id);
}

// Duplicate values of one field: [{ key, ids }]. `ci` compares lower-cased values; `active` ignores deleted rows.
async function duplicateValues(table, field, { ci = false, active = false } = {}) {
  const value = `trim(data->>'${field.replace(/[^A-Za-z0-9_]/g, '')}')`;
  const key = ci ? `lower(${value})` : value;
  return db.query(
    `SELECT ${key} AS key, array_agg(id ORDER BY id) AS ids FROM ${ident(table)}
     WHERE ${value} IS NOT NULL AND ${value} <> ''${active ? " AND COALESCE(data->>'deleteFlag', 'false') <> 'true'" : ''}
     GROUP BY 1 HAVING count(*) > 1 ORDER BY 1`
  );
}

// Every { id, value } of a text field (used for reference checks).
const fieldValues = (table, field) =>
  db.query(`SELECT id, data->'${field.replace(/[^A-Za-z0-9_]/g, '')}' AS value FROM ${ident(table)} ORDER BY id`);

const allIds = async (table) => new Set((await db.query(`SELECT id FROM ${ident(table)}`)).map((r) => r.id));

module.exports = { loadModels, listTables, readPage, readByIds, countRows, sampleIds, duplicateValues, fieldValues, allIds };
