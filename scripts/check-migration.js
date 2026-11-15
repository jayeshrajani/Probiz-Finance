// Stage 10 migration checks. Firebase emulators and isolated PGlite copies only; never the original database.
// 1. Start fresh emulators (npm run emulators), then with the emulator variables set:
//      node scripts/check-migration.js
//    Copies the isolated baseline (%USERPROFILE%\probiz-baseline) into a new run folder and runs the migration CLI.
// 2. Start the app on the migrated emulator data (DATA_BACKEND=firestore, FILE_STORAGE_BACKEND=firebase), then:
//      node scripts/check-migration.js --app=http://localhost:3000 --run=<run folder printed by step 1>
//    Signs in with migrated accounts and checks that migrated KYC files are only reachable through signed links.
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
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

const { getFirestoreDb, getStorageBucket, closeFirebase } = require('../server/firebase/admin');
const guards = require('../server/migrate/guards');

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
let failures = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` | ${detail}` : ''}`);
};

// ---------- Helpers ----------

async function withPglite(dir, fn) {
  const { PGlite } = require('@electric-sql/pglite');
  const pg = await PGlite.create(dir);
  try {
    return await fn(pg);
  } finally {
    await pg.close();
  }
}

// Full-fidelity text of every row of every table (microsecond timestamps included).
const fingerprint = (dir) => withPglite(dir, async (pg) => {
  const tables = (await pg.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY 1")).rows;
  const out = {};
  for (const { table_name: t } of tables) out[t] = sha256(JSON.stringify((await pg.query(`SELECT x::text AS r FROM "${t}" x ORDER BY 1`)).rows));
  return out;
});

function hashTree(root) {
  const out = {};
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(root, p)] = sha256(fs.readFileSync(p));
    }
  };
  walk(root);
  return out;
}

function cli(run, copy, cliArgs, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...cliArgs, `--state-dir=${path.join(copy, 'state')}`, `--report-dir=${path.join(run, 'reports')}`,
      ...(cliArgs[0] === 'files' ? [`--uploads-dir=${path.join(copy, 'uploads')}`] : [])],
    { cwd: REPO, env: { ...process.env, PGLITE_DIR: path.join(copy, 'pglite'), ...env } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (code) => {
      const read = (label) => {
        const m = new RegExp(`^${label}: (.+)$`, 'm').exec(out);
        return m ? JSON.parse(fs.readFileSync(m[1].trim(), 'utf8')) : null;
      };
      fs.appendFileSync(path.join(run, 'cli.log'), `\n$ ${cliArgs.join(' ')}\n${out}exit=${code}\n`);
      resolve({ code, out, report: read('Report'), retirement: read('Retirement report') });
    });
  });
}

async function emulatorDocs(db) {
  let total = 0;
  const by = {};
  for (const c of await db.listCollections()) {
    const n = (await c.count().get()).data().count;
    by[c.id] = n;
    if (!c.id.startsWith('_')) total += n;
  }
  return { total, by };
}

const privateObjects = async () => (await getStorageBucket().getFiles({ prefix: 'private/' }))[0];

// ---------- Phase 1: migration ----------

async function migrationChecks() {
  const db = getFirestoreDb();
  const start = await emulatorDocs(db);
  if (Object.keys(start.by).length || (await getStorageBucket().getFiles())[0].length) {
    console.error('The emulators already hold data. Start fresh emulators (no import) for these checks.');
    return 1;
  }

  // Guards (pure checks; the original database is never opened).
  const refused = (fn) => { try { fn(); return false; } catch (e) { return e instanceof guards.MigrationRefused; } };
  check(refused(() => guards.assertSafeSource({ pgliteDir: path.join(REPO, '.data', 'pglite') })) &&
    refused(() => guards.assertSafeSource({ pgliteDir: path.join(REPO, '.data', 'pglite', 'base') })) &&
    refused(() => guards.assertSafeSource({ pgliteDir: path.join(REPO, '.data') })) &&
    refused(() => guards.assertSafeSource({ pgliteDir: path.join(BASELINE, '.data', 'pglite'), databaseUrl: 'postgres://example' })) &&
    refused(() => guards.assertSafeSource({ pgliteDir: path.join(BASELINE, 'does-not-exist') })),
  'source guard refuses the original database, repository folders, DATABASE_URL and missing folders');
  check(refused(() => guards.assertEmulatorTarget({ env: { FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', GCLOUD_PROJECT: 'probiz-prod' } })) &&
    refused(() => guards.assertEmulatorTarget({ env: { GCLOUD_PROJECT: 'demo-x' } })) &&
    refused(() => guards.assertEmulatorTarget({ env: { FIRESTORE_EMULATOR_HOST: '10.0.0.5:8080', GCLOUD_PROJECT: 'demo-x' } })) &&
    refused(() => guards.assertEmulatorTarget({ storage: true, env: { FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', GCLOUD_PROJECT: 'demo-x' } })) &&
    refused(() => guards.assertLegacyOrigin('https://example.supabase.co')),
  'target guard refuses real projects, missing or remote emulators and a real legacy bucket');

  // Run folder: isolated copies of the Stage 4B baseline.
  const run = path.join(BASELINE, 'stage10-migrate', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  const A = path.join(run, 'a');
  const B = path.join(run, 'b');
  for (const copy of [A, B]) {
    fs.mkdirSync(copy, { recursive: true });
    fs.cpSync(path.join(BASELINE, '.data', 'pglite'), path.join(copy, 'pglite'), { recursive: true });
  }
  fs.cpSync(path.join(BASELINE, 'public', 'uploads'), path.join(A, 'uploads'), { recursive: true });
  console.log(`Run folder: ${run}`);

  // Local stand-in for the legacy public bucket.
  const REMOTE_PDF = Buffer.from('%PDF-1.4\n% Stage 10 remote fixture\n%%EOF\n');
  const server = http.createServer((req, res) => {
    const base = '/storage/v1/object/public/uploads/image/';
    if (req.url === `${base}media-mig-remote.pdf`) { res.writeHead(200, { 'content-type': 'application/pdf' }); res.end(REMOTE_PDF); return; }
    if (req.url === `${base}media-mig-redirect.pdf`) { res.writeHead(302, { location: `${base}media-mig-remote.pdf` }); res.end(); return; }
    res.writeHead(404); res.end();
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const legacyEnv = { LEGACY_SUPABASE_URL: origin };

  // Synthetic fixtures in copy A (test-only records; no real customer data).
  const HL = require('../server/models/homeloan.model').tableName;
  fs.writeFileSync(path.join(A, 'uploads', 'image', 'media-mig-spoof.pdf'), Buffer.from('MZ\x90\x00 not a pdf'));
  const remoteRef = `${origin}/storage/v1/object/public/uploads/image/media-mig-remote.pdf`;
  await withPglite(path.join(A, 'pglite'), async (pg) => {
    const insert = (table, id, data, c = '2026-03-04 05:06:07.123456+00', u = '2026-03-05 06:07:08.654321+00') =>
      pg.query(`INSERT INTO "${table}" (id, data, created_at, updated_at) VALUES ($1, $2::jsonb, $3, $4)`, [id, JSON.stringify(data), c, u]);
    await insert(HL, 'mig-fixture-files', {
      fullName: 'Migration Fixture',
      uploadedDocuments: {
        panCard: remoteRef,
        aadharFront: `${origin}/storage/v1/object/public/uploads/image/media-mig-redirect.pdf`,
        aadharBack: '/uploads/image/media-mig-spoof.pdf',
        electricityBill: '/uploads/image/media-mig-missing.pdf',
        propertyFront: '/uploads/../../server/db.js',
        propertyInside: 'https://example.invalid/storage/v1/object/public/uploads/image/x.pdf',
        propertyPaper: null,
      },
    });
    await insert(HL, 'mig-conflict-target', { fullName: 'Fixture' });
    await insert(HL, 'mig-conflict-source', { fullName: 'Fixture' });
    await insert('lead_event', 'mig-orphan-event', { leadId: 'mig-missing-lead', type: 'lead.note_added', at: '2026-03-04T05:06:07.000Z', actor: { kind: 'system' }, data: {} });
  });
  const dupEmail = await withPglite(path.join(B, 'pglite'), async (pg) => {
    const [u] = (await pg.query("SELECT data FROM \"user\" WHERE data->>'user_Email' IS NOT NULL ORDER BY id LIMIT 1")).rows;
    const data = { ...u.data, user_Email: String(u.data.user_Email).toUpperCase(), mobile_no: '9000000001' };
    await pg.query('INSERT INTO "user" (id, data) VALUES ($1, $2::jsonb)', ['mig-dup-user', JSON.stringify(data)]);
    return String(u.data.user_Email).toLowerCase();
  });
  const sourceBefore = await fingerprint(path.join(A, 'pglite'));
  const uploadsBefore = hashTree(path.join(A, 'uploads'));

  // CLI refuses to run without the emulator.
  const noEmu = await cli(run, A, ['data'], { FIRESTORE_EMULATOR_HOST: '' });
  check(noEmu.code === 1 && /Refused: FIRESTORE_EMULATOR_HOST/.test(noEmu.out) && !noEmu.report, 'CLI refuses to run without the Firestore emulator');

  // Dry run: zero writes.
  const dry = await cli(run, A, ['data']);
  const total = dry.report?.result.totals.sourceRows;
  const afterDry = await emulatorDocs(db);
  check(dry.code === 0 && total > 0 && dry.report.result.writesNeeded === total && Object.keys(afterDry.by).length === 0 && dry.report.usage.firestoreWrites === 0,
    'data dry run reports the plan and writes nothing', `rows=${total} collections_after=${Object.keys(afterDry.by).length}`);
  check(dry.report?.result.sourceReferences.count === 1 && dry.report.result.sourceReferences.issues[0] === 'lead_event/mig-orphan-event.leadId -> lead/mig-missing-lead',
    'relationships are validated before migration (the planted orphan event is reported)');

  // Interrupted run, then resume.
  const part = await cli(run, A, ['data', '--apply', '--batch-size=50', '--max-writes=120']);
  const afterPart = await emulatorDocs(db);
  check(part.code === 2 && part.report.result.stoppedAtBudget && afterPart.total === 120, 'apply stops cleanly at --max-writes (exit 2)', `docs=${afterPart.total}`);
  const resumed = await cli(run, A, ['data', '--apply', '--resume']);
  const afterResume = await emulatorDocs(db);
  check(resumed.code === 0 && resumed.report.result.checkpointResumed && resumed.report.result.totals.created === total - 120 && afterResume.total === total,
    '--resume continues from the checkpoint and completes without duplicates', `created=${resumed.report?.result.totals.created} docs=${afterResume.total}/${total}`);

  // Idempotency.
  const again = await cli(run, A, ['data', '--apply']);
  check(again.code === 0 && again.report.result.totals.unchanged === total && again.report.usage.firestoreWrites === 0, 'a second apply writes nothing (all unchanged)');

  // Verification and exact values.
  const ver = await cli(run, A, ['verify', '--sample=1000']);
  check(ver.code === 0 && ver.report.result.ok && ver.report.result.references.introduced.length === 0 && ver.report.result.activeAdmins >= 1,
    'verify: counts, full content hashes, unique values, references and active admin', ver.report?.result.failures.join('; '));
  const admins = await withPglite(path.join(A, 'pglite'), async (pg) => (await pg.query('SELECT id, data->>\'password\' AS p FROM admin')).rows);
  const adminDocs = await db.getAll(...admins.map((a) => db.collection('admin').doc(a.id)));
  check(admins.length > 0 && adminDocs.every((d, i) => d.exists && d.get('password') === admins[i].p && /^\$2[aby]\$/.test(admins[i].p)),
    'admin password hashes are copied byte for byte (same IDs)');
  const fx = await db.collection(HL).doc('mig-fixture-files').get();
  const c = fx.get('createdAt');
  const u = fx.get('updatedAt');
  check(c.seconds === Date.UTC(2026, 2, 4, 5, 6, 7) / 1000 && c.nanoseconds === 123456000 && u.nanoseconds === 654321000,
    'original timestamps are kept to the microsecond', `created=${c.seconds}.${c.nanoseconds} updated=${u.nanoseconds}`);

  // Files: dry run.
  const fdry = await cli(run, A, ['files'], legacyEnv);
  const r1 = fdry.report?.result || {};
  check(r1.toMigrate === 5 && r1.refused === 3 && r1.failed === 2 && (await privateObjects()).length === 0 && !(await emulatorDocs(db)).by._migration_files && fdry.report.usage.firestoreWrites === 0,
    'files dry run: 5 to migrate, 3 refused, 2 failed, nothing written', `to=${r1.toMigrate} refused=${r1.refused} failed=${r1.failed}`);

  // Files: apply.
  const fapp = await cli(run, A, ['files', '--apply'], legacyEnv);
  const r2 = fapp.report?.result || {};
  const reasons = [...(r2.lists?.refused || []), ...(r2.lists?.failed || [])].map((x) => `${x.field}:${x.reason}`).sort();
  check(fapp.code === 1 && r2.migrated === 5 && r2.refused === 3 && r2.failed === 2, 'files apply migrates 5 files and reports the rest (exit 1)', reasons.join(' / '));
  check(reasons.some((x) => x.startsWith('uploadedDocuments.aadharBack:content is not')) && reasons.some((x) => x.startsWith('uploadedDocuments.propertyFront:not a file')) &&
    reasons.some((x) => x.startsWith('uploadedDocuments.propertyInside:not a file')) && reasons.some((x) => x.startsWith('uploadedDocuments.aadharFront:download failed')) &&
    reasons.some((x) => x.startsWith('uploadedDocuments.electricityBill:source file not found')),
  'spoofed content, path traversal, other hosts, redirects and missing files are refused or failed safely');
  const manifest = (await db.collection('_migration_files').get()).docs.map((d) => d.data());
  const objects = await privateObjects();
  let verified = 0;
  for (const e of manifest) {
    const file = getStorageBucket().file(e.objectPath);
    const [bytes] = await file.download();
    const [meta] = await file.getMetadata();
    const field = (await db.collection(e.collection).doc(e.docId).get()).get(e.field.join('.'));
    const original = e.legacySource === 'local' ? fs.readFileSync(path.join(A, 'uploads', ...e.legacyKey.split('/'))) : REMOTE_PDF;
    if (e.status === 'migrated' && sha256(bytes) === e.sha256 && bytes.length === e.size && sha256(original) === e.sha256 && field === `pf:${e.objectPath}` &&
      e.pfRef === field && meta.cacheControl === 'private, no-store' && !meta.metadata?.firebaseStorageDownloadTokens) verified += 1;
  }
  check(manifest.length === 5 && objects.length === 5 && verified === 5,
    'each copy matches the source SHA-256 and size, is private (no download token) and the field holds the pf: reference', `manifest=${manifest.length} objects=${objects.length} verified=${verified}`);
  const direct = await fetch(`http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${getStorageBucket().name}/o/${encodeURIComponent(manifest[0]?.objectPath || 'x')}?alt=media`);
  check(direct.status === 403, 'anonymous direct read of a migrated object is denied by storage.rules', `status=${direct.status}`);
  check(fapp.retirement?.ready.length === 5 && fapp.retirement.keep.length === 0 && !JSON.stringify(fapp.retirement).includes('http'),
    'retirement report lists the 5 verified public originals (object keys only, no URLs)');

  // Files: rerun.
  const fagain = await cli(run, A, ['files', '--apply'], legacyEnv);
  check(fagain.report?.result.migrated === 0 && fagain.report.result.alreadyMigrated === 5 && (await privateObjects()).length === 5 &&
    (await db.collection('_migration_files').count().get()).data().count === 5, 'a second files run copies nothing again');

  // Data rerun keeps the pf: references (no false conflicts) and verify still passes.
  const keep = await cli(run, A, ['data', '--apply']);
  check(keep.code === 0 && keep.report.result.totals.unchanged === total && keep.report.result.totals.filesMapped === 5 && keep.report.usage.firestoreWrites === 0,
    'data rerun after the file move: all unchanged, pf: references kept');
  const ver2 = await cli(run, A, ['verify', '--sample=1000']);
  check(ver2.code === 0 && ver2.report.result.ok, 'verify passes after the file move');

  // Originals untouched.
  check(JSON.stringify(await fingerprint(path.join(A, 'pglite'))) === JSON.stringify(sourceBefore), 'source database copy unchanged by every command');
  check(JSON.stringify(hashTree(path.join(A, 'uploads'))) === JSON.stringify(uploadsBefore), 'legacy files unchanged and still present (nothing deleted)');

  // Conflicts are reported, not overwritten.
  await db.collection(HL).doc('mig-conflict-target').update({ fullName: 'Changed in Firestore', updatedAt: new Date() });
  await withPglite(path.join(A, 'pglite'), (pg) => pg.query(
    `UPDATE "${HL}" SET data = jsonb_set(data, '{fullName}', '"Changed in source"'), updated_at = now() WHERE id = 'mig-conflict-source'`));
  const conf = await cli(run, A, ['data', '--apply', `--collections=${HL}`]);
  const conflicts = conf.report?.result.collections[HL]?.conflicts || [];
  const name = async (id) => (await db.collection(HL).doc(id).get()).get('fullName');
  check(conf.code === 1 && conflicts.some((x) => x.id === 'mig-conflict-target' && x.newer === 'target') && conflicts.some((x) => x.id === 'mig-conflict-source' && x.newer === 'source') &&
    (await name('mig-conflict-target')) === 'Changed in Firestore' && (await name('mig-conflict-source')) === 'Fixture',
  'conflicts are reported (exit 1) and neither document is overwritten');
  const older = await cli(run, A, ['data', '--apply', `--collections=${HL}`, '--update-older']);
  check(older.code === 1 && older.report.result.totals.updated === 1 && (await name('mig-conflict-source')) === 'Changed in source' &&
    (await name('mig-conflict-target')) === 'Changed in Firestore', '--update-older replaces only the document whose source is newer');

  // Duplicate unique values refuse the collection.
  const dup = await cli(run, B, ['data', '--collections=user']);
  const dupText = JSON.stringify(dup.report || {}).toLowerCase();
  check(dup.code === 1 && dup.report.result.refused.includes('user') && dup.report.result.collections.user.duplicates.some((d) => d.field === 'user_Email' && d.ids.includes('mig-dup-user')) &&
    !dupText.includes(dupEmail) && !dup.out.toLowerCase().includes(dupEmail), 'case-insensitive duplicate emails refuse the collection; the report shows masked values only');

  // Reports contain no personal data or credentials.
  const reports = fs.readdirSync(path.join(run, 'reports')).map((f) => fs.readFileSync(path.join(run, 'reports', f), 'utf8')).join('\n');
  const leaks = { bcrypt: /\$2[aby]\$/, email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/, url: /https?:\/\//, phone: /"\d{10}"/, token: /token=|Bearer /i };
  const found = Object.entries(leaks).filter(([, re]) => re.test(reports)).map(([k]) => k);
  check(found.length === 0, 'reports contain no password hashes, emails, phone numbers, URLs or tokens', found.join(','));

  server.close();
  const pick = fapp.retirement?.ready.find((x) => x.collection === HL && x.legacySource === 'local');
  fs.writeFileSync(path.join(run, 'run-info.json'), JSON.stringify({ run, collection: HL, docId: pick?.docId, field: pick?.field, sha256: pick?.sha256,
    objectPath: manifest.find((e) => e.docId === pick?.docId && e.field.join('.') === pick?.field)?.objectPath }, null, 2));
  console.log(`Run info: ${path.join(run, 'run-info.json')}`);
  return failures;
}

// ---------- Phase 2: access through the app ----------

async function appChecks(base, runDir) {
  const info = JSON.parse(fs.readFileSync(path.join(runDir, 'run-info.json'), 'utf8'));
  const call = async (p, { method = 'GET', body, token } = {}) => {
    const headers = { 'x-forwarded-for': `10.91.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` };
    if (token) headers.authorization = `Bearer ${token}`;
    if (body) headers['content-type'] = 'application/json';
    const res = await fetch(`${base}/api/${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  };
  if (!process.env.ADMIN_PASSWORD || !process.env.CUSTOMER_PASSWORD) throw new Error('Set ADMIN_PASSWORD and CUSTOMER_PASSWORD for the local test accounts.');
  const admin = (await call('staffLogin', { method: 'POST', body: { email: process.env.ADMIN_EMAIL || 'admin@probiz.com', password: process.env.ADMIN_PASSWORD } })).data.accessToken;
  const customer = (await call('userLogin', { method: 'POST', body: { user_Email: process.env.CUSTOMER_EMAIL || 'priya@example.com', password: process.env.CUSTOMER_PASSWORD } })).data.accessToken;
  check(Boolean(admin && customer), 'migrated staff and customer accounts sign in (password hashes preserved)');

  const key = info.field.split('.').pop();
  const detail = await call(`admin/leads/homeloan/${info.docId}`, { token: admin });
  const link = detail.data?.data?.fields?.uploadedDocuments?.[key] || '';
  const file = link.startsWith('/api/files/') ? await fetch(`${base}${link}`) : null;
  const bytes = file ? Buffer.from(await file.arrayBuffer()) : Buffer.alloc(0);
  check(detail.status === 200 && file?.status === 200 && sha256(bytes) === info.sha256, 'admin opens the migrated document through a signed link (same SHA-256)',
    `detail=${detail.status} file=${file?.status}`);
  const anon = await call(`admin/leads/homeloan/${info.docId}`);
  const asCustomer = await call(`admin/leads/homeloan/${info.docId}`, { token: customer });
  const direct = await fetch(`http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${getStorageBucket().name}/o/${encodeURIComponent(info.objectPath)}?alt=media`);
  check(anon.status === 401 && asCustomer.status === 401 && direct.status === 403, 'anonymous and customer requests are refused; the bucket denies direct reads',
    `anonymous=${anon.status} customer=${asCustomer.status} direct=${direct.status}`);
  const legacyList = await call('getHomeLoan', { token: admin });
  const listed = (legacyList.data?.data || []).find((d) => String(d._id) === info.docId);
  check(String(listed?.uploadedDocuments?.[key] || '').startsWith('pf:'), 'legacy list returns the pf: reference, not a public URL');
  return failures;
}

(args.app ? appChecks(args.app.replace(/\/$/, ''), args.run) : migrationChecks())
  .then((n) => {
    console.log(n ? `${n} check(s) failed` : 'All migration checks passed');
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
