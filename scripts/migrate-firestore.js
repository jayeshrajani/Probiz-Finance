// Usage (Stage 10: Firebase emulators and isolated PGlite copies only):
//   PGLITE_DIR=<isolated copy> FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 \
//   GCLOUD_PROJECT=demo-probiz-finance node scripts/migrate-firestore.js <data|files|verify> [options]
// Environment files are not loaded on purpose: every source and target must be given explicitly.
// Exit codes: 0 done, 1 refused / conflicts / failures (see the report), 2 stopped at --max-writes (rerun with --resume).
const fs = require('fs');
const path = require('path');
const { MigrationRefused, assertSafeSource, assertEmulatorTarget, assertLegacyOrigin } = require('../server/migrate/guards');

const USAGE = `Usage: node scripts/migrate-firestore.js <data|files|verify> [options]
  --dry-run (default) | --apply     write nothing unless --apply is given (verify never writes)
  --resume                          data: continue from the last checkpoint
  --update-older                    data: replace target documents only when the source record is newer
  --collections=a,b                 limit to these collections (table names)
  --batch-size=400                  rows per page / documents per batch (1-500)
  --max-writes=18000                stop cleanly before this many Firestore writes (free daily quota is 20,000)
  --sample=50                       verify: documents compared per collection
  --uploads-dir=public/uploads      files: folder holding legacy /uploads/... files
  --state-dir=.data/migration/state --report-dir=.data/migration/reports
Legacy bucket (files only): LEGACY_SUPABASE_URL (local address only in Stage 10), LEGACY_SUPABASE_BUCKET (default uploads).`;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!['data', 'files', 'verify'].includes(command)) throw new Error('Unknown or missing command.');
  const o = {
    command, apply: false, dryRun: false, resume: false, updateOlder: false, collections: null, batchSize: 400, maxWrites: 18000, sample: 50,
    uploadsDir: 'public/uploads', stateDir: '.data/migration/state', reportDir: '.data/migration/reports',
  };
  const int = (v, min, max, name) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer from ${min} to ${max}.`);
    return n;
  };
  for (const arg of rest) {
    const eq = arg.indexOf('=');
    const key = eq < 0 ? arg : arg.slice(0, eq);
    const value = eq < 0 ? null : arg.slice(eq + 1);
    const need = () => {
      if (!value) throw new Error(`${key} needs a value.`);
      return value;
    };
    switch (key) {
      case '--dry-run': o.dryRun = true; break;
      case '--apply': o.apply = true; break;
      case '--resume': o.resume = true; break;
      case '--update-older': o.updateOlder = true; break;
      case '--collections': o.collections = need().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--batch-size': o.batchSize = int(need(), 1, 500, key); break;
      case '--max-writes': o.maxWrites = int(need(), 1, 10000000, key); break;
      case '--sample': o.sample = int(need(), 1, 1000, key); break;
      case '--uploads-dir': o.uploadsDir = need(); break;
      case '--state-dir': o.stateDir = need(); break;
      case '--report-dir': o.reportDir = need(); break;
      default: throw new Error(`Unknown option ${key}.`);
    }
  }
  if (o.apply && o.dryRun) throw new Error('Use either --dry-run or --apply.');
  if (o.command === 'verify' && o.apply) throw new Error('verify never writes; --apply is not accepted.');
  if ((o.resume || o.updateOlder) && o.command !== 'data') throw new Error('--resume and --update-older apply to the data command only.');
  return o;
}

function legacySettings(opts, origin) {
  const bucket = String(process.env.LEGACY_SUPABASE_BUCKET || 'uploads').trim();
  if (!/^[A-Za-z0-9._-]+$/.test(bucket)) throw new MigrationRefused('LEGACY_SUPABASE_BUCKET is not a valid bucket name.');
  const dir = path.resolve(opts.uploadsDir);
  return {
    uploadsRoot: fs.existsSync(dir) ? fs.realpathSync(dir) : null,
    supabasePrefix: origin ? `${origin}/storage/v1/object/public/${bucket}/` : null,
  };
}

function exitCodeFor(command, result) {
  if (command === 'verify') return result.ok ? 0 : 1;
  if (command === 'data') {
    if (result.refused.length || result.totals.invalid || result.totals.sourceNewer || result.totals.targetNewer) return 1;
    return result.stoppedAtBudget ? 2 : 0;
  }
  if (result.refused || result.failed || result.skipped) return 1;
  return result.stoppedAtBudget ? 2 : 0;
}

function summary(command, result) {
  if (command === 'data') {
    const t = result.totals;
    return [
      `rows ${t.sourceRows}, to create ${t.missing}, created ${t.created}, unchanged ${t.unchanged}, updated ${t.updated}`,
      `conflicts: source newer ${t.sourceNewer}, target newer ${t.targetNewer}; invalid ${t.invalid}; refused collections ${result.refused.length ? result.refused.join(', ') : 'none'}`,
      `transforms: explicit nulls ${t.nullsFilled}, lastActivityAt filled ${t.lastActivityFilled}, migrated file refs kept ${t.filesMapped}; schema warnings ${t.schemaWarnings}`,
      result.sourceReferences ? `source references: ${result.sourceReferences.count} broken (reported, not fixed)` : null,
      result.stoppedAtBudget ? `stopped at the write budget in ${result.stoppedAtBudget}; rerun with --resume` : null,
    ].filter(Boolean);
  }
  if (command === 'verify') {
    return [`references: source ${result.references.sourceIssues} broken, target ${result.references.targetIssues}, introduced ${result.references.introduced.length}; active admins ${result.activeAdmins}`,
      result.ok ? 'verification passed' : `verification FAILED: ${result.failures.join('; ')}`];
  }
  return [
    `references ${result.references}: to migrate ${result.toMigrate}, migrated ${result.migrated}, already migrated ${result.alreadyMigrated}, already private ${result.alreadyPrivate}`,
    `refused ${result.refused}, failed ${result.failed}, skipped ${result.skipped}${result.stoppedAtBudget ? '; stopped at the write budget' : ''}`,
  ];
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`${err.message}\n${USAGE}`);
    process.exitCode = 1;
    return;
  }
  // Safety checks first: nothing is opened before they pass.
  const pgliteDir = assertSafeSource();
  const project = assertEmulatorTarget({ storage: opts.command === 'files' });
  const legacy = opts.command === 'files' ? legacySettings(opts, assertLegacyOrigin(process.env.LEGACY_SUPABASE_URL)) : null;

  const { getFirestoreDb, closeFirebase } = require('../server/firebase/admin');
  const { loadModels } = require('../server/migrate/source');
  const { Checkpoint, WriteBudget, writeReport } = require('../server/migrate/run');
  const startedAt = new Date().toISOString();
  const ctx = {
    db: getFirestoreDb(), models: loadModels(), apply: opts.apply, resume: opts.resume, updateOlder: opts.updateOlder,
    collections: opts.collections, batchSize: opts.batchSize, budget: new WriteBudget(opts.maxWrites), meter: { reads: 0, writes: 0 },
    checkpoint: new Checkpoint(path.resolve(opts.stateDir), pgliteDir, project), log: (line) => console.log(line),
  };
  const mode = opts.command === 'verify' ? 'read-only' : opts.apply ? 'apply' : 'dry-run';
  console.log(`[migrate] ${opts.command} (${mode}) -> ${project} on the emulator`);
  try {
    let result;
    let extra = null;
    if (opts.command === 'data') {
      result = await require('../server/migrate/data').runData(ctx);
      if (!opts.apply) {
        const { referenceIssues, sourceReader } = require('../server/migrate/verify');
        const refs = await referenceIssues(sourceReader);
        result.sourceReferences = { issues: refs.issues.slice(0, 50), count: refs.issues.length, applicationsWithoutLead: refs.applicationsWithoutLead };
      }
    } else if (opts.command === 'verify') {
      result = await require('../server/migrate/verify').runVerify(ctx, { sample: opts.sample });
    } else {
      const files = require('../server/migrate/files');
      result = await files.runFiles(ctx, legacy);
      const retirement = await files.retirementList(ctx);
      extra = writeReport(path.resolve(opts.reportDir), 'kyc-retirement', {
        generatedAt: new Date().toISOString(),
        project,
        notice: 'Legacy public KYC copies. Nothing has been deleted or made private. Securing or deleting an item in "ready" '
          + 'needs separate approval; items in "keep" are not verified and must stay. Property media are not included. '
          + 'Object keys are random names but still grant access to the public copy: keep this file private.',
        ready: retirement.ready,
        keep: retirement.keep,
      });
    }
    const exitCode = exitCodeFor(opts.command, result);
    const file = writeReport(path.resolve(opts.reportDir), `${opts.command}-${mode}`, {
      settings: {
        command: opts.command, mode, project, emulator: true, collections: opts.collections || 'all', batchSize: opts.batchSize,
        maxWrites: opts.maxWrites, resume: opts.resume, updateOlder: opts.updateOlder, startedAt, finishedAt: new Date().toISOString(),
      },
      result,
      usage: { firestoreReads: ctx.meter.reads, firestoreWrites: ctx.meter.writes },
      exitCode,
    });
    for (const line of summary(opts.command, result)) console.log(`[migrate] ${line}`);
    console.log(`[migrate] Firestore reads ${ctx.meter.reads}, writes ${ctx.meter.writes}`);
    console.log(`Report: ${file}`);
    if (extra) console.log(`Retirement report: ${extra}`);
    process.exitCode = exitCode;
  } finally {
    await closeFirebase();
  }
}

main()
  .catch((err) => {
    console.error(err instanceof MigrationRefused ? `Refused: ${err.message}` : err);
    process.exitCode = 1;
  })
  .finally(() => {
    // The PGlite handle stays open; reports and checkpoints are already written synchronously.
    setTimeout(() => process.exit(process.exitCode), 2000).unref();
  });
