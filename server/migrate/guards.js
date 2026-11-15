// Migration safety checks. They run before any database, Firebase or legacy storage connection is opened.
// Local copies and the emulators need no confirmation; every real system must be named on the command line.
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

function postgresHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    throw new MigrationRefused('DATABASE_URL is not a valid connection string.');
  }
}

// Returns { kind, label } for the Postgres side (source of `to-firestore`, target of `to-postgres`).
// A PGlite copy outside the repository is accepted; a real Postgres needs --confirm-source=<its host name>.
function assertSafeSource({ pgliteDir = process.env.PGLITE_DIR, databaseUrl = process.env.DATABASE_URL, confirmSource = null, repoRoot = REPO_ROOT } = {}) {
  if (String(databaseUrl || '').trim()) {
    const host = postgresHost(databaseUrl);
    if (!confirmSource) throw new MigrationRefused('DATABASE_URL is set. Name the database host with --confirm-source=<host> to use a real Postgres database.');
    if (confirmSource !== host) throw new MigrationRefused('--confirm-source does not match the DATABASE_URL host.');
    return { kind: 'postgres', label: `postgres:${host}` };
  }
  if (!String(pgliteDir || '').trim()) throw new MigrationRefused('Set PGLITE_DIR to an isolated copy of the PGlite database (or DATABASE_URL with --confirm-source).');
  const dir = canonicalPath(pgliteDir);
  const original = canonicalPath(path.join(repoRoot, '.data', 'pglite'));
  if (within(dir, original) || within(original, dir)) throw new MigrationRefused('PGLITE_DIR points to the original local database; use an isolated copy.');
  if (within(dir, canonicalPath(repoRoot))) throw new MigrationRefused('PGLITE_DIR must be outside the repository.');
  // Without this, server/db.js would silently create an empty database.
  if (!fs.existsSync(path.join(dir, 'PG_VERSION'))) throw new MigrationRefused('PGLITE_DIR is not an existing PGlite database folder.');
  return { kind: 'pglite', label: path.resolve(pgliteDir) };
}

const hostOf = (value) => String(value || '').trim().replace(/:\d+$/, '');

// Returns { mode, projectId }. Emulators: local hosts and a demo- project. Real project: no emulator variables and
// --confirm-project equal to FIREBASE_PROJECT_ID.
function assertTarget({ storage = false, confirmProject = null, env = process.env } = {}) {
  const project = String(env.FIREBASE_PROJECT_ID || env.GCLOUD_PROJECT || '').trim();
  if (!env.FIRESTORE_EMULATOR_HOST && !env.FIREBASE_STORAGE_EMULATOR_HOST) {
    if (!confirmProject) throw new MigrationRefused('FIRESTORE_EMULATOR_HOST is not set. Use the emulators, or name a real project with --confirm-project=<project id>.');
    if (!project || project.startsWith('demo-')) throw new MigrationRefused('A real migration needs FIREBASE_PROJECT_ID set to the real (non-demo) project.');
    if (confirmProject !== project) throw new MigrationRefused('--confirm-project does not match FIREBASE_PROJECT_ID.');
    if (storage && !String(env.FIREBASE_STORAGE_BUCKET || '').trim()) throw new MigrationRefused('FIREBASE_STORAGE_BUCKET must be set for a real file migration.');
    return { mode: 'real', projectId: project };
  }
  if (confirmProject) throw new MigrationRefused('--confirm-project is only for real projects; unset the emulator variables to use one.');
  if (!env.FIRESTORE_EMULATOR_HOST) throw new MigrationRefused('FIRESTORE_EMULATOR_HOST is not set (the Storage emulator alone is not enough).');
  if (storage && !env.FIREBASE_STORAGE_EMULATOR_HOST) throw new MigrationRefused('FIREBASE_STORAGE_EMULATOR_HOST is not set.');
  for (const name of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST']) {
    if (env[name] && !LOOPBACK.has(hostOf(env[name]))) throw new MigrationRefused(`${name} must point to a local emulator.`);
  }
  if (!project.startsWith('demo-')) throw new MigrationRefused('The Firebase project ID must start with "demo-" when using the emulators.');
  return { mode: 'emulator', projectId: project };
}

const assertEmulatorTarget = (options = {}) => assertTarget({ ...options, confirmProject: null });

// The legacy bucket reader: a local stand-in, or the real bucket host named with --confirm-legacy-host (HTTPS only).
function assertLegacyOrigin(value, confirmHost = null) {
  if (!value) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new MigrationRefused('LEGACY_SUPABASE_URL is not a valid URL.');
  }
  if (LOOPBACK.has(url.hostname) || LOOPBACK.has(`[${url.hostname}]`)) return url.origin;
  if (!confirmHost) throw new MigrationRefused('LEGACY_SUPABASE_URL is not local. Name its host with --confirm-legacy-host=<host> to read the real legacy bucket.');
  if (url.protocol !== 'https:') throw new MigrationRefused('The real legacy bucket must be read over HTTPS.');
  if (confirmHost !== url.hostname) throw new MigrationRefused('--confirm-legacy-host does not match LEGACY_SUPABASE_URL.');
  return url.origin;
}

module.exports = { MigrationRefused, assertSafeSource, assertTarget, assertEmulatorTarget, assertLegacyOrigin, REPO_ROOT };
