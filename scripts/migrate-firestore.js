// Usage: node scripts/migrate-firestore.js <data|files|verify> [options]
// Local: PGLITE_DIR=<isolated copy> FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 GCLOUD_PROJECT=demo-...
// Real systems are refused unless named on the command line: --confirm-project (Firebase), --confirm-source (DATABASE_URL host),
// --confirm-legacy-host (legacy bucket). Environment files are not loaded on purpose.
// Exit codes: 0 done, 1 refused / conflicts / failures (see the report), 2 stopped at the budget (rerun with --resume).
const fs = require('fs');
const path = require('path');
const { MigrationRefused, assertSafeSource, assertTarget, assertLegacyOrigin } = require('../server/migrate/guards');

const USAGE = `Usage: node scripts/migrate-firestore.js <data|files|verify> [options]
  --dry-run (default) | --apply     write nothing unless --apply is given (verify never writes)
  --direction=to-firestore|to-postgres  data and verify: copy direction (to-postgres is the rollback copy)
  --since=<ISO time>                data: only records changed after this time (catch-up and rollback window)
  --resume                          data: continue from the last checkpoint
  --update-older                    data: replace target records only when the source record is newer
  --collections=a,b                 limit to these collections (table names)
  --batch-size=400                  rows per page / documents per batch (1-500)
  --max-writes=18000                to-firestore: stop before this many Firestore writes (free daily quota 20,000)
  --max-reads=45000                 to-postgres: stop before this many Firestore reads (free daily quota 50,000)
  --sample=50                       verify: documents compared per collection
  --compare-ids                     verify: compare every ID (lists records deleted on one side; reads all IDs)
  --uploads-dir=public/uploads      files: folder holding legacy /uploads/... files
  --state-dir=.data/migration/state --report-dir=.data/migration/reports
  --confirm-project=<id>            use the real Firebase project FIREBASE_PROJECT_ID (no emulator variables)
  --confirm-source=<host>           use the real Postgres database in DATABASE_URL (its host name)
  --confirm-legacy-host=<host>      files: read the real legacy bucket at LEGACY_SUPABASE_URL (HTTPS)
Legacy bucket (files only): LEGACY_SUPABASE_URL, LEGACY_SUPABASE_BUCKET (default uploads).`;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!['data', 'files', 'verify'].includes(command)) throw new Error('Unknown or missing command.');
  const o = {
    command, apply: false, dryRun: false, resume: false, updateOlder: false, collections: null, batchSize: 400, maxWrites: 18000, maxReads: 45000, sample: 50,
    uploadsDir: 'public/uploads', stateDir: '.data/migration/state', reportDir: '.data/migration/reports',
    direction: 'to-firestore', since: null, confirmProject: null, confirmSource: null, confirmLegacyHost: null,
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
      case '--compare-ids': o.compareIds = true; break;
      case '--update-older': o.updateOlder = true; break;
      case '--collections': o.collections = need().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--batch-size': o.batchSize = int(need(), 1, 500, key); break;
      case '--max-writes': o.maxWrites = int(need(), 1, 10000000, key); break;
      case '--max-reads': o.maxReads = int(need(), 1, 10000000, key); break;
      case '--sample': o.sample = int(need(), 1, 1000, key); break;
      case '--uploads-dir': o.uploadsDir = need(); break;
      case '--state-dir': o.stateDir = need(); break;
      case '--report-dir': o.reportDir = need(); break;
      case '--direction':
        o.direction = need();
        if (!['to-firestore', 'to-postgres'].includes(o.direction)) throw new Error('--direction must be to-firestore or to-postgres.');
        break;
      case '--since': {
        const d = new Date(need());
        if (Number.isNaN(d.getTime()) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) throw new Error('--since must be an ISO time, e.g. 2026-11-15T10:00:00Z.');
        o.since = d.toISOString();
        break;
      }
      case '--confirm-project': o.confirmProject = need(); break;
      case '--confirm-source': o.confirmSource = need(); break;
      case '--confirm-legacy-host': o.confirmLegacyHost = need(); break;
      default: throw new Error(`Unknown option ${key}.`);
    }
  }
  if (o.apply && o.dryRun) throw new Error('Use either --dry-run or --apply.');
  if (o.command === 'verify' && o.apply) throw new Error('verify never writes; --apply is not accepted.');
  if ((o.resume || o.updateOlder || o.since) && o.command !== 'data') throw new Error('--resume, --update-older and --since apply to the data command only.');
  if (o.compareIds && o.command !== 'verify') throw new Error('--compare-ids applies to the verify command only.');
  if (o.command === 'files' && o.direction !== 'to-firestore') throw new Error('files only runs to-firestore.');
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
    if ((result.refused || []).length || result.totals.invalid || result.totals.sourceNewer || result.totals.targetNewer) return 1;
    return result.stoppedAtBudget ? 2 : 0;
  }
  if (result.refused || result.failed || result.skipped) return 1;
  return result.stoppedAtBudget ? 2 : 0;
}

function summary(command, result) {
  if (result.direction === 'to-postgres') {
    if (command === 'verify') {
      return [`references introduced in Postgres ${result.references.introduced.length}; active admins ${result.activeAdmins}; rows with legacy file URLs ${result.legacyFileRefs}`,
        ...result.review.map((r) => `REVIEW ${r}`),
        result.ok ? 'rollback verification passed' : `rollback verification FAILED: ${result.failures.join('; ')}`];
    }
    const t = result.totals;
    return [
      `firestore docs ${t.sourceDocs}, to create ${t.missing}, created ${t.created}, unchanged ${t.unchanged}, updated ${t.updated}`,
      `file references: to update ${t.fileRefs}, updated ${t.fileRefsUpdated}; conflicts: firestore newer ${t.sourceNewer}, postgres newer ${t.targetNewer}; invalid ${t.invalid}`,
      result.stoppedAtBudget ? `stopped at the read budget in ${result.stoppedAtBudget}; rerun with --resume` : null,
    ].filter(Boolean);
  }
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
      ...result.review.map((r) => `REVIEW ${r}`),
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
  const src = assertSafeSource({ confirmSource: opts.confirmSource });
  const target = assertTarget({ storage: opts.command === 'files', confirmProject: opts.confirmProject });
  const project = target.projectId;
  const legacy = opts.command === 'files'
    ? legacySettings(opts, assertLegacyOrigin(process.env.LEGACY_SUPABASE_URL, opts.confirmLegacyHost))
    : null;
  // The Admin SDK gate (server/firebase/admin.js) opens only for the project confirmed above.
  if (target.mode === 'real') process.env.FIREBASE_CONFIRM_PROJECT = project;

  const { getFirestoreDb, closeFirebase } = require('../server/firebase/admin');
  const { loadModels } = require('../server/migrate/source');
  const { Checkpoint, WriteBudget, writeReport } = require('../server/migrate/run');
  const startedAt = new Date().toISOString();
  const reverse = opts.direction === 'to-postgres';
  const ctx = {
    db: getFirestoreDb(), models: loadModels(), apply: opts.apply, resume: opts.resume, updateOlder: opts.updateOlder,
    collections: opts.collections, batchSize: opts.batchSize, since: opts.since, budget: new WriteBudget(opts.maxWrites),
    readBudget: new WriteBudget(opts.maxReads), meter: { reads: 0, writes: 0 },
    checkpoint: new Checkpoint(path.resolve(opts.stateDir), `${opts.direction}|${opts.since || 'all'}|${src.label}`, project),
    log: (line) => console.log(line),
  };
  const mode = opts.command === 'verify' ? 'read-only' : opts.apply ? 'apply' : 'dry-run';
  console.log(`[migrate] ${opts.command} ${opts.direction} (${mode}) ${src.kind} <-> ${project} (${target.mode})${opts.since ? ` since ${opts.since}` : ''}`);
  try {
    let result;
    let extra = null;
    if (opts.command === 'data' && reverse) {
      result = await require('../server/migrate/reverse').runReverse(ctx);
    } else if (opts.command === 'verify' && reverse) {
      result = await require('../server/migrate/reverse').runReverseVerify(ctx, { sample: opts.sample, compareIds: opts.compareIds });
    } else if (opts.command === 'data') {
      result = await require('../server/migrate/data').runData(ctx);
      if (!opts.apply) {
        const { referenceIssues, sourceReader } = require('../server/migrate/verify');
        const refs = await referenceIssues(sourceReader);
        result.sourceReferences = { issues: refs.issues.slice(0, 50), count: refs.issues.length, applicationsWithoutLead: refs.applicationsWithoutLead };
      }
    } else if (opts.command === 'verify') {
      result = await require('../server/migrate/verify').runVerify(ctx, { sample: opts.sample, compareIds: opts.compareIds });
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
    const file = writeReport(path.resolve(opts.reportDir), `${opts.command}-${opts.direction}-${mode}`, {
      settings: {
        command: opts.command, direction: opts.direction, mode, project, target: target.mode, source: src.kind, since: opts.since,
        collections: opts.collections || 'all', batchSize: opts.batchSize, maxWrites: opts.maxWrites, maxReads: opts.maxReads,
        resume: opts.resume, updateOlder: opts.updateOlder, startedAt, finishedAt: new Date().toISOString(),
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
