# Probiz Finance: Postgres to Firestore Migration Plan

Stage 5 design document. The migration utility was built in Stage 10 and tested only against the Firebase emulators and isolated PGlite copies. Running it against any real Firebase project or legacy bucket needs separate, explicit approval.

## 0. Stage 10 implementation status

| Item | Status |
|---|---|
| Commands | `npm run migrate:firestore` (data), `npm run migrate:files` (KYC files), `npm run migrate:verify`; all run `scripts/migrate-firestore.js <data\|files\|verify>`. Modules in `server/migrate/` (`guards`, `source`, `transform`, `data`, `files`, `verify`, `manifest`, `run`). Tests: `scripts/check-migration.js` |
| Implemented options | `--dry-run` (default), `--apply`, `--resume`, `--update-older`, `--collections`, `--batch-size`, `--max-writes`, `--sample`, `--uploads-dir`, `--state-dir`, `--report-dir` |
| Deferred (approved) | `--direction=to-postgres` (rollback copy), `--since` (catch-up) and `--confirm-project` (real projects). **A tested rollback and cutover procedure is mandatory before any production migration.** |
| Safety checks | Run before anything is opened: only an existing PGlite folder outside the repository (never `.data/pglite`), no `DATABASE_URL`, local emulators only, `demo-` project only, legacy bucket reader limited to a local address. Environment files are not loaded; every source and target is given explicitly |
| Changes from this design | Uniqueness: no `unique_keys` reservations (Stage 8 replaced them); duplicates in the source refuse that collection. Checkpoints are local files (`--state-dir`); the file manifest is the Firestore collection `_migration_files` (approved). Section 8: originals are **never deleted** by the utility; a retirement report lists them for a separately approved step |
| Exit codes | 0 done; 1 refused, conflicts, invalid records or file problems (see the report); 2 stopped at `--max-writes` (rerun with `--resume`) |

## 1. Goals and guarantees

| Guarantee | How |
|---|---|
| Source is never modified | Read-only `SELECT`s; the tool opens Postgres/PGlite without writing. Postgres stays the fallback |
| Same IDs and timestamps | Document ID = Postgres `id`; `createdAt`/`updatedAt` from the `created_at`/`updated_at` columns |
| Safe by default | `--dry-run` is the default; `--apply` must be passed explicitly |
| Correct target | Emulator: the project must start with `demo-`. Any other project: `--confirm-project=<id>` must equal the configured project, or the tool refuses |
| Idempotent and resumable | Existing identical documents are skipped; a checkpoint per collection lets an interrupted run continue |
| No silent overwrite | If the target document exists and differs, the newer `updatedAt` wins only with `--update-older`; otherwise it is reported as a conflict and skipped |
| Free-tier aware | Dry run reports the required reads and writes; `--max-writes` (default 18,000) stops cleanly before the 20,000 daily write quota, and `--resume` continues the next day |
| No personal data in reports | Reports contain counts, IDs and masked values only |

## 2. Command interface (Stage 10)

```
npm run migrate:firestore -- [--dry-run | --apply]
                              [--direction=to-firestore | to-postgres]
                              [--collections=lead,lead_event,...]
                              [--since=<ISO timestamp>]
                              [--batch-size=400] [--max-writes=18000]
                              [--resume] [--update-older]
                              [--confirm-project=<project id>]
                              [--report=.data/migration-reports]
```

- Source and target come from the same environment variables as the app (`DATABASE_URL` or `PGLITE_DIR`; Firebase variables or emulator host). With local PGlite, `next dev` must be stopped first (single-process database, as for the existing `seed:areas` and `backfill:leads` scripts).
- `--since` copies only records whose `updated_at` (or `updatedAt`) is after the timestamp, for the final catch-up and for rollback.
- `--direction=to-postgres` reverses source and target (rollback, section 11).
- Exit code is non-zero on any error, refused precondition or unresolved conflict.

## 3. Discovery and mapping

1. Load every model in `server/models/` and compute its collection name with the existing `tableName()` function (47 models, listed in the data model).
2. List the Postgres tables. Tables without a model are reported and skipped (`rate_limits` is skipped on purpose; its counters are short-lived).
3. Models without a table are reported as empty.

## 4. Per-document transform (to Firestore)

1. Read rows by key order (`WHERE id > $last ORDER BY id LIMIT 500`), so memory stays flat and resuming is exact.
2. Take `data` (JSON) and convert fields declared as `Date` in the schema from ISO strings to Timestamps. Mixed fields are copied as they are (they hold strings today; see the data model, section 10).
3. Do not invent values. Two exceptions keep query results identical (architecture section 7.5): fields declared with `default: null` are written as explicit `null` when missing, and a missing or null `lead.lastActivityAt` becomes the record's `createdAt`. Both are counted in the report. Run the schema validator in report-only mode: violations are listed (ID and field name) but do not block the copy, because the app already accepted these records.
4. Add `createdAt`/`updatedAt` from the columns and the `_lc` map for case-insensitive fields.
5. Remove `undefined` values; reject documents over 1 MiB (reported by ID; `credit_score` raw reports are the only candidates).
6. Unique reservations (`unique_keys`) are written in the same batch as their document.

## 5. Duplicate and conflict handling

| Situation | Dry run | Apply |
|---|---|---|
| Two source records with the same unique value (for example the same email in different letter case) | Listed with IDs and masked value (`r***@g***.com`, `******1234`) | Refuses that collection until resolved by a person; other collections continue |
| Target document missing | Counted as "to create" | Created with `create()` (fails safely if it appeared meanwhile) |
| Target identical | Counted as "unchanged" | Skipped (one read, no write) |
| Target differs, source newer | Counted as "conflict, source newer" | Updated only with `--update-older`; otherwise reported |
| Target differs, target newer | Counted as "conflict, target newer" | Never overwritten; reported |
| Document invalid for Firestore (size, depth) | Reported | Skipped, reported, non-zero exit |

Resolving customer email duplicates (defect 1) is a business decision: the report gives both IDs and their creation dates; nothing is merged automatically.

## 6. Verification after apply

1. Count check per collection (source rows vs target documents, using count aggregations).
2. Content check: for a random sample (default 50 per collection, all if fewer) compare a canonical hash of the transformed source with the target document.
3. Unique-value check (implemented instead of reservations): no duplicate unique values in the target (`admin`, non-deleted `employee`, `user`, `area`), compared the same way as the source check.
4. Lead integrity: every `lead.refId` points to an existing application document; every `lead_event.leadId` points to an existing lead (reported, not fixed).
5. **Admin bootstrap check:** the target must contain at least one active admin. `POST /api/createAdmin` allows creating the first admin without a token while no admin exists (`requireAdminUnlessFirst`), so production must never be switched to an empty or admin-less database.
6. Backfill: `verify` reports application records without a lead (`applicationsWithoutLead`). If any, run `npm run backfill:leads` in Firestore mode (there is no marker document; Stage 8 decision).

## 7. Report

Written to `.data/migration-reports/<timestamp>-<direction>.json` (inside `.data/`, already git-ignored) with a short console summary:

- Run settings (direction, mode, collections, project ID, emulator or not). No credentials.
- Per collection: source count, created, unchanged, updated, conflicts, invalid, duplicates, target count, sample-check result.
- Reads and writes used, and whether `--max-writes` stopped the run.
- Lists contain IDs, field names and masked values only.

## 8. Files

- Existing file URLs in records are copied unchanged by the data step. Files already uploaded stay where they are (Supabase public bucket in production, `public/uploads` locally).
- Separate step `migrate:files` (built in Stage 10; dry run by default):
  1. For each string under `uploadedDocuments` (the 19 private document forms; property media are excluded) that the legacy provider created (`/uploads/<image|video>/<name>` or `<LEGACY_SUPABASE_URL>/storage/v1/object/public/<bucket>/<image|video>/<name>`), read the original. Anything else (other hosts, traversal, unknown formats) is refused and left unchanged. Remote reads are unauthenticated GETs with no redirects, a 10 MB limit and a 30 s timeout; local reads stay inside `--uploads-dir` and refuse links.
  2. Check the content type from the first bytes (PNG, JPEG or PDF), then record a manifest entry in `_migration_files` (collection, record ID, field, legacy object key, SHA-256 of the legacy URL, SHA-256 and size of the file, object path, status).
  3. Upload to `private/documents/YYYY/MM/<uuid>.<ext>` (create-only, `private, no-store`, no download token), read it back and compare SHA-256 and size.
  4. Only then, in one transaction, replace the Firestore field with the `pf:` reference if it still holds the legacy value, and mark the entry `migrated`. `updatedAt` is not changed.
  5. Reruns skip migrated entries and reuse uploaded copies. Later data runs treat a `pf:` value recorded in the manifest as equal to the legacy URL, so they report no false conflicts.
  6. A retirement report (`*-kyc-retirement.json`) lists verified originals (`ready`) and unverified ones (`keep`). **Nothing is deleted or made private by the utility.** Securing or deleting individual legacy KYC copies needs separate approval after verification; the whole legacy bucket must not be made private because it also holds public property images.
- Supabase is not a permanent dependency: the only Supabase-related code is this read-only legacy reader (`server/migrate/files.js`).
- The storage backend switch (`FILE_STORAGE_BACKEND`) is independent of the database switch. Cloud Storage for Firebase requires Blaze, so under the free-first constraint production keeps a free private-bucket provider (Supabase by default, decision F2) with the new private design.

## 9. Local test plan (Stages 10 and 11)

Never use the original `C:\Users\skhare\Probiz-Finance\.data\pglite`. Its file manifest is checked before and after every test session.

1. Copy the isolated Stage 4B database (`%USERPROFILE%\probiz-baseline\.data\pglite`) to a new test folder; point `PGLITE_DIR` to the copy.
2. Start the emulators (`demo-probiz-finance`, data under `.data/firebase-emulator/`).
3. Dry run: check counts, duplicate and validation reports.
4. Apply: check counts, samples, reservations, admin check, backfill marker.
5. Apply again: zero writes (idempotency).
6. Change one target document, apply again: conflict reported, document not overwritten.
7. Interrupt a run (small `--max-writes`), then `--resume`: completes without duplicates.
8. Reverse direction into a second fresh PGlite copy: counts and samples match.
9. Run the smoke and intake suites in Firestore mode against the migrated data.
10. Seed a test duplicate (two users with emails differing only in case) in a separate copy: apply refuses `user` and reports masked values.

Test and demo accounts exist only in these local copies and the emulator, never in any real project.

Stage 10 results (`scripts/check-migration.js`, 26 checks plus 4 through the app): steps 1 to 7, 9 (sign-in, lead detail and signed links on the migrated data) and 10 passed; step 8 (reverse direction) is deferred. Details in the implementation log.

## 10. Production cutover runbook (later prompt, needs approval)

Prerequisites:

- Firebase project on the no-cost Spark plan (no billing account, unless a paid option is explicitly approved), in the approved region (D3), default Firestore database, Standard edition.
- Production host decided and approved (F5 in [FIREBASE_FREE_TIER_STRATEGY.md](FIREBASE_FREE_TIER_STRATEGY.md)); the migration's write budget fits the free daily quota (`--max-writes`).
- Rules (deny all) and composite indexes deployed; all indexes finished building.
- Dedicated service account with least privilege (security plan, section 8.4); variables set first in a Vercel Preview environment.
- A Vercel Preview deployment with `DATA_BACKEND=firestore` passes the smoke tests against a staging project or the emulator.

Steps:

1. Note the start time `T0`. Run a dry run against production Postgres and review the report (duplicates, size, write budget).
2. Run `--apply --confirm-project=<id>` (repeat with `--resume` on following days if the free write quota is reached).
3. Verify (section 6), including the admin bootstrap check.
4. Switch the production `DATA_BACKEND` to `firestore` and redeploy. Note the switch time `T1`.
5. Run `--apply --since=T0` to copy records written to Postgres between `T0` and `T1`.
6. Post-checks: health endpoint, one staff sign-in, the admin lead list, one public property page. Do not create test data in production.
7. Watch Firestore usage and server errors closely for the first day.

Postgres stays untouched and running for at least 30 days after cutover.

## 11. Rollback runbook

Not implemented yet (deferred in Stage 10): the reverse copy below must be built and tested before any production migration.

Triggers: data errors, repeated quota exhaustion, missing indexes that cannot be fixed quickly, or any security concern.

1. Set `DATA_BACKEND=postgres` (and `FILE_STORAGE_BACKEND` to its previous value if it was changed), then redeploy, or promote the previous Vercel deployment.
2. Note the rollback time `T2`. Run `npm run migrate:firestore -- --direction=to-postgres --since=T1 --apply` to copy records created or changed in Firestore after cutover back to Postgres (conflicts reported, not overwritten).
3. If private files were uploaded to a different storage backend after cutover, copy them back with the file step before switching storage.
4. Verify counts for the `T1` to `T2` window, sign in as staff and open a recent lead.
5. Keep the Firestore data unchanged until the cause is understood.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Free write quota too small for the data set | Dry-run estimate, `--max-writes`, resume across days, or temporary billing with approval |
| Mixed-case duplicate customer emails | Refuse and report; business resolves |
| Large `credit_score` raw payloads over 1 MiB | Reported and skipped; decide per record |
| Index not built at cutover | Deploy indexes first and wait; the app returns the Firestore error with the index link in server logs only |
| Writes during the copy window | `--since=T0` catch-up after switching |
| Rollback loses Firestore-only writes | Reverse copy with `--since=T1` |
| Empty admin collection after a mistake | Admin bootstrap check blocks cutover |
| Original local database touched | Never opened; manifest check before and after each session |
