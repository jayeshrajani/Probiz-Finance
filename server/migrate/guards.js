// Stage 10 safety checks. They run before any database, Firebase or legacy storage connection is opened.
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

class MigrationRefused extends Error {
  constructor(message) {
    super(message);
    this.name = 'MigrationRefused';
  }
}

function canonicalPath(p) {
  let resolved = path.resolve(p);
  try {
    resolved = fs.realpathSync.native(resolved);
  } catch {
    // Missing folders keep their resolved form; the PG_VERSION check below rejects them.
  }
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

const within = (child, parent) => child === parent || child.startsWith(parent + path.sep);

// Returns the isolated PGlite folder, or throws. Only local PGlite copies outside the repository are accepted.
function assertSafeSource({ pgliteDir = process.env.PGLITE_DIR, databaseUrl = process.env.DATABASE_URL, repoRoot = REPO_ROOT } = {}) {
  if (String(databaseUrl || '').trim()) {
    throw new MigrationRefused('DATABASE_URL is set. Stage 10 reads isolated PGlite copies only; a real Postgres source needs the approved cutover.');
  }
  if (!String(pgliteDir || '').trim()) throw new MigrationRefused('Set PGLITE_DIR to an isolated copy of the PGlite database.');
  const dir = canonicalPath(pgliteDir);
  const original = canonicalPath(path.join(repoRoot, '.data', 'pglite'));
  if (within(dir, original) || within(original, dir)) throw new MigrationRefused('PGLITE_DIR points to the original local database; use an isolated copy.');
  if (within(dir, canonicalPath(repoRoot))) throw new MigrationRefused('PGLITE_DIR must be outside the repository.');
  // Without this, server/db.js would silently create an empty database.
  if (!fs.existsSync(path.join(dir, 'PG_VERSION'))) throw new MigrationRefused('PGLITE_DIR is not an existing PGlite database folder.');
  return path.resolve(pgliteDir);
}

const hostOf = (value) => String(value || '').trim().replace(/:\d+$/, '');

// Returns the demo project ID, or throws. Real Firebase projects are refused in Stage 10.
function assertEmulatorTarget({ storage = false, env = process.env } = {}) {
  const project = String(env.GCLOUD_PROJECT || env.FIREBASE_PROJECT_ID || '').trim();
  if (!env.FIRESTORE_EMULATOR_HOST) throw new MigrationRefused('FIRESTORE_EMULATOR_HOST is not set. Stage 10 writes to the Firestore emulator only.');
  if (storage && !env.FIREBASE_STORAGE_EMULATOR_HOST) throw new MigrationRefused('FIREBASE_STORAGE_EMULATOR_HOST is not set. Stage 10 writes to the Storage emulator only.');
  for (const name of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST']) {
    if (env[name] && !LOOPBACK.has(hostOf(env[name]))) throw new MigrationRefused(`${name} must point to a local emulator.`);
  }
  if (!project.startsWith('demo-')) throw new MigrationRefused('The Firebase project ID must start with "demo-" (emulator only).');
  return project;
}

// The legacy Supabase reader may only reach a local stand-in during Stage 10.
function assertLegacyOrigin(value) {
  if (!value) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new MigrationRefused('LEGACY_SUPABASE_URL is not a valid URL.');
  }
  if (!LOOPBACK.has(url.hostname) && !LOOPBACK.has(`[${url.hostname}]`)) {
    throw new MigrationRefused('LEGACY_SUPABASE_URL must be a local address in Stage 10; reading the real legacy bucket needs the approved cutover.');
  }
  return url.origin;
}

module.exports = { MigrationRefused, assertSafeSource, assertEmulatorTarget, assertLegacyOrigin, REPO_ROOT };
