const path = require('path');

// Survives Next.js dev hot reloads, which re-evaluate this module.
const state = globalThis.__probizDb || (globalThis.__probizDb = { client: null, tables: new Set() });

async function connect() {
  if (process.env.DATABASE_URL) {
    const postgres = require('postgres');
    // prepare:false is required by Supabase's transaction pooler (port 6543).
    const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
    return {
      query: (text, params) => sql.unsafe(text, params),
      // BEGIN ... COMMIT on one connection; works through Supabase's transaction pooler.
      transaction: (fn) => sql.begin((tx) => fn((text, params) => tx.unsafe(text, params))),
    };
  }
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_LOCAL_DB) {
    throw new Error('DATABASE_URL is not set.');
  }
  const { PGlite } = require('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR ? path.resolve(process.env.PGLITE_DIR) : path.join(process.cwd(), '.data', 'pglite');
  require('fs').mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir);
  console.log(`[db] DATABASE_URL not set, using local PGlite in ${process.env.PGLITE_DIR ? dir : '.data/pglite'}`);
  return {
    query: async (text, params) => (await db.query(text, params)).rows,
    // PGlite has one connection: other queries wait until the transaction ends.
    transaction: (fn) => db.transaction((tx) => fn(async (text, params) => (await tx.query(text, params)).rows)),
  };
}

function client() {
  if (!state.client) {
    state.client = connect().catch((err) => {
      state.client = null;
      throw err;
    });
  }
  return state.client;
}

async function query(text, params = []) {
  return (await client()).query(text, params);
}

// Runs fn(query) inside BEGIN ... COMMIT; a thrown error rolls back.
async function transaction(fn) {
  return (await client()).transaction(fn);
}

// `run` is the transaction's query function when called inside one; the cache is only updated outside
// transactions, because a rollback also undoes the CREATE TABLE.
async function ensureTable(table, run = query) {
  if (state.tables.has(table)) return;
  await run(`CREATE TABLE IF NOT EXISTS "${table}" (
    id text PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  if (run === query) state.tables.add(table);
}

async function ping() {
  await query('SELECT 1');
}

module.exports = { query, transaction, ensureTable, ping };
