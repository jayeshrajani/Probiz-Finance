// Stage 13A checks: real-project gates, forward catch-up (--since), rollback copy (to-postgres) and its verification.
// Firebase emulators and isolated PGlite copies only; never the original database or a real project.
// 1. Start fresh emulators, then with the emulator variables set:
//      node scripts/check-rollback.js
// 2. Start the app in the rollback state (DATA_BACKEND=postgres on the printed rollback copy, FILE_STORAGE_BACKEND=firebase), then:
//      ADMIN_PASSWORD=... node scripts/check-rollback.js --app=http://localhost:3000 --run=<run folder>
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const CLI = path.join(REPO, 'scripts', 'migrate-firestore.js');
const BASELINE = path.join(os.homedir(), 'probiz-baseline');
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split(/=(.*)/s)));

const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '').trim();
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST || !project.startsWith('demo-') || (process.env.DATABASE_URL || '').trim()) {
  console.error('Set FIRESTORE_EMULATOR_HOST, FIREBASE_STORAGE_EMULATOR_HOST and a demo- GCLOUD_PROJECT, and unset DATABASE_URL.');
  process.exit(1);
}

const { getFirestoreDb, getStorageBucket, closeFirebase, firebaseTarget } = require('../server/firebase/admin');
const guards = require('../server/migrate/guards');

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
let failures = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` | ${detail}` : ''}`);
};
const throws = (fn, re) => {
  try {
    fn();
    return false;
  } catch (e) {
    return re ? re.test(e.message) : true;
  }
};

async function withPglite(dir, fn) {
  const { PGlite } = require('@electric-sql/pglite');
  const pg = await PGlite.create(dir);
  try {
    return await fn(pg);
  } finally {
    await pg.close();
  }
}

// { table: Map(id -> full row text) } for every table.
const rowsByTable = (dir) => withPglite(dir, async (pg) => {
  const tables = (await pg.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> 'rate_limits'")).rows;
  const out = {};
  for (const { table_name: t } of tables) {
    out[t] = new Map((await pg.query(`SELECT id, x::text AS r FROM "${t}" x`)).rows.map((r) => [r.id, r.r]));
  }
  return out;
});

function cli(run, cliArgs, { pglite, state, env = {} }) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...cliArgs, `--state-dir=${state}`, `--report-dir=${path.join(run, 'reports')}`], {
      cwd: REPO, env: { ...process.env, PGLITE_DIR: pglite, ...env },
    });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (code) => {
      fs.appendFileSync(path.join(run, 'cli.log'), `\n$ ${cliArgs.join(' ')}\n${out}exit=${code}\n`);
      const m = /^Report: (.+)$/m.exec(out);
      resolve({ code, out, report: m ? JSON.parse(fs.readFileSync(m[1].trim(), 'utf8')) : null });
    });
  });
}

// Runs a snippet in a fresh Node process with exactly the given environment (no emulator variables inherited).
function node(code, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['-e', code], { cwd: REPO, env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, ...env } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (status) => resolve({ status, out: out.trim() }));
  });
}

async function totalDocs(db) {
  let n = 0;
  for (const c of await db.listCollections()) if (!c.id.startsWith('_') && !['locks', 'rate_limits'].includes(c.id)) n += (await c.count().get()).data().count;
  return n;
}

// ---------- Phase 1 ----------

async function rollbackChecks() {
  const db = getFirestoreDb();
  if ((await db.listCollections()).length || (await getStorageBucket().getFiles())[0].length) {
    console.error('The emulators already hold data. Start fresh emulators (no import) for these checks.');
    return 1;
  }

  // Real-project gates (no network: nothing here connects to Google).
  const real = { FIREBASE_PROJECT_ID: 'probiz-real-test' };
  check(throws(() => firebaseTarget(real), /FIREBASE_CONFIRM_PROJECT/) && throws(() => firebaseTarget({ ...real, FIREBASE_CONFIRM_PROJECT: 'other' })) &&
    firebaseTarget({ ...real, FIREBASE_CONFIRM_PROJECT: 'probiz-real-test' }).mode === 'real' && throws(() => firebaseTarget({ FIREBASE_PROJECT_ID: 'demo-x' })) &&
    throws(() => firebaseTarget({ ...real, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_CONFIRM_PROJECT: 'probiz-real-test' })) &&
    firebaseTarget({ GCLOUD_PROJECT: 'demo-x', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' }).mode === 'emulator',
  'app gate: a real project needs FIREBASE_CONFIRM_PROJECT equal to FIREBASE_PROJECT_ID; demo projects only on emulators');
  const appProbe = `
    const out = {};
    try { require('./server/data').adapter(); out.data = 'loaded'; } catch (e) { out.data = e.message; }
    Promise.resolve().then(() => require('./server/storage').openPrivateFile('x'))
      .then((v) => { out.storage = v === null ? 'loaded' : 'other'; }, (e) => { out.storage = e.message; })
      .finally(() => console.log(JSON.stringify(out)));`;
  const closed = JSON.parse((await node(appProbe, { DATA_BACKEND: 'firestore', FILE_STORAGE_BACKEND: 'firebase', ...real })).out || '{}');
  const opened = JSON.parse((await node(appProbe, { DATA_BACKEND: 'firestore', FILE_STORAGE_BACKEND: 'firebase', ...real, FIREBASE_CONFIRM_PROJECT: 'probiz-real-test' })).out || '{}');
  check(/refused/.test(closed.data) && /refused/.test(closed.storage) && opened.data === 'loaded' && opened.storage === 'loaded',
    'app: Firestore and Storage backends refuse an unconfirmed real project and load (without connecting) once confirmed', JSON.stringify({ closed, opened }));
  const fbEnv = { FIREBASE_PROJECT_ID: 'probiz-real-test' };
  const realTarget = guards.assertTarget({ confirmProject: 'probiz-real-test', env: fbEnv });
  check(realTarget.mode === 'real' && throws(() => guards.assertTarget({ confirmProject: 'probiz-other', env: fbEnv })) &&
    throws(() => guards.assertTarget({ env: fbEnv }), /FIRESTORE_EMULATOR_HOST/) &&
    throws(() => guards.assertTarget({ confirmProject: 'demo-x', env: { GCLOUD_PROJECT: 'demo-x', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' } })) &&
    throws(() => guards.assertTarget({ storage: true, confirmProject: 'probiz-real-test', env: fbEnv }), /FIREBASE_STORAGE_BUCKET/),
  'migration target: real project only with a matching --confirm-project and no emulator variables');
  const url = 'postgres://reader@db.example.internal:5432/app';
  check(throws(() => guards.assertSafeSource({ databaseUrl: url }), /confirm-source/) && throws(() => guards.assertSafeSource({ databaseUrl: url, confirmSource: 'other' })) &&
    guards.assertSafeSource({ databaseUrl: url, confirmSource: 'db.example.internal' }).kind === 'postgres' &&
    throws(() => guards.assertSafeSource({ pgliteDir: path.join(REPO, '.data', 'pglite') })),
  'migration source: DATABASE_URL only with a matching --confirm-source; the original PGlite folder is still refused');
  check(guards.assertLegacyOrigin('https://legacy.example.co', 'legacy.example.co') === 'https://legacy.example.co' &&
    throws(() => guards.assertLegacyOrigin('https://legacy.example.co')) && throws(() => guards.assertLegacyOrigin('http://legacy.example.co', 'legacy.example.co')) &&
    throws(() => guards.assertLegacyOrigin('https://legacy.example.co', 'other.example.co')),
  'legacy bucket: a real host only over HTTPS with a matching --confirm-legacy-host');

  // Run folder: A = isolated copy acting as the production Postgres; B = empty database for a full rollback copy.
  const run = path.join(BASELINE, 'stage13a-rollback', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  const A = path.join(run, 'a', 'pglite');
  const B = path.join(run, 'b', 'pglite');
  fs.mkdirSync(path.dirname(A), { recursive: true });
  fs.cpSync(path.join(BASELINE, '.data', 'pglite'), A, { recursive: true });
  fs.cpSync(path.join(BASELINE, 'public', 'uploads'), path.join(run, 'a', 'uploads'), { recursive: true });
  fs.mkdirSync(B, { recursive: true });
  await withPglite(B, async () => {});
  console.log(`Run folder: ${run}`);
  const onA = { pglite: A, state: path.join(run, 'a', 'state') };
  const onB = { pglite: B, state: path.join(run, 'b', 'state') };

  // Forward migration (T0) and file move.
  const T0 = new Date().toISOString();
  await new Promise((r) => setTimeout(r, 20));
  const fwd = await cli(run, ['data', '--apply'], onA);
  const files = await cli(run, ['files', '--apply', `--uploads-dir=${path.join(run, 'a', 'uploads')}`], onA);
  const migratedFiles = files.report?.result.migrated;
  check(fwd.code === 0 && files.code === 0 && migratedFiles > 0, 'forward copy and file move complete', `rows=${fwd.report?.result.totals.created} files=${migratedFiles}`);

  // Forward catch-up: a source edit and a new source record after T0.
  await withPglite(A, async (pg) => {
    await pg.query(`UPDATE contact SET data = jsonb_set(data, '{message}', '"edited after T0"'), updated_at = now() WHERE id = (SELECT id FROM contact ORDER BY id LIMIT 1)`);
    await pg.query(`INSERT INTO contact (id, data) VALUES ('rb-new-contact', '{"name":"Catch-up Fixture","email":"x","mobile_no":"0","message":"new after T0"}'::jsonb)`);
  });
  const since = `--since=${T0}`;
  const cDry = await cli(run, ['data', since], onA);
  const cApply = await cli(run, ['data', since, '--apply'], onA);
  const cOlder = await cli(run, ['data', since, '--apply', '--update-older'], onA);
  const cAgain = await cli(run, ['data', since, '--apply'], onA);
  const firstContact = await withPglite(A, async (pg) => (await pg.query('SELECT id FROM contact ORDER BY id LIMIT 1')).rows[0].id);
  check(cDry.report?.result.totals.sourceRows === 2 && cDry.report.result.totals.missing === 1 && cDry.report.result.totals.sourceNewer === 1 && cDry.report.usage.firestoreWrites === 0,
    '--since dry run sees only the 2 records changed after T0 and writes nothing', `rows=${cDry.report?.result.totals.sourceRows}`);
  check(cApply.code === 1 && cApply.report.result.totals.created === 1 && cOlder.code === 0 && cOlder.report.result.totals.updated === 1 &&
    (await db.collection('contact').doc(firstContact).get()).get('message') === 'edited after T0' && cAgain.code === 0 && cAgain.report.result.totals.unchanged === 2,
  'catch-up: new record copied; the edited record is held as a conflict until --update-older; rerun unchanged');

  // Cutover (T1), then writes made by the app in Firebase mode.
  const T1 = new Date().toISOString();
  await new Promise((r) => setTimeout(r, 20));
  const { useBackend } = require('../server/data');
  useBackend('firestore');
  const Contact = require('../server/models/contact.model');
  const Lead = require('../server/models/lead.model');
  const created = await Contact.create({ name: 'Rollback Fixture', email: 'rollback.fixture@example.com', mobile_no: '9000000009', message: 'written after cutover' });
  const lead = await Lead.findOne({ status: 'new' });
  lead.status = 'contacted';
  await lead.save();
  const fsTotal = await totalDocs(db);

  // Rollback window copy into A (the original Postgres).
  const rSince = `--since=${T1}`;
  const before = await rowsByTable(A);
  const rDry = await cli(run, ['data', '--direction=to-postgres', rSince], onA);
  const afterDry = await rowsByTable(A);
  const unchangedByDry = Object.keys(before).every((t) => [...before[t]].every(([id, r]) => afterDry[t]?.get(id) === r));
  check(rDry.code === 1 && rDry.report?.result.totals.sourceDocs === 2 && rDry.report.result.totals.missing === 1 && rDry.report.result.totals.sourceNewer === 1 && unchangedByDry,
    'rollback dry run (--since T1) finds the 2 post-cutover changes and leaves Postgres unchanged', `docs=${rDry.report?.result.totals.sourceDocs}`);
  const rApply = await cli(run, ['data', '--direction=to-postgres', rSince, '--apply'], onA);
  const rOlder = await cli(run, ['data', '--direction=to-postgres', rSince, '--apply', '--update-older'], onA);
  const rAgain = await cli(run, ['data', '--direction=to-postgres', rSince, '--apply'], onA);
  const rowsA = await rowsByTable(A);
  check(rApply.code === 1 && rApply.report.result.totals.created === 1 && rOlder.code === 0 && rOlder.report.result.totals.updated === 1 &&
    rowsA.contact.has(created._id) && /"contacted"/.test(rowsA.lead.get(lead._id) || '') && rAgain.code === 0 && rAgain.report.result.totals.unchanged === 2,
  'rollback copy: new record inserted; the changed lead held as a conflict until --update-older; rerun unchanged');
  const vA = await cli(run, ['verify', '--direction=to-postgres', '--sample=1000'], onA);
  check(vA.code === 0 && vA.report.result.ok && vA.report.result.legacyFileRefs === migratedFiles,
    'rollback verify on the original Postgres: counts, content, references, active admin; legacy file URLs reported', `legacy refs=${vA.report?.result.legacyFileRefs}`);

  // Full rollback copy into an empty database, interrupted by the read budget, then resumed.
  const part = await cli(run, ['data', '--direction=to-postgres', '--apply', '--batch-size=100', '--max-reads=300'], onB);
  const rest = await cli(run, ['data', '--direction=to-postgres', '--apply', '--resume'], onB);
  const createdB = (part.report?.result.totals.created || 0) + (rest.report?.result.totals.created || 0);
  check(part.code === 2 && rest.code === 0 && rest.report.result.checkpointResumed && createdB === fsTotal,
    'full rollback copy stops at --max-reads (exit 2) and --resume completes without duplicates', `created=${createdB}/${fsTotal}`);
  const vB = await cli(run, ['verify', '--direction=to-postgres', '--sample=1000'], onB);
  const again = await cli(run, ['data', '--direction=to-postgres', '--apply'], onB);
  check(vB.code === 0 && vB.report.result.ok && vB.report.result.legacyFileRefs === 0 && again.code === 0 && again.report.result.totals.created === 0 &&
    again.report.result.totals.unchanged === fsTotal, 'rollback verify on the new database passes (private file references kept); a rerun writes nothing');

  // Round trip: A (original + rollback window) and B (from Firestore) hold identical rows, except the moved file references.
  const rowsB = await rowsByTable(B);
  const manifest = (await db.collection('_migration_files').get()).docs.map((d) => d.data());
  const fileDocs = new Set(manifest.map((e) => e.docId));
  let same = 0;
  const unexpected = [];
  for (const t of Object.keys(rowsA)) {
    for (const [id, r] of rowsA[t]) {
      if (rowsB[t]?.get(id) === r) same += 1;
      else if (!(fileDocs.has(id) && rowsB[t]?.has(id))) unexpected.push(`${t}/${id}`);
    }
    for (const id of rowsB[t]?.keys() || []) if (!rowsA[t].has(id)) unexpected.push(`${t}/${id} (only in B)`);
  }
  check(unexpected.length === 0 && same > 0, 'round trip Postgres -> Firestore -> Postgres: IDs, data, password hashes and microsecond timestamps identical (only moved file references differ)',
    `identical=${same} differing=${unexpected.length}`);

  // Reports.
  const reports = fs.readdirSync(path.join(run, 'reports')).map((f) => fs.readFileSync(path.join(run, 'reports', f), 'utf8')).join('\n');
  const leaks = { bcrypt: /\$2[aby]\$/, email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/, phone: /"\d{10}"/, token: /token=|Bearer /i };
  const found = Object.entries(leaks).filter(([, re]) => re.test(reports)).map(([k]) => k);
  check(found.length === 0, 'reports contain no password hashes, emails, phone numbers or tokens', found.join(','));

  const pick = manifest.find((e) => e.collection === 'loan_offer');
  fs.writeFileSync(path.join(run, 'run-info.json'), JSON.stringify({ run, rollbackDb: B, contactName: 'Rollback Fixture', docId: pick?.docId, field: pick?.field.join('.'), sha256: pick?.sha256 }, null, 2));
  console.log(`Rollback database for the app check: ${B}`);
  console.log(`Run info: ${path.join(run, 'run-info.json')}`);
  return failures;
}

// ---------- Phase 2: the app on the rolled-back database ----------

async function appChecks(base, runDir) {
  const info = JSON.parse(fs.readFileSync(path.join(runDir, 'run-info.json'), 'utf8'));
  if (!process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_PASSWORD for the local test admin account.');
  const call = async (p, { method = 'GET', body, token } = {}) => {
    const headers = { 'x-forwarded-for': `10.94.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` };
    if (token) headers.authorization = `Bearer ${token}`;
    if (body) headers['content-type'] = 'application/json';
    const res = await fetch(`${base}/api/${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  };
  const health = await call('health');
  const admin = (await call('staffLogin', { method: 'POST', body: { email: process.env.ADMIN_EMAIL || 'admin@probiz.com', password: process.env.ADMIN_PASSWORD } })).data.accessToken;
  check(health.status === 200 && Boolean(admin), 'rolled-back app (Postgres) is healthy and the admin signs in');
  const contacts = await call('getContactUs', { token: admin });
  check(JSON.stringify(contacts.data).includes(info.contactName), 'a record written in Firebase mode after cutover is present after rollback');
  const key = info.field.split('.').pop();
  const detail = await call(`admin/leads/homeloan/${info.docId}`, { token: admin });
  const link = detail.data?.data?.fields?.uploadedDocuments?.[key] || '';
  const file = link.startsWith('/api/files/') ? await fetch(`${base}${link}`) : null;
  const bytes = file ? Buffer.from(await file.arrayBuffer()) : Buffer.alloc(0);
  const anon = await call(`admin/leads/homeloan/${info.docId}`);
  check(detail.status === 200 && file?.status === 200 && sha256(bytes) === info.sha256 && anon.status === 401,
    'private documents still open through signed links after rollback (Firebase Storage kept); anonymous 401', `detail=${detail.status} file=${file?.status}`);
  return failures;
}

(args.app ? appChecks(args.app.replace(/\/$/, ''), args.run) : rollbackChecks())
  .then((n) => {
    console.log(n ? `${n} check(s) failed` : 'All rollback checks passed');
    process.exitCode = n ? 1 : 0;
  })
  .catch((err) => {
    console.error(`FAIL ${err.stack || err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeFirebase();
    setTimeout(() => process.exit(process.exitCode), 2000).unref();
  });
