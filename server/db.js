const path = require('path');

// Survives Next.js dev hot reloads, which re-evaluate this module.
const state = globalThis.__probizDb || (globalThis.__probizDb = { client: null, tables: new Set() });

async function connect() {
  if (process.env.DATABASE_URL) {
    const postgres = require('postgres');
    // prepare:false is required by Supabase's transaction pooler (port 6543).
    const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
    return { query: (text, params) => sql.unsafe(text, params) };
  }
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_LOCAL_DB) {
    throw new Error('DATABASE_URL is not set.');
  }
  const { PGlite } = require('@electric-sql/pglite');
  const dir = path.join(process.cwd(), '.data', 'pglite');
  require('fs').mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir);
  console.log('[db] DATABASE_URL not set, using local PGlite in .data/pglite');
  return { query: async (text, params) => (await db.query(text, params)).rows };
}

async function query(text, params = []) {
  if (!state.client) {
    state.client = connect().catch((err) => {
      state.client = null;
      throw err;
    });
  }
  const client = await state.client;
  return client.query(text, params);
}

async function ensureTable(table) {
  if (state.tables.has(table)) return;
  await query(`CREATE TABLE IF NOT EXISTS "${table}" (
    id text PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  state.tables.add(table);
}

async function ping() {
  await query('SELECT 1');
}

module.exports = { query, ensureTable, ping };
