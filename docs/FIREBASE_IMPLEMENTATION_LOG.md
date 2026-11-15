# Probiz Finance Firebase Implementation Log

Running record of the Firebase backend work on `shivansh_dev`. Updated before and after every stage. No secret values (passwords, tokens, credential values, private keys, connection strings, customer or KYC data) are recorded here.

## Session Information

| Item | Value |
|---|---|
| Repository name | jayeshrajani/Probiz-Finance |
| Repository URL | https://github.com/jayeshrajani/Probiz-Finance |
| Session date | 2026-11-14 (started 14:25 +05:30) |
| Machine/environment | Windows, PowerShell 5.1, VS Code agent terminal |
| Initial branch | `shivansh_dev` (old local branch, since removed) |
| Initial commit | `9f2bb9390a77e8432c14d45958576f08f2dc3c95` |
| Latest origin/main commit | `9f2bb9390a77e8432c14d45958576f08f2dc3c95` |
| Fresh development branch | `shivansh_dev`, created 2026-11-14 14:48 from `9f2bb93` |
| GitHub username used | `shiv1214` |
| Collaborator permission status | Push permitted (dry-run push succeeded) |
| Node version | v23.6.0 |
| npm version | 10.9.2 |
| Firebase CLI version | Not installed |
| Firebase emulator project ID | Not yet configured (planned: `demo-probiz-finance`) |
| Cloud Firebase project ID | None (requires approval) |
| Firestore region | None (requires approval) |

## GitHub Configuration Preserved

| Item | Value |
|---|---|
| Origin fetch URL | https://github.com/jayeshrajani/Probiz-Finance.git |
| Origin push URL | https://github.com/jayeshrajani/Probiz-Finance.git |
| Protocol | HTTPS |
| Repository-level SSL backend | `http.sslBackend=schannel` in `.git/config` (system default is `openssl`) |
| TLS verification | Enabled. No `http.sslVerify` at any level; `GIT_SSL_NO_VERIFY` not set |
| Credential helper | `manager` (Git Credential Manager, from system gitconfig) |
| GitHub username used by Git | `shiv1214` (Windows Credential Manager entry `git:https://github.com`) |
| Read access | Verified (`git ls-remote` succeeds) |
| Previous push result | 403: "Permission to jayeshrajani/Probiz-Finance.git denied to shiv1214" |
| Collaborator invitation | Sent by Jayesh, accepted by the user (user-reported) |
| New dry-run result | Success: `* [new branch] shivansh_dev -> shivansh_dev`, exit 0; no remote branch created |
| Credential values recorded | None |

## Stage Status

| Stage | Description | Status | Started | Completed | Approval |
|---|---|---|---|---|---|
| 0 | Audit Git, verify access, plan cleanup | Completed | 2026-11-14 14:25 | 2026-11-14 14:32 | Approved ("yes") |
| 1 | Remove previous local development branch | Completed | 2026-11-14 | 2026-11-14 | Approved |
| 2 | Fetch and pull latest main | Completed | 2026-11-14 | 2026-11-14 | Approved |
| 3 | Create fresh `shivansh_dev` and this log | Completed | 2026-11-14 14:48 | 2026-11-14 14:50 | Approved |
| 4A | Analyse the latest codebase | Completed | 2026-11-14 15:00 | 2026-11-14 15:40 | Approved ("Proceed with Stage 4 Part A only") |
| 4B | Baseline-test the codebase (local PGlite) | Completed with Warnings | 2026-11-14 15:10 | 2026-11-14 15:40 | Approved: Option A certificates + Option 1 isolated working directory |
| 5 | Firebase architecture and data-model design | Completed | 2026-11-14 | 2026-11-14 | Approved ("Proceed with Stage 5 only"; continued "Stage 5 only") |
| 6 | Local Firebase and Emulator foundation | Completed | 2026-11-14 | 2026-11-14 | Approved (D8, D9, Temurin 21 with checksum, Admin SDK foundation, Firestore and Storage emulators, demo project; free-first constraint added) |
| 7 | Firestore persistence provider | Completed | 2026-11-14 | 2026-11-15 | Approved ("Proceed with Stage 7 only"; Postgres stays default; emulator only; Firestore not enabled as the app backend until Stage 8). Paused by the user after the recovery; remaining tasks approved 2026-11-15 |
| 8 | Direct SQL refactoring and transactional logic | Completed | 2026-11-15 | 2026-11-15 | Approved ("Proceed with Stage 8 only"; native Firestore and PostgreSQL transactions, not application-level locks alone; ₹0/month; no commit, push, deploy or billing) |
| 8.5 | Dynamic site settings, contact information and social media integration | Completed | 2026-11-15 | 2026-11-15 | Approved ("Proceed with the implementation of Stage 8.5 only"; decisions D1 to D8 below; phone-rule fix approved after the stall diagnosis) |
| 9 | Secure file-storage abstraction | Completed | 2026-11-15 | 2026-11-15 | Approved: Firebase Cloud Storage as the provider, Storage emulator only (no billing, no cloud resources); originals preserved |
| 10 | Migration utility | Completed | 2026-11-15 | 2026-11-15 | Approved: emulators and isolated PGlite only; `_migration_files` manifest; originals never deleted (retirement report); reverse migration deferred; no real Firebase or Supabase access |
| 11 | Complete local testing and security verification | Completed | 2026-11-15 | 2026-11-15 | Approved ("Proceed with Stage 11"; emulators and isolated data only; minimal fixes for confirmed defects) |
| 12 | Final local review and handover | Completed | 2026-11-15 | 2026-11-15 | Approved ("Proceed with Stage 12"); no commit, push, cloud operation or billing change |
| 13 | Firebase cloud setup | Not Started | | | Requires separate approval (and the Blaze billing decision) |

## Decision Log

| Date | Decision | Options considered | Selected | Reason | User approval |
|---|---|---|---|---|---|
| 2026-11-14 | Restore accidental `package-lock.json` change | Keep / restore | Restore to HEAD | npm 10.9.2 rewrite removed 28 Linux `libc` blocks; unrelated to the task | Approved |
| 2026-11-14 | Fix Git TLS failure ("unable to get local issuer certificate") | Disable verification / per-command `-c` / repo-level schannel / global schannel | Repo-level `http.sslBackend=schannel` | Uses the Windows certificate store; keeps verification; limited to this repository | Approved |
| 2026-11-14 | GitHub CLI | Install via winget / per-user / skip | Skip (not required) | Machine-wide MSI needed elevation (exit 1602); access verified via dry-run push instead | User-directed |
| 2026-11-14 | Verify write access | Real test push / dry-run push | Dry-run push | Proves permission without creating a remote branch | Approved |
| 2026-11-14 | Reset development branch | Keep old branch / delete with `-d` and recreate | Delete with `-d`, recreate from latest main | Old branch had no unique commits; guarantees a clean start | Approved |
| 2026-11-14 | Split Stage 4 | One stage / 4A analysis + 4B baseline tests | 4A then 4B, separately approved | Keeps read-only analysis apart from running the app and writing local data | Approved |
| 2026-11-14 | Node TLS trust for build and tests | Disable verification / export Windows roots to PEM + session `NODE_EXTRA_CA_CERTS` / skip build | Export public Windows root certificates to `%USERPROFILE%\.certs\windows-root-cas.pem`, session-only `NODE_EXTRA_CA_CERTS` | Keeps verification on; no global changes; bundle outside the repo | Approved (Option A) |
| 2026-11-14 | Isolate baseline database | Run from a separate working directory / rename swap / add `PGLITE_DIR` | Separate working directory `%USERPROFILE%\probiz-baseline` (Option 1) with SHA-256 manifest checks | Original `.data/pglite` never opened, renamed or modified; no code change | Approved (Option 1) |
| 2026-11-14 | D1 Overview and employee statistics | A counters / B `count()` + 30 s cache / C full read + cache | B (proposed) | Fixed cost (about 140 reads) independent of lead volume; no write-path change | Pending |
| 2026-11-14 | D2 Customer email uniqueness | Keep case-sensitive / case-insensitive | Case-insensitive (proposed) | Login already lower-cases; prevents unusable duplicate accounts | Pending |
| 2026-11-14 | D3 Firestore region | `asia-south1` / other | `asia-south1` (proposed) | Customers in India; permanent choice, needed only at cloud setup | Pending |
| 2026-11-14 | D4 Private file links | Signed links in lead detail / separate endpoint | Signed links in lead detail (proposed) | No API shape change; one-line `isFile` change for local links | Applied in Stage 9 as recommended (Stage 9 implementation approved) |
| 2026-11-14 | D5 Health response | Unchanged / add backend name | Unchanged (proposed) | Keeps the public contract; backend logged server-side | Pending |
| 2026-11-14 | D6 Postgres transactions | Firestore only / both backends | Both backends (implemented in Stage 8) | Same race fixes on the fallback path | Approved (Stage 8: "Use native Firestore transactions and PostgreSQL transactions") |
| 2026-11-14 | D7 Public property cache | None / 60 s per instance | 60 s (proposed) | Every page view otherwise reads every matching listing | Pending |
| 2026-11-14 | D8 Test database location | Isolated working directory / `PGLITE_DIR` | Add optional `PGLITE_DIR` | Explicit isolation without changing the working directory | Approved (Stage 6) |
| 2026-11-14 | D9 Tooling | Global installs / `npx firebase-tools@<pinned>` + portable JDK | `npx firebase-tools@15.36.0` + portable Eclipse Temurin 21 with checksum verification | No admin rights, no global change, no large dev dependency | Approved (Stage 6) |
| 2026-11-14 | D10 Public property media URLs | Download-token URLs / public bucket / server proxy | Download-token URLs (proposed) | Verified mechanism; behaviour with deny-all rules checked in Stage 9 | Applied in Stage 9 as recommended (Stage 9 implementation approved) |
| 2026-11-14 | D11 Legacy per-form endpoints | Sign links / return `pf:` references | Return `pf:` references (proposed) | Admin-only and unused by the frontend | Applied in Stage 9 as recommended (Stage 9 implementation approved) |
| 2026-11-14 | D12 Public `addProperty` uploads | Unchanged / rate limit | Existing IP rate limiter (proposed) | Protects the storage quota | Applied in Stage 9 as recommended (Stage 9 implementation approved) |
| 2026-11-14 | D13 Storage bucket region | US free-tier region / Mumbai | Decide at cloud setup | Free tier only in US regions | Pending |
| 2026-11-14 | Free-first constraint (mandatory for all later stages) | Free-first / cost-optimised paid | Operate at ₹0/month wherever technically feasible: Spark (no billing), Firestore within free quotas, emulators for development, no billing, no payment-method services without approval, sensitive documents never public, paid options documented separately and approved first | User business requirement | Required by user (Stage 6 approval) |
| 2026-11-14 | `firebase-admin` major version | 14.5.1 (needs Node >=22) / 13.x (Node >=18) | `^13.10.0` (installed 13.10.0) | Keeps the declared `engines.node >=20.9`; upgrading to 14 means raising `engines` (deployment change, needs approval) | Within approved Stage 6 scope |
| 2026-11-14 | Lockfile-safe install | npm 10.9.2 / npm 11.16.0 via `npx` | `npx --yes npm@11.16.0 install` | Tested on temporary copies: npm 10.9.2 removed all 28 `libc` entries; npm 11.16.0 kept them (160 added, 0 removed, 0 version changes) | Within approved Stage 6 scope |
| 2026-11-14 | Java package | Temurin 21 JDK / Temurin 21 JRE | Temurin 21.0.13+9 JRE (zip) | The emulators only need a runtime; 49 MB instead of a full JDK; SHA-256 matched the Adoptium API and the release `.sha256.txt` | Within approved D9 |
| 2026-11-14 | Firestore index exemptions | None / exempt large never-queried fields | 5 `fieldOverrides` | Saves free-tier storage; avoids 1,500-byte truncation; Google guidance for large fields | Within approved Stage 6 scope (documented in the data model) |
| 2026-11-14 | F1 to F6 free-first decisions | See [FIREBASE_FREE_TIER_STRATEGY.md](FIREBASE_FREE_TIER_STRATEGY.md) | Proposed | Keep reads within quota; secure free document storage; host choice; retention; backups | Pending |
| 2026-11-14 | Persistence module layout | Stage 5 proposal (`plan.js`, `unique.js`) / four modules | `server/data/values.js`, `postgres.js`, `firestore.js`, `index.js` | Only Firestore needs the planner and matcher; unique reservations belong with transactions (Stage 8) | Within approved Stage 7 scope |
| 2026-11-14 | Firestore backend gate | Allow `DATA_BACKEND=firestore` / require emulator + test flag | Refuse unless `FIRESTORE_EMULATOR_HOST` is set and `FIRESTORE_PROVIDER_PREVIEW=1` | Rate limiting, backfill and health still use SQL, and transactions do not exist yet; the app must not run half on Firestore | Within approved Stage 7 scope |
| 2026-11-14 | `Date` values inside Mixed fields | Firestore Timestamps / ISO strings | ISO strings (JSON round trip, as Postgres stores them) | Identical results on both backends; schema-typed `Date` fields are still Timestamps | Within approved Stage 7 scope |
| 2026-11-14 | Fields declared `default: null` | Store only when set / always store | Always stored, `null` when unset | Lets `{ field: null }` run natively (for example the unassigned-lead scope) | Within approved Stage 7 scope |
| 2026-11-14 | Case-insensitive lookups | Keep regex only / add `$ci` to both adapters | `ci(value)` (`$ci`) in both adapters; `_lc` copies for `area.name`, `admin.admin_Email`, `employee.email`, `user.user_Email` | 1 read instead of a scan; callers switch in Stage 8 | Within approved Stage 7 scope |
| 2026-11-14 | Queries Firestore cannot answer natively | Return what Firestore returns / bounded in-memory evaluation | Bounded in-memory evaluation with SQL semantics; `FirestoreScanLimitError` above `FIRESTORE_SCAN_LIMIT` (default 2000) | Never silently incomplete or incorrect results | Within approved Stage 7 scope |
| 2026-11-14 | Sort and paging pushdown | Always push `orderBy` / push only when safe | Push only for windowed queries without in-memory parts; `count()` check when a sort field might be missing | Firestore omits documents lacking an `orderBy` field; Postgres sorts them as NULLs | Within approved Stage 7 scope |
| 2026-11-14 | Full update on Firestore | `set()` / `update()` with field deletes | `update()`, deleting schema fields no longer set | Keeps `createdAt`; a missing document returns no row, like Postgres | Within approved Stage 7 scope |
| 2026-11-15 | Continuation after the network interruption | Stop after the audit / continue | Implementation continued after the audit without a separate approval; the user paused it, reviewed a status report and approved the remaining tasks | Recorded for transparency | Approved (2026-11-15, remaining tasks only) |
| 2026-11-15 | Transaction API | Explicit `tx.get`/`tx.save` methods (Stage 5 design) / ambient transaction | Ambient: ODM calls inside `transaction()` join it (`AsyncLocalStorage`); `tx.lock`, `tx.afterCommit`, `tx.onRetry` | Existing controller code keeps its ODM calls; no second query API | Within approved Stage 8 scope |
| 2026-11-15 | Postgres isolation | `SERIALIZABLE` with retries / `READ COMMITTED` with row and advisory locks | `READ COMMITTED` + `SELECT ... FOR UPDATE` inside transactions + `pg_advisory_xact_lock`; retry on `40001`/`40P01` | Each statement sees committed data after a lock wait, so waiting transactions re-check instead of aborting; deterministic on the Supabase pooler | Within approved Stage 8 scope |
| 2026-11-15 | Uniqueness on Firestore | `unique_keys` reservation documents (Stage 5) / lock document + in-transaction duplicate query | Lock document + query, on both backends | No reservations to migrate, move or release; scope of each rule is its existing query | Within approved Stage 8 scope |
| 2026-11-15 | Uniqueness rules | Normalise all as in the Stage 5 table / keep today's checks | Keep today's checks; two exceptions: `createAdmin` ignores case (stored lower-case), staff-panel employee check compares trimmed values | D2 (customer email case) still pending, so signup keeps the exact match | Within approved Stage 8 scope |
| 2026-11-15 | Backfill on Firestore | Marker document + automatic / no automatic scan | Automatic only with `LEAD_BACKFILL_AUTO=1`; otherwise `npm run backfill:leads`; no marker | The scan reads every lead and application on each cold start; Postgres keeps today's automatic run | Within approved Stage 8 scope (design 8.10) |
| 2026-11-15 | Firestore backend gate | Keep the test-only flag / emulator only | Emulator only (`FIRESTORE_EMULATOR_HOST`); test-only flag removed | No SQL dependencies remain; a real project still needs a separate approval | Within approved Stage 8 scope |
| 2026-11-15 | Regex built from request text (public area and property filters) | Leave / escape | Escape (literal match) | Injected patterns returned 500 on Postgres and could block the Node.js process on Firestore (in-memory regex, ReDoS); normal searches unchanged | Security fix within the approved "switch regex lookups" item |
| 2026-11-15 | 8.5-D1 LinkedIn URL | ID-based `/company/13755959/` / public `/company/probizfinance/` | `https://www.linkedin.com/company/probizfinance/` | The old link redirects to this public "Probiz Finance" page; the ID page needs sign-in | Approved |
| 2026-11-15 | 8.5-D2 Facebook URL | Keep `probizmanagement` / user-supplied `srloans` | `https://www.facebook.com/srloans` | Supplied by the user; not verifiable anonymously (sign-in wall) | Approved |
| 2026-11-15 | 8.5-D3 WhatsApp button | Bottom-left / above the assistant | Bottom-left | The assistant launcher is bottom-right | Approved |
| 2026-11-15 | 8.5-D4 Public response | `{ data }` / flat | `{ data: { ... } }` | Same as the admin-panel APIs | Approved |
| 2026-11-15 | 8.5-D5 Seeding | Seed script + code fallback / create on first admin visit | Idempotent seed script; fallback values only for loading and API failures; database values take precedence | No writes on startup or on public reads | Approved |
| 2026-11-15 | 8.5-D6 Secondary number | Footer and contact page / everywhere | Both numbers (primary first) in the footer contact block and the contact page; primary elsewhere | Single-slot places stay uncluttered | Approved |
| 2026-11-15 | 8.5-D7 Privacy-policy email | Leave / change | Leave `content/legal.json` unchanged; public contact sections use `info@probizfinance.com` | Legal text needs separate approval | Approved |
| 2026-11-15 | 8.5-D8 Phone rules | | Primary and secondary: Indian mobile or landline; WhatsApp: Indian mobile; formatting normalised | | Approved |
| 2026-11-15 | 8.5 phone-rule fix | Keep `^[2-9]` / `^[1-9]` for primary and secondary | `^[1-9]\d{9}` (area codes starting with 1, such as Delhi 11 and Noida 120, were rejected); WhatsApp stays `^[6-9]\d{9}` | A landline from an area code starting with 7 or 8 is indistinguishable from a mobile by digits, and no rule can confirm WhatsApp registration | Approved (after the stall diagnosis) |
| 2026-11-15 | 8.5 cache lifetimes | Server 3 min + in-tab refresh 5 min / server 2 min + in-tab refresh 1 min | Server 2 min, HTTP `max-age=60, s-maxage=60`, in-tab refresh at most once a minute | The first values stacked to about 9 minutes for an open tab; the target is about 5 minutes | Within the approved caching item |
| 2026-11-15 | 10 Rollback | Build reverse migration now / defer | Defer; a tested rollback and cutover plan is mandatory before production migration | Keeps Stage 10 focused | Approved |
| 2026-11-15 | 10 Legacy KYC originals | Delete after copy / make bucket private / keep and report | Keep every original; retirement report; individual copies secured or deleted only after verification and separate approval; never make the whole bucket private (property images) | No destructive step in Stage 10 | Approved |
| 2026-11-15 | 10 Migration manifest | Local file / Firestore | Firestore `_migration_files` | Durable across machines and resumable | Approved |
| 2026-11-15 | 10 Final architecture | | Firestore + Firebase Storage; Supabase only as a read-only legacy source during an approved production migration | | Required by user |
| 2026-11-15 | 10 Source and target gates | Plan's `--confirm-project` / emulator only in Stage 10 | Refuse `DATABASE_URL`, the original or any in-repository PGlite folder, non-local emulators, non-`demo-` projects and a non-local legacy bucket URL; no environment files loaded | No production access in this stage; real sources are enabled at the approved cutover | Within approved Stage 10 scope |
| 2026-11-15 | 10 Timestamps | JavaScript `Date` (ms) / microsecond epoch from SQL | Microseconds (`extract(epoch ...)`) into Firestore Timestamps | Postgres keeps microseconds; nothing is truncated | Within approved Stage 10 scope |
| 2026-11-15 | 10 File reference rewrite | Change `updatedAt` / keep it | Keep `updatedAt`; later data runs map the manifest `pf:` value back to the legacy URL | The record content is unchanged apart from where the file lives; no false conflicts | Within approved Stage 10 scope |
| 2026-11-15 | 11 Logged error values | Change ODM error messages / redact only when logged | `util.inspect.custom` on `ValidationError` and `CastError`: logs show paths and kinds, messages unchanged | Some legacy endpoints return `error.message` to the caller; changing it would alter API responses | Within approved Stage 11 scope (confirmed defect) |
| 2026-11-15 | 11 Password-attempt limit | None / per IP / per account | Per IP on the four sign-in routes and both password-change routes: 20 per 10 min, 200 per day; existing `allow()` limiter | Unlimited guessing was possible; per-account limits need a lockout policy decision | Within approved Stage 11 scope (confirmed defect) |
| 2026-11-15 | Commit and push of Stages 0–12 | Keep local / commit and push to `shivansh_dev` | One commit on `shivansh_dev`, pushed as a new remote branch; no merge to `main`, no deployment | Handover review passed (secret, personal-data and credential scans clean) | Approved ("yes go ahead") |

## Stage Entries

### History before this plan (non-secret)

- Repository cloned at `edb136f`; old `shivansh_dev` created from main and fast-forwarded to `9f2bb93`.
- Accidental npm 10.9.2 rewrite of `package-lock.json` restored to HEAD.
- Repo-level `http.sslBackend=schannel` configured.
- GitHub CLI install attempt failed (MSI exit 1602); not installed.
- Push dry-run returned 403 before collaborator access was granted.
- A cancelled `npm install firebase-admin --package-lock=false` left no files behind.

### Stage 0: Audit Git, verify access, plan cleanup

- Objective: verify collaborator write access; audit repository and branch state; look for previous Firebase work; confirm the old branch can be safely removed.
- Pre-stage plan: read-only audit commands, one dry-run push, worklog in `.git/`.
- User approval: "yes".
- Commands executed: `pwd`; `git rev-parse --show-toplevel`; `git status` (short and long); `git branch --show-current / -vv / -a`; `git rev-parse HEAD`; `git log -1`; `git log --graph --all -20`; `git reflog -20`; `git remote -v / get-url / get-url --push`; `git config --get` for `http.sslBackend`, `http.sslVerify`, `credential.helper`; `git diff --name-status`; `git diff --cached --name-status`; `git ls-files --others --exclude-standard`; `git show-ref` for local and tracking `shivansh_dev`; `git ls-remote` (HEAD, symref, heads main, heads shivansh_dev); `git log main..shivansh_dev` and reverse; `git diff --stat/--name-status main...shivansh_dev`; `git push --dry-run origin shivansh_dev:shivansh_dev`; existence checks for Firebase files; `node --version`; `npm --version`.
- Files inspected (existence only): `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `apphosting.yaml`, `server/firebase`, `server/providers`, `docs/*`, `scripts/migrate*`, `package.json` (search for "firebase"), `node_modules/firebase-admin`.
- Files created: `.git/PROBIZ_FIREBASE_WORKLOG.md` (untracked).
- Files modified / restored / deleted: none.
- Verification: working tree clean; nothing staged or untracked; `main` and `shivansh_dev` both at `9f2bb93` with no unique commits; GitHub main unchanged; remote `shivansh_dev` absent before and after the dry-run; schannel configured; TLS verification enabled; origin URLs unchanged; no previous Firebase files (`docs/` held only `docs/frontend-screenshot.png`).
- Test results: dry-run push exit 0.
- Errors / warnings: none.
- Git status: `## shivansh_dev` (clean).

### Stage 1: Remove previous local development branch

- Objective: delete the old local `shivansh_dev` so it can be recreated from the latest main.
- User approval: "Approved. Proceed with Stage 1 only."
- Commands executed: `git switch main`; `git status --short --branch`; `git branch -d shivansh_dev`; verification with `git branch --show-current / -vv / -a`, `git show-ref`, `git ls-remote --heads origin shivansh_dev`, `git config --local --get http.sslBackend`, `git remote -v`, `git ls-remote origin HEAD`, `git status --short --branch`, `git rev-parse HEAD`.
- Result: `Deleted branch shivansh_dev (was 9f2bb93).`
- Branch before/after: `shivansh_dev` -> `main`. Commit before/after: `9f2bb93` -> `9f2bb93`.
- Files created / modified / restored / deleted in the working tree: none. Commits lost: none.
- Verification: local ref absent; remote branch absent; schannel preserved; origin URLs unchanged; GitHub reachable; working tree clean.
- Errors / warnings: none.

### Stage 2: Fetch and pull latest main

- Objective: bring local `main` to GitHub's current `main` before development.
- User approval: "Approved. Proceed with Stage 2 only."
- Commands executed: `git fetch origin --prune`; `git switch main`; `git status --short --branch`; `git pull --ff-only origin main` ("Already up to date."); verification with `git branch --show-current`, `git rev-parse HEAD`, `git rev-parse origin/main`, `git log -1`, `git status`, `git diff --exit-code origin/main` (0), `git diff --cached --exit-code` (0), `git config --local --get http.sslBackend`, `git remote -v`, `git ls-remote --heads origin main`, `git branch -a`.
- Result: local main = origin/main = GitHub main = `9f2bb93`. No new upstream commits.
- Files created / modified / restored / deleted in the working tree: none.
- Errors / warnings: none.

### Stage 3: Create fresh shivansh_dev and this log

- Objective: create a clean development branch from the latest main and start the tracked implementation log.
- User approval: "Approved. Proceed with Stage 3 only."
- Commands executed: pre-check `git branch --show-current`, `git status --short --branch`, `git rev-parse HEAD`, `git rev-parse origin/main` (equal); `git switch -c shivansh_dev`; verification with `git branch --show-current`, `git status --short --branch`, `git rev-parse HEAD`, `git merge-base --is-ancestor origin/main HEAD` (exit 0), `git log -1 --oneline --decorate`, `git config --local --get http.sslBackend`, `git remote -v`, `git ls-remote --heads origin shivansh_dev`, `git branch -vv`.
- Result: `Switched to a new branch 'shivansh_dev'` at `9f2bb93`; no upstream configured.
- Files created: `docs/FIREBASE_IMPLEMENTATION_LOG.md` (this file, untracked, not committed).
- Files modified / restored / deleted: none (worklog in `.git/` updated).
- Confirmations:
  - Collaborator access verified through a dry-run push.
  - The old local branch was removed with `git branch -d`.
  - Latest main was fetched and pulled (already up to date).
  - Fresh `shivansh_dev` created from `origin/main` (`9f2bb93`).
  - `http.sslBackend=schannel` preserved; origin URLs preserved; authentication remains through `shiv1214`.
  - No previous Firebase implementation was carried forward.
  - No commit was created. No real push was performed.
- Errors / warnings: none.
- Git status: `## shivansh_dev` plus untracked `docs/FIREBASE_IMPLEMENTATION_LOG.md`.
- Next proposed stage: Stage 4, analysis and baseline testing.

### Stage 4A: Analyse the latest codebase

- Objective: document how the current code actually works, which ODM methods and operators it really uses, and the risks for a Firestore backend. No implementation changes.
- Pre-stage plan: read code and the Next.js 16 docs, run repository-wide searches, presence-only environment checks; write findings here.
- User approval: "Approved. Proceed with Stage 4 Part A only."
- Commands executed (all read-only):
  - `git ls-files` inventory (342 tracked files: 114 under `pages/`, 59 under `components/`, 52 under `public/`)
  - Route inventory with `Select-String` over `server/routes/*.js`, plus a multi-line route check
  - ODM method usage count with `Select-String` over `server/` and `scripts/` (excluding `server/odm.js`)
  - `git grep -c -E` for every requested search pattern
  - `node -e` that only `require`s each model definition to list model name, table name, field counts and special fields (no database connection is opened by requiring models)
  - `node --input-type=module` that imports `lib/forms.js` to count forms and file slots, and cross-checks them against `server/routes/user.routes.js`
  - `npm ls --depth=0` (does not modify files), `node --version`, `npm --version`
  - Presence-only checks: `Test-Path .env.local .env .data/pglite public/uploads .next`; `git check-ignore -v`; Git Bash and curl location; port 3000 listener; Java on PATH
  - Reads of `node_modules/next/dist/docs/` (API routes, serverExternalPackages, bundlePagesRouterDependencies, environment variables, version-16 upgrade guide)
- Files inspected: listed in "Codebase Analysis" below.
- Files created: none.
- Files modified: `docs/FIREBASE_IMPLEMENTATION_LOG.md` (this file) only.
- Files restored / deleted: none.
- Errors: two PowerShell one-liners failed to parse because of quoting (`$fields` expansion and `||` rewriting); re-run with equivalent syntax. No repository impact.
- Warnings: Node prints `MODULE_TYPELESS_PACKAGE_JSON` when `lib/forms.js` (ES module syntax) is imported from plain Node; Next.js handles it, so it is informational only.
- Git status after the stage: `## shivansh_dev` plus untracked `docs/FIREBASE_IMPLEMENTATION_LOG.md`.
- Next proposed stage: Stage 4B, baseline testing on local PGlite (separate approval).

### Stage 4B: Baseline testing (paused)

- User approval: Part 4B with Option A, on condition that the existing PGlite database is preserved and testing uses an isolated database.
- Commands executed so far (read-only): search of `server/` for the PGlite path; search of `node_modules/next/dist/cli` and `node_modules/next/dist/server/lib` for `process.chdir`; metadata-only listing of `.data/pglite` (file count, total size, latest write time; no contents read).
- Finding: `server/db.js` line 17 hard-codes `path.join(process.cwd(), '.data', 'pglite')`; there is no setting for a separate directory. `server/storage.js` also writes dev uploads under `process.cwd()/public/uploads`. Next's CLI does not call `process.chdir`.
- Existing database: `C:\Users\skhare\Probiz-Finance\.data\pglite`, 972 files, 39,854,259 bytes, last written 2026-11-14 11:35:22. Not opened, read, renamed or modified.
- Per the approval condition, stopped before the certificate export, `.env.local`, build, server start and tests, to propose an isolation method.
- Files created / deleted: none. Files modified: this log only.
- User approval to continue: "Approved. Continue Stage 4 Part B using Option 1 only", with safeguards (no use of the original database; verify the isolated database before writing data; manifest comparison after build, startup, health, smoke and intake; stop on any change; no fallback to Option 2; keep the isolated folder for review).

#### Stage 4B execution

- Isolated working directory: `C:\Users\skhare\probiz-baseline` (outside the repository).
- Original database manifest: SHA-256 of all 972 files in `C:\Users\skhare\Probiz-Finance\.data\pglite` written to `probiz-baseline\pglite-manifest-before.txt` (hashes and relative file names only).
- Certificates (Option A): 128 public root certificates from `Cert:\LocalMachine\Root` and `Cert:\CurrentUser\Root` (raw certificate data only; no private keys) written to `C:\Users\skhare\.certs\windows-root-cas.pem` (207,536 bytes). `NODE_EXTRA_CA_CERTS` set only in the terminal sessions used; not set in the user or machine environment.
- Node HTTPS with verification on: `fonts.googleapis.com` 200, `registry.npmjs.org` 200, `fonts.gstatic.com` 404 for the bare root (TLS succeeded).
- `.env.local` created from `.env.example` with a generated 64-hex `JWT_SECRET` (never printed); `DATABASE_URL`, Supabase and WhatsApp values empty; ignored by `.gitignore` rule `**/.env.*`.
- `npm run build` (repo root): exit 0, compiled in 14.9 s, 114 static pages generated, no warnings. Output saved to `probiz-baseline\build.log`.
- Before starting the server, read `node_modules/next/dist/cli/next-dev.js`: the dev server child is started with `child_process.fork` and no `cwd` option, so it inherits the isolated working directory.
- Dev server: started from `C:\Users\skhare\probiz-baseline` with `node C:\Users\skhare\Probiz-Finance\node_modules\next\dist\bin\next dev C:\Users\skhare\Probiz-Finance`, `TRUST_PROXY=1`. Next reported `Environments: .env.local` and `[db] DATABASE_URL not set, using local PGlite in .data/pglite`.
- Proof of isolation before any test data: `probiz-baseline\.data\pglite` did not exist before the first health request, then existed (created 15:26:49) after it; the original manifest was identical and its newest write time stayed 11:35:22.
- `GET /api/health`: 200 `{"status":"ok"}`.
- Demo accounts (setup.md values, isolated database only): `createAdmin` 200, `staffLogin` 200 (role admin), two `POST /api/admin/employees` 201, `userSignUp` 200, `userLogin` 200. Tokens were never printed.
- `scripts/smoke-api.sh` (Git Bash): exit 0. All steps passed except the multipart home-loan step, which sent no request: Git Bash passes `/tmp/smoke.pdf` to Windows `curl.exe`, which cannot open it (`curl: (26) Failed to open/read local data from file/application`; hidden by `-s`). Re-running that step with the Windows path to the same file returned `Loan details submitted successfully` with `uploadedDocuments.panCard = /uploads/image/media-....pdf`, saved under `probiz-baseline\public\uploads\image\`; the repository `public/uploads` was not created.
- The smoke script's own `== login` line prints the first 120 characters of the throwaway `smoke@test.com` token (header and part of the payload, no signature); that test user exists only in the isolated database.
- `npm run check:intake`: exit 0, "All intake checks passed" with 86 passed checks (33 forms create a lead and are visible to admin; validation and consent; honeypot; rate limit 429 on the 6th request; 7-day duplicate merge; legacy URL; assistant channel, consent and customer link; status change and note events; customer token cannot read admin leads). Output saved to `probiz-baseline\intake.log`. (Corrected in Stage 6: this entry originally said 91; a recount of the saved log shows 86 `ok` lines.)
- Dev server log: 495 lines, no errors, no warnings, no 5xx; status counts 200x53, 201x47, 400x3, 401x3, 404x3, 409x1, 429x1. The Inter font loaded (no fallback warning).
- Original database manifest comparisons: identical after build, after server startup, after health, after account creation, after the smoke test, and after the intake checks and server stop (972 files; newest write 11:35:22).
- Isolated database after testing: 1,159 files, 41,877,683 bytes.
- Server stopped; port 3000 free.

Stage 4B results summary:

| Check | Result |
|---|---|
| Build | Pass |
| Health | Pass |
| Smoke test | Pass with warning (multipart step needs a Windows path under Git Bash; verified manually) |
| Intake checks | Pass (86 of 86; originally recorded as 91, corrected in Stage 6) |
| Original database unchanged | Yes, at every checkpoint |

- Files created outside the repository: `C:\Users\skhare\probiz-baseline\` (`.data\pglite\`, `public\uploads\image\media-...pdf`, `build.log`, `smoke.log`, `intake.log`, `pglite-manifest-before.txt`, `pglite-manifest-after.txt`), `C:\Users\skhare\.certs\windows-root-cas.pem`, and Git Bash's temporary `smoke.pdf` in `%TEMP%`.
- Files created inside the repository (ignored by Git): `.env.local`; `.next/` regenerated by the build and dev server.
- Tracked changes: none. Untracked: this log only.
- Errors: one PowerShell-to-bash quoting error while re-running the multipart step (nothing was sent).
- Warnings: smoke-script multipart issue on Windows; `MODULE_TYPELESS_PACKAGE_JSON` when `check:intake` imports `lib/forms.js` (informational).
- Next proposed stage: Stage 5, Firebase architecture and Firestore data-model design (documentation only).

### Stage 5: Firebase architecture and data-model design

- User approval: "Approved. Proceed with Stage 5 only. Do not continue to Stage 6 without my approval." Continued with "Continue working on Stage 5 only" (no application code, no packages, no Firebase resources, no commit or push).
- Branch and commit before and after: `shivansh_dev` at `9f2bb9390a77e8432c14d45958576f08f2dc3c95`; no commits.
- Official sources read (fetch tool): Firestore pricing, quotas, transactions, queries, index overview, security-rules overview and IAM pages; Cloud Storage pricing and signed URLs; Cloud Billing budgets; `firebase-tools` README and source (`commandUtils.ts`, `apphosting/backend.ts`); `firebase-admin` source (`src/storage/index.ts`, `utils.ts`, `storage.ts`); Next.js environment-variable guide in `node_modules/next/dist/docs`.
- Network: `firebase.google.com` returned HTTP 403 (fetch tool and Node); Firebase-console-only claims are marked "Not verified this session".
- Commands (read-only):
  - Node HTTPS GET of `firebase.google.com` (403) and npm registry metadata for `firebase-tools` (latest 15.36.0).
  - A `node -e` script that loaded the 47 model files and wrote field tables to `%USERPROFILE%\probiz-baseline\schema-tables.md` (29 schema groups). Loading models opens no database (`server/db.js` connects on the first query only).
  - A SHA-256 manifest comparison of the original `.data/pglite`: 972 files, 0 differences, newest write 11:35:22.
- Code read (no changes): `server/db.js`, `server/odm.js`, `server/http.js`, `server/storage.js`, `server/middlewares/{uploads,staffAuth}.js`, `server/routes/index.js`, `server/leads/{intake,rateLimit}.js`, admin, admin-panel and user controllers, `pages/admin-panel/leads/[type]/[id].js`, `scripts/*`, `.gitignore`, `package.json`.
- Documents created (untracked):
  - `docs/firebase-architecture.md`
  - `docs/firebase-data-model.md`
  - `docs/firebase-security-plan.md`
  - `docs/firebase-migration-plan.md`
- Corrections made during verification:
  - Lock and rate-limit documents store no raw IPs or phone-based keys.
  - Firestore `== null` and `orderBy` skip missing fields: explicit nulls and `lastActivityAt` backfill in migration; residual queries never push `orderBy`.
  - Index list corrected: equality-only combinations need no composite index; range counts and descending sorts need separate indexes; `refIds` index recommended, not required.
  - Local signed links need a one-line `isFile` change in the admin lead page (D4 wording corrected).
  - `/api/createAdmin` is open while no admin exists, so cutover requires an admin check.
- Decisions D1 to D13 recorded as proposed (Decision Log); none approved yet.
- Files created outside the repository: `%USERPROFILE%\probiz-baseline\schema-tables.md`.
- Application code, `package.json`, `package-lock.json`, `.gitignore`: unchanged. No packages installed. No Firebase resources created.
- Verification:
  - Secret-pattern scan of `docs/*.md` found one false positive (the scan's own pattern list in the security plan). The line was reworded and the re-scan found 0 matches.
  - All cross-document links resolve.
  - Git status: `## shivansh_dev` with five untracked files under `docs/`; HEAD `9f2bb93`; no tracked changes.
- Errors: none. Warnings: unverified Firebase-console claims (Storage default bucket and App Hosting on the Blaze plan, Hosting SSR via Cloud Functions, token URLs under deny-all rules, behaviour after free quota is exhausted, emulator index enforcement, minimum Java version).
- Next proposed stage: Stage 6, local Firebase and Emulator foundation (separate approval).

### Stage 6: Local Firebase and Emulator foundation

- **Approval and scope:**
  - Approved: D8, D9, Eclipse Temurin 21 with checksum verification, Firebase Admin SDK foundation, Firestore and Storage emulators, demo project configuration.
  - Added requirement: the free-first constraint (₹0/month).
  - Not allowed: real Firebase resources, billing, commit, push, Stage 7.
- **Branch and commit:** `shivansh_dev` at `9f2bb9390a77e8432c14d45958576f08f2dc3c95` before and after; no commits.
- **Pre-checks:**
  - `firebase-tools` v15.36.0 source (`controller.ts`) rejects Java below `MIN_SUPPORTED_JAVA_MAJOR_VERSION`; Java 21 was accepted.
  - Ports 4400, 4500, 8080, 9150 and 9199 were free.
  - `raw.githubusercontent.com` is reset by the network; github.com pages and release downloads work.
  - Windows PowerShell 5.1 `Invoke-WebRequest` failed the TLS handshake, so Node and Windows `curl.exe` were used instead.
- **Dependency:**
  - `firebase-admin@^13.10.0` (13.10.0), installed with `npx --yes npm@11.16.0 install firebase-admin@^13.10.0 --no-audit --no-fund`.
  - Lockfile change: 160 packages added, 0 removed, 0 version changes, 6 dev-flag updates (`ansi-regex`, `debug`, `escalade`, `fast-deep-equal`, `strip-ansi`, `util-deprecate`); all 28 `libc` entries kept.
  - npm pruned the 2 extraneous `node_modules` packages (defect 19). They were not in the lockfile.
  - npm 11 did not run two install scripts: `@firebase/util` (writes web-app auto-config only when `FIREBASE_WEBAPP_CONFIG` is set) and `protobufjs` (prints a version-scheme warning). Neither is needed by the Admin SDK.
- **Java:**
  - `OpenJDK21U-jre_x64_windows_hotspot_21.0.13_9.zip` (49,106,397 bytes) from the Adoptium GitHub release.
  - SHA-256 `2332c0b4cff6bed722da3567c91d5e47568bcba863fa4945d0a8d6fc76158628` matched both the Adoptium API and the release `.sha256.txt`.
  - Extracted to `%USERPROFILE%\tools\jdk-21.0.13+9-jre`; `java -version`: OpenJDK 21.0.13 2026-10-20 LTS (Temurin).
  - `JAVA_HOME` and `PATH` were set per terminal session only.
  - A first Node download was reset mid-transfer and curl could not resume, so the file was re-downloaded in full; the 2.5 MB partial file was overwritten.
- **Firebase CLI:** `npx --yes firebase-tools@15.36.0 --version` printed 15.36.0, with an `EBADENGINE` warning (`superstatic` wants Node 20, 22 or 24; local Node is 23.6.0) and deprecation notices inside the CLI's own dependencies.
- **Files created:**
  - `server/firebase/admin.js`: server-only singleton with demo-project and production guards, `\n` key handling, `ignoreUndefinedProperties`, and `closeFirebase()` for scripts.
  - `scripts/check-firebase-emulator.js`
  - `firebase.json` (Firestore 127.0.0.1:8080, Storage 127.0.0.1:9199, UI disabled, single-project mode)
  - `.firebaserc` (`demo-probiz-finance` only)
  - `firestore.rules` and `storage.rules` (deny all)
  - `firestore.indexes.json` (13 required + 1 recommended composite indexes, 5 field exemptions)
  - `docs/FIREBASE_FREE_TIER_STRATEGY.md`
- **Files modified:**
  - `package.json`: dependency plus `emulators` and `check:firebase` scripts.
  - `package-lock.json`
  - `.env.example`: `PGLITE_DIR` and Firebase placeholders, no values.
  - `.gitignore`: service-account JSON patterns, `.firebase/`, `.runtimeconfig.json`.
  - `server/db.js`: optional `PGLITE_DIR`; unchanged when it is not set.
  - The four Stage 5 design documents (free-first updates) and this log.
- **Emulator test** (`npm run check:firebase`; emulator JARs `cloud-firestore-emulator-v1.22.0` and `cloud-storage-rules-runtime-v1.1.3` downloaded to the CLI cache):
  - 10 of 10 checks passed: Firestore write/read, undefined dropped, `count()`, transaction, rules deny unauthenticated REST (HTTP 403), delete; Storage upload/download, rules deny anonymous read (HTTP 403), delete.
  - Information (D10): a download-token URL returned HTTP 200 under deny-all rules (emulator only).
  - The first run passed every check but Node aborted on exit (libuv assertion from `process.exit()` with open gRPC handles). It was fixed with `closeFirebase()` and a natural exit; the second run exited with code 0.
- **`PGLITE_DIR` test:** from an empty folder, `PGLITE_DIR` opened the isolated database (39 leads); no `.data` folder was created in the working folder.
- **Build:** `npm run build` exit 0, compiled in 11.7 s, 114 pages, no warnings. Log: `probiz-baseline\build-stage6.log`.
- **Regression:**
  - Dev server started from the isolated folder with `PGLITE_DIR` set to the isolated database.
  - `/api/health` returned 200 `{"status":"ok"}`.
  - `check:intake` passed 86 of 86 (same as the corrected baseline). Log: `probiz-baseline\intake-stage6.log`.
  - The isolated database grew from 39 to 77 leads. The server was stopped.
- **Original database:** 972 files, 0 hash differences from the Stage 4B manifest, newest write 11:35:22 (checked twice).
- **Free-tier research** (official pages, 2026-11-14): Vercel Terms and Hobby/limits docs, Netlify credit plans and pricing, Cloudflare Workers limits and pricing, R2 pricing, Render free docs, Supabase pricing and billing docs, Backblaze B2 pricing, Google Cloud Free Tier, Oracle Always Free docs and FAQ. Findings are in [FIREBASE_FREE_TIER_STRATEGY.md](FIREBASE_FREE_TIER_STRATEGY.md); the key one is that Vercel Hobby only allows personal or non-commercial use.
- **Log correction:** the Stage 4B intake count was 86, not 91. During this stage's edits the "Codebase Analysis" heading below had been lost and was restored.
- **Files outside the repository:**
  - `%USERPROFILE%\tools\` (JRE and download)
  - `%TEMP%\probiz-lock-test\` (lockfile test copies)
  - `probiz-baseline\pgdir-cwd\` (empty), `build-stage6.log`, `intake-stage6.log`
  - The npm `_npx` cache (npm 11.16.0, firebase-tools 15.36.0) and the Firebase CLI emulator cache
- **Files inside the repository, ignored:** `firestore-debug.log`.
- **No real Firebase project, no billing, no deployment, no commit, no push.**
- **Errors:** the TLS failures and the crash on exit described above, all resolved. **Warnings:** `EBADENGINE` (Node 23); deprecations in the CLI's dependencies; `MODULE_TYPELESS_PACKAGE_JSON` in `check:intake` (pre-existing).
- **Next proposed stage:** Stage 7, Firestore persistence provider (separate approval).

### Stage 7 — Recovery After Network Interruption

- **Error:** the Copilot connection failed with `net::ERR_CONNECTION_RESET` early in Stage 7. The user removed all pending requests deliberately and paused execution manually. Those requests were not replayed.
- **Read-only audit after the interruption:**
  - `git branch --show-current`: `shivansh_dev`.
  - `HEAD`: `9f2bb9390a77e8432c14d45958576f08f2dc3c95`, the same as `origin/main`.
  - Nothing staged.
  - Remote `origin` is `https://github.com/jayeshrajani/Probiz-Finance.git`; repository `http.sslBackend` is `schannel`. Both unchanged.
  - Working tree identical to the end of Stage 6: modified `.env.example`, `.gitignore`, `package-lock.json`, `package.json`, `server/db.js`; untracked Stage 5 and 6 files.
- **Existing Stage 7 files:** none. `server/data/` and `scripts/check-firestore-adapter.js` did not exist, and `server/odm.js` was unchanged from `HEAD`.
- **Work completed before the interruption:** only this log's Stage 7 status row was set to "In Progress". The ODM, the backfill and the Stage 4A query-feature inventory had been read; no code was written.
- **Incomplete work:** none. There were no partial files, broken imports or half-written functions.
- **Recovery decisions:**
  - Nothing to discard or reset.
  - Continue the approved Stage 7 plan from its first implementation step.
  - Keep the Stage 6 emulator configuration and the original database untouched.
- **Remaining tasks:**
  1. Shared value helpers.
  2. Postgres adapter (existing SQL moved without behaviour change).
  3. Firestore adapter.
  4. Backend selection (`DATA_BACKEND=postgres` default; Firestore only with the emulator and an explicit test flag).
  5. ODM wiring.
  6. Adapter parity test for both backends and all 47 models, with read counts.
  7. `.env.example` placeholders.
  8. Regression tests, build and fingerprint check.
  9. Documentation.
- **Tests requiring verification:** the adapter parity test on the emulator; Postgres regression (health, smoke, intake, build); the original database fingerprint.
- **Risks:**
  - The ODM refactor could change Postgres behaviour. Mitigation: move the SQL verbatim and run the full baseline suites.
  - Firestore semantic differences. Mitigation: a JavaScript matcher that mirrors the SQL semantics, plus parity tests.
- **Pause (2026-11-15):** after the audit, implementation and testing continued without a separate approval. The user paused execution and asked for a status report; no commands were run and no files changed until the user approved completing the remaining tasks (log, final checks, report).

### Stage 7: Firestore persistence provider

- **Scope:** a Firestore implementation of the ODM's persistence, tested on the emulator only. PostgreSQL/PGlite stays the default. SQL-dependent business logic (rate limiting, lead backfill, health check, transactions) is Stage 8.
- **Files created:**
  - `server/data/values.js`: value helpers moved unchanged from `server/odm.js` (`isPlainObject`, `CastError`, `castScalar`, `fieldAt`, `checkPath`, `COLUMN_PATHS`, `toJsonValue`).
  - `server/data/postgres.js`: the ODM's SQL moved unchanged, plus the optional `$ci` operator.
  - `server/data/firestore.js`: the Firestore adapter (planner, in-memory matcher with SQL semantics, Postgres-order sorting, conversions, `_lc` copies, scan-limit guard, read meter).
  - `server/data/index.js`: `adapter()` picks `DATA_BACKEND` (default `postgres`), loaded lazily; Firestore refused without the emulator and `FIRESTORE_PROVIDER_PREVIEW=1`.
  - `scripts/check-firestore-adapter.js`: runs the same scenarios on a fresh PGlite folder and the emulator and compares results.
- **Files modified:**
  - `server/odm.js`: persistence calls go through `adapter()` (`insert`, `update`, `remove`, `removeMany`, `find`, `count`, `hasOther`); new `ci()` export. Schema, casting, validation and update operators unchanged.
  - `package.json`: `check:firestore-adapter` script.
  - `.env.example`: `DATA_BACKEND=postgres` and empty `FIRESTORE_SCAN_LIMIT=` with comments.
  - Docs: `firebase-architecture.md` (sections 7.1 to 7.10), `firebase-data-model.md` (conventions, `consent.at`, section 4 table repaired, section 8 note), `FIREBASE_FREE_TIER_STRATEGY.md` (section 3.1), and this log.
  - Not changed: `package-lock.json` (still 28 `libc` entries), controllers, routes, models, pages.
- **Tests:**
  - SQL comparison: the SQL and parameters from `postgres.js` are identical to `HEAD`'s `odm.js` in 20 of 20 cases (script in `%TEMP%\probiz-sql-parity`, outside the repository).
  - `npm run check:firestore-adapter`, run 2: **121 of 121 scenarios passed; 47 of 47 models identical on both backends.** Scenarios ending in an error did so on both backends with the same error class (unsupported operator, invalid field path, unique violation `MongoServerError`, `ValidationError` twice), except the scan-limit guard, which only Firestore raises (expected). Run 1 was superseded after the "partial save after select" scenario was corrected to perform a real partial write. Logs: `probiz-baseline\stage7-adapter-run1.log`, `stage7-adapter-run2.log`. PGlite collation: `C`.
  - Default mode: Postgres adapter selected; `firebase-admin` and the Firestore adapter not loaded. Guards: Firestore refused without the emulator and without the preview flag.
  - Build: `npm run build` exit 0, compiled in 15.1 s, 114 pages. Log: `probiz-baseline\build-stage7.log`.
  - Live Postgres regression (isolated folder and database): `/api/health` 200; smoke script as expected (signup 409 because the test user exists, login, bad login 401, SIP calculator, admin lists, 401 without token, 404 unknown route; the multipart step needs a Windows path, defect 20). `check:intake` 86 of 86. Server log: isolated database, no 5xx, no errors, no Firestore activity. Logs: `devserver-stage7.log`, `smoke-stage7.log` (tokens masked), `intake-stage7.log`.
  - Original database: 972 files, 0 differences, newest write 11:35:22 (before the tests, after the tests and at the final check).
  - Secret scan of the 24 changed and untracked files: no private keys, API keys, tokens, credentials or database URLs. Four pattern hits in `.env.example` were empty placeholders (`DATABASE_URL`, `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PRIVATE_KEY`). No client file imports `firebase-admin`, `server/data` or `server/firebase`; no `NEXT_PUBLIC_` Firebase variables; `.env.local` ignored and untracked; no `allow ... if true` in the rules files.
- **Firestore reads:** measured per query in [FIREBASE_FREE_TIER_STRATEGY.md](FIREBASE_FREE_TIER_STRATEGY.md) section 3.1. Examples: `findById` 1, `ci()` lookup 1, native count 1, pushed-down page 12, today's regex area lookup 35 (every non-deleted area), regex count 40 (whole collection).
- **Remaining SQL dependencies (Stage 8):**
  - `server/leads/rateLimit.js`: `CREATE TABLE IF NOT EXISTS rate_limits` and an atomic `INSERT ... ON CONFLICT DO UPDATE` counter.
  - `server/leads/backfill.js`: `UPDATE "lead" SET created_at = ...` to backdate imported leads.
  - `server/routes/index.js`: `/api/health` calls `server/db.js` `ping()` directly.
  - `server/db.js`: connection and table creation (stays as the Postgres backend).
  - No transactions yet: lead dedupe merge, lead claim and unique-value checks remain check-then-write, as today.
- **Known limitations:**
  - The app cannot run on Firestore until Stage 8 (gated).
  - The emulator does not enforce composite indexes; the index list is unverified against a real project.
  - Descending pushed-down sorts return equal sort values in descending ID order (Postgres: ascending).
  - Timestamps have millisecond precision (Postgres: microseconds), which matters only at exact range boundaries.
  - Regex uses JavaScript `RegExp` rules (Postgres: POSIX); only the `i` flag is honoured, as before.
  - String order is byte order on both test backends (PGlite `C` collation); a hosted Postgres with another collation may order differently.
  - Queries needing in-memory work over more than `FIRESTORE_SCAN_LIMIT` documents fail on Firestore where Postgres succeeds.
  - Expensive patterns (regex lookups, `findOne` without a sort, null filters on fields without `default: null`, deep offsets) are listed in the free-tier strategy for Stage 8.
- **Files outside the repository:** in `probiz-baseline`: the logs above and `stage7-adapter\run-*` (two PGlite test folders, 40 MB each); `%TEMP%\probiz-sql-parity`; `%TEMP%\smoke.pdf`. The isolated test database received normal smoke and intake traffic.
- **No real Firebase project, no billing, no deployment, no commit, no push.** Branch `shivansh_dev`, HEAD `9f2bb93` (same as `origin/main`), nothing staged, Git configuration unchanged.
- **Errors:** the import check failed once because `JWT_SECRET` was not set (re-run with a placeholder in that process only); an inline PowerShell script broke on quoting (replaced by a script file outside the repository). **Warnings:** `EBADENGINE` (Node 23), `MODULE_TYPELESS_PACKAGE_JSON` in `check:intake` (both pre-existing).
- **Next proposed stage:** Stage 8, direct SQL refactoring and transactional business logic (separate approval).

### Stage 8: Direct SQL refactoring and transactional business logic

- **Approval:** "Approved. Proceed with Stage 8 only." Native Firestore and PostgreSQL transactions, not application-level locks alone; ₹0/month; no commit, push, deploy or billing.
- **Pre-stage plan:**
  1. `transaction()` on both backends.
  2. Rate limiting behind the adapter.
  3. Transactional lead merge, claim and update.
  4. Race-safe duplicate checks.
  5. Backfill without SQL.
  6. Health through the adapter.
  7. `ci()` callers.
  8. Tests, build, regression on both backends, original database check.
- **Files created:**
  - `server/data/tx.js`: active transaction (`AsyncLocalStorage`), retry undo, after-commit callbacks, nested joins.
  - `scripts/check-transactions.js`: 16 concurrency checks per backend, through the real controllers and intake code; `npm run check:transactions`.
- **Files modified:**
  - `server/db.js`: `transaction(fn)` (postgres.js `sql.begin`; PGlite `transaction`); `ensureTable` usable inside a transaction (cache updated only outside).
  - `server/data/postgres.js`: queries run on the transaction connection; `SELECT ... FOR UPDATE` inside transactions; `pg_advisory_xact_lock(hashtextextended(key, 0))`; retries on `40001`/`40P01`; `rateLimit` (the original SQL moved unchanged from `rateLimit.js`); optional `createdAt` on insert. Outside transactions the SQL is unchanged.
  - `server/data/firestore.js`: native `runTransaction`; transactional reads (queries, `count()`, `getAll`); buffered writes; `locks/{sha256}` documents; transactional `rateLimit` with precondition-protected cleanup; optional `createdAt` on insert.
  - `server/data/index.js`: `transaction`, `currentTransaction`; Firestore gate is now emulator only (test-only flag removed).
  - `server/odm.js`: `save()` of models with `unique: true` runs check and write in one transaction locked on the value; retry-safe document state; `save({ createdAt })` for inserts; `saveTracker` records after commit inside transactions; `transaction` export.
  - `server/leads/intake.js`: `upsertLead` in one transaction (locks on the duplicate key and the record; ownership re-check); events after commit.
  - `server/leads/backfill.js`: no SQL; one transaction per envelope with re-check; original time through `save({ createdAt })`; Firestore runs it automatically only with `LEAD_BACKFILL_AUTO=1`.
  - `server/leads/rateLimit.js`: calls `adapter().rateLimit()`.
  - `server/routes/index.js`: health calls `adapter().ping()`.
  - `server/controllers/adminPanel.controller.js`: `ci()` staff and employee login; transactional lead update and claim; transactional `addEmployee`; per-lead transactions when an employee is removed.
  - `server/controllers/admin.controller.js`: transactional `createAdmin` (case-insensitive duplicate check); `ci()` area lookups; escaped request text in the public regex filters.
  - `server/controllers/user.controller.js`: transactional signup duplicate checks (same messages).
  - `server/controllers/employee.controller.js`: transactional legacy `AddEmployee` (same message).
  - `package.json`: `check:transactions`.
  - `.env.example`: `DATA_BACKEND` comment; `LEAD_BACKFILL_AUTO=`.
  - Docs: `firebase-architecture.md` (7.1 to 7.3, 7.7 to 7.10, 8.1, 8.2, 8.4, 8.7 to 8.11); `firebase-data-model.md` (section 2.5 internal collections, section 4 enforced rules); `FIREBASE_FREE_TIER_STRATEGY.md` (section 3.2, items 1 and 2 done); this log.
  - Not changed: models, routes other than the health check, pages, `package-lock.json` (28 `libc` entries), Firebase configuration and rules files.
- **Tests:**
  - `npm run check:transactions`: **32 of 32 passed** (16 per backend), first run. Log: `probiz-baseline\stage8-tx-run1.log`. Checks:
    - Rollback and after-commit; commit then after-commit; retried attempt undone and redone once.
    - 6 parallel creates of a unique area name: 1 created, 5 duplicate errors.
    - 6 parallel submissions from one phone: 1 lead, 5 repeats, 6 references, 1 created and 5 repeat events.
    - 2 employees claiming one lead: 200 and 403 "This lead belongs to another advisor.", one assignment event.
    - Status change and reassignment at once: both kept.
    - Staff-panel employee creates (same email in different case; same ID): one 201, rest 409.
    - Legacy employee creates: one 201, rest 400.
    - Admin creates (same email in different case): one 200, rest 409.
    - Customer signups: one 200, rest 409.
    - 8 requests against a limit of 5: 5 allowed.
    - 2 parallel backfills: one envelope per record, original creation time.
    - Employee removal: 2 open leads unassigned, won lead kept, 2 events.
    - Health ping.
  - SQL comparison (script outside the repository): 20 of 20 statements identical to `HEAD` outside transactions.
  - `npm run check:firestore-adapter`: 121 of 121 scenarios, 47 of 47 models identical (unchanged from Stage 7). Log: `stage8-adapter-regression.log`.
  - Build: exit 0, compiled in 5.8 s, 114 pages, 0 warnings. Log: `build-stage8.log`.
  - Live PostgreSQL/PGlite (isolated folder and database):
    - Health 200.
    - Smoke as expected (signup 409 because the test user exists; multipart with a Windows path 201).
    - Upper-case staff login 200 (admin); wrong password 401.
    - `getAllAreas?search=(` and `getFilterProperties?areaName=(.*` 200 (were 500).
    - `check:intake` 86 of 86; server log: no 5xx, no errors, no Firestore activity.
    - Logs: `devserver-stage8-postgres.log`, `smoke-stage8-postgres.log`, `intake-stage8-postgres.log`.
  - Live Firestore (whole app on the emulator, `demo-probiz-finance`, in memory):
    - Test admin and customer created through the API (first admin 200; a second admin without a token 401).
    - Health 200; smoke as expected (signup 200 then 409).
    - Multipart 201; upper-case staff login 200 (admin).
    - Regex probes 200.
    - `check:intake` **86 of 86**.
    - 113 requests, no 5xx.
    - The `PGLITE_DIR` canary folder was never created, so no SQL was used.
    - Logs: `devserver-stage8-firestore.log`, `smoke-stage8-firestore.log`, `intake-stage8-firestore.log`, `emulator-stage8-app.log`.
  - Original database: 972 files, 0 differences, newest write 11:35:22 (before the tests and at the final check).
  - Final checks (script in `%TEMP%\probiz-stage8-checks`):
    - Secret scan of 34 changed and untracked files: 0 hits.
    - No client file imports server-only modules.
    - No file outside the Postgres adapter and `server/db.js` requires `server/db.js`.
- **Remaining SQL dependencies:** none outside `server/data/postgres.js` and `server/db.js` (the Postgres backend itself).
- **Free tier:** per-flow costs in [FIREBASE_FREE_TIER_STRATEGY.md](FIREBASE_FREE_TIER_STRATEGY.md) section 3.2 (a new lead is about 7 reads and 7 writes); the sample day stays at about 21% of reads and 1% of writes. No billing, no cloud project.
- **Known limitations:**
  - PGlite has a single connection, so the Postgres concurrency checks prove the logic but not lock behaviour across connections. Hosted Postgres (`DATABASE_URL`, `sql.begin`) was not run: no local Postgres server.
  - Firestore reads inside a transaction do not see that transaction's own writes (Firestore rule); no current flow needs that.
  - Not changed in this stage:
    - Legacy `UpdateEmployee` (no duplicate check, as before).
    - The first-admin bootstrap (`requireAdminUnlessFirst` counts admins outside the create transaction, so two simultaneous first-admin requests with different emails could both succeed).
    - Lead deletion (not transactional; storage clean-up is Stage 9).
    - Admin lead list and overview (still load all leads; decision D1).
    - `findLead` fallback for legacy IDs (loads all leads of a type).
  - Composite indexes are still unverified (the emulator does not enforce them).
  - `scripts/check-firestore-adapter.js` still sets the removed `FIRESTORE_PROVIDER_PREVIEW` flag; harmless, left unchanged.
- **Files outside the repository:** in `probiz-baseline`: `stage8-tx\run-*` (PGlite test folder) and the logs above; `%TEMP%\probiz-stage8-checks\final-checks.js`.
- **Errors and corrections:**
  - An empty file `server/leads/rateLimit.js.new` was created by mistake and deleted immediately.
  - A long inline PowerShell command broke on quoting and was replaced by a script file.
  - **Token shown in the session:** a status check printed the full staff-login response, including the access token for the local test admin of the isolated Stage 4B database. It is not in any log file. It is valid for 7 days and only works where that admin ID exists. Rotating `JWT_SECRET` in `.env.local` invalidates it. Later checks print only extracted fields.
- **Warnings:** `EBADENGINE` (Node 23); `punycode` deprecation from a dependency; `MODULE_TYPELESS_PACKAGE_JSON` in `check:intake` (pre-existing).
- **No real Firebase project, no billing, no deployment, no commit, no push.** Branch `shivansh_dev`, HEAD `9f2bb93` (same as `origin/main`), nothing staged, Git configuration unchanged.
- **Next proposed stage:** Stage 9, secure file-storage abstraction (separate approval).

### Stage 8.5 — Dynamic Site Settings, Contact Information & Social Media Integration (planning)

- **Request (2026-11-15):** make the public contact details and social links editable by admins and stored in the database (both backends), shown on the website through an API without a rebuild. Stage 8.5 goes before Stage 9; Stages 9 to 12 are unchanged. Planning and frontend audit only; no code until approved.
- **State verified:**
  - Branch `shivansh_dev`, HEAD `9f2bb93` (same as `origin/main`).
  - 14 modified and 20 untracked files, nothing staged, no stash.
  - Stage 8 files present (`server/data/tx.js`, `scripts/check-transactions.js`, ODM `transaction`, health through the adapter).
- **Audit findings:**
  - **Single source today:** `lib/site.js` (build-time constants): `phone` `8770052912` (`+91 87700 52912`, `tel:+918770052912`), `email` `info@probizfinance.com`, `socials` (Facebook `probizmanagement`, Instagram `financeprobiz/`, LinkedIn `probizmanagement`, YouTube `@probizfinance`).
  - **Consumers of `site.phone*` / `site.email` / `site.socials`:** `SiteFooter`, `MobileNav`, `ApplySection`, `ApplicationForm`, `ProductPage`, `ServicePage`, `pages/contact.js`, `pages/Careers.js`, `pages/forgot-password.js`, `pages/property-detail.js`, `Assistant.jsx` and `brain.js`. No other hard-coded public numbers or social URLs in the frontend.
  - **Secondary number:** `8770052912` is the only number configured anywhere (`lib/site.js`, `content/company.json`). It is the current primary on the website and becomes the secondary.
  - **`9981303887`:** not present anywhere in the repository.
  - **Unused stale data:** `content/company.json` `contact` block (`Info@probizfinance.com`, old social links) is not read by any page.
  - **Other email address:** `content/legal.json` (privacy policy) names `probizmanagementservices@gmail.com` for data-rights requests (legal text, not changed without approval).
  - **Social icons:** all four already exist, only in the footer (`@phosphor-icons/react` `FacebookLogo`, `InstagramLogo`, `LinkedinLogo`, `YoutubeLogo`). They open in a new tab with `rel="noopener noreferrer"`, but their labels are only the platform name. None is missing.
  - **WhatsApp:** no public WhatsApp button or link exists. The only `wa.me` link is the admin lead page (the customer's own number; unrelated). The library already has `WhatsappLogo` (used on that page), so no new dependency is needed.
  - **Assistant:** its launcher is fixed bottom-right on every public page.
  - **Internal WhatsApp alerts:** use `WHATSAPP_*` environment variables (`server/leads/notify/whatsapp.js`); out of scope.
  - **Social URL checks (anonymous fetch):** `linkedin.com/company/probizmanagement` redirects to the public page `in.linkedin.com/company/probizfinance` ("Probiz Finance"). `linkedin.com/company/13755959/` shows a sign-in wall. Facebook (`srloans`, `probizmanagement`), Instagram and YouTube could not be read anonymously. Instagram and YouTube match the current site; Facebook `srloans` differs from the current `probizmanagement`.
  - **Backend:** `tableName('SiteSettings')` gives `site_settings` on both backends. A new public GET route must be added to `PUBLIC_READS` in `server/routes/index.js`. `/api/admin/*` routes use `requireAdmin` (employees 403, customers and anonymous 401). Firestore rules deny all client access (unchanged).
- **Proposed plan:** see the Stage 8.5 plan presented to the user on 2026-11-15 (model `site_settings/contact_social`, public `GET /api/site-settings`, admin `GET/PUT /api/admin/site-settings`, "Website settings" admin page, one shared client provider, a floating WhatsApp button, five-minute caching, tests on both backends).
- **Open decisions:** LinkedIn URL form, Facebook profile, WhatsApp button position, response shape, seeding approach, where the secondary number appears, privacy-policy email, phone rules.
- **Files changed in planning:** this log only.

### Stage 8.5 — Dynamic Site Settings, Contact Information & Social Media Integration (implementation)

- **Approval:** "Approved. Proceed with the implementation of Stage 8.5 only" with decisions D1 to D8 (decision log). Execution was paused once ("STAGE 8.5 EXECUTION APPEARS STALLED"); a read-only diagnosis found no hung process and one failing test case; the targeted fix and the remaining work were then approved.
- **Files created:**
  - `content/site-settings.json`: the approved initial values (seed data and website fallback).
  - `server/models/siteSettings.model.js`: model `SiteSettings` (table/collection `site_settings`), one record with the fixed ID `contact_social`.
  - `server/controllers/siteSettings.controller.js`: validation and normalisation, public and admin views, 2-minute public cache cleared on save, transactional save, `seedSiteSettings()`.
  - `server/routes/siteSettings.routes.js`: `GET /api/site-settings`; `GET` and `PUT /api/admin/site-settings` (`requireAdmin`).
  - `lib/site-settings.js`: `SiteSettingsProvider` and `useSiteSettings()`; one request shared by all components, refreshed at most once a minute during a visit; link helpers (`tel:+91…`, `https://wa.me/91…`, `mailto:`); `getSiteSettings()` for the assistant.
  - `components/site/WhatsAppButton.jsx`: floating button, bottom-left, public pages only, hidden without a WhatsApp number.
  - `pages/admin-panel/settings.js`: "Site Settings" page.
  - `scripts/seed-site-settings.js` (`npm run seed:site-settings`) and `scripts/check-site-settings.js` (`npm run check:site-settings`).
- **Files modified:**
  - Server: `server/routes/index.js` (routes registered, `/api/site-settings` added to `PUBLIC_READS`).
  - Shared: `lib/site.js` (contact values removed; name, address and map stay); `lib/admin-api.js` (`ApiError` keeps field errors); `pages/_app.js` (provider for every page, WhatsApp button on public pages).
  - Public site: `SiteFooter.jsx` (primary on the call button, primary then secondary and email in the address block, four existing icons from settings with "Visit Probiz Finance on …" labels, hidden when empty); `pages/contact.js` (Call primary, "Or call" secondary, WhatsApp, Chat, Email, Visit); `MobileNav.jsx`, `ApplySection.jsx`, `ApplicationForm.jsx`, `ProductPage.jsx`, `ServicePage.jsx`, `pages/property-detail.js`, `pages/Careers.js`, `pages/forgot-password.js`, `Assistant.jsx`, `brain.js` (primary number and email from settings).
  - Admin: `AdminShell.jsx` ("Website settings" under Manage, admins only), `CommandPalette.jsx` (admin-only entry), `components/admin/ui.jsx` (`AdminOnly` accepts a custom message).
  - `package.json`: `seed:site-settings`, `check:site-settings`.
  - Docs: `firebase-architecture.md` (section 8.13), `firebase-data-model.md` (`site_settings`), `FIREBASE_FREE_TIER_STRATEGY.md` (section 3.3), this log.
  - Not changed: `content/legal.json` (D7), `content/company.json` (stale `contact` block, not read by any page), internal WhatsApp alert settings, models other than the new one, Firebase configuration and rules.
- **Initial values (seeded):** primary `9981303887`, secondary `8770052912`, WhatsApp `9981303887` (`https://wa.me/919981303887`), email `info@probizfinance.com`; LinkedIn `https://www.linkedin.com/company/probizfinance/`, YouTube `https://www.youtube.com/@probizfinance`, Instagram `https://www.instagram.com/financeprobiz`, Facebook `https://www.facebook.com/srloans`.
- **Social icons:** all four reused from the footer (`@phosphor-icons/react`); none added (no other social section exists); no new dependency. The WhatsApp icon is the library's existing `WhatsappLogo`.
- **Validation:**
  - Phones accept `+91`, `91`, a leading `0`, spaces, dashes, dots and brackets, and are stored as 10 digits. Primary and secondary: `^[1-9]\d{9}$`. WhatsApp: `^[6-9]\d{9}$`. Only primary and email are required.
  - Email: trimmed, lower-cased, at most 254 characters.
  - Social links: `https:` only, exact host allow-list per platform, no user name, password or port, at most 300 characters.
  - Unknown or internal fields: 400. `updatedBy`/`updatedByName` are set by the server. The public view contains only the eight approved values; the admin view adds `saved`, `updatedAt` and `updatedByName` (never the admin ID).
- **Fix during the stage:** the first test run failed 1 case on both backends: `whatsappPhone: "0731 2345678"` was accepted. That Indore landline normalises to `7312345678`, which is also a valid mobile pattern, so the test expectation was wrong. The diagnosis also found that `^[2-9]` rejected Delhi and Noida landlines. Fix: primary and secondary `^[1-9]`, applied to the server and the frontend guard. The ambiguous case was replaced by `011 2345 6789` (rejected for WhatsApp), and a positive Delhi/Noida case was added.
- **Tests:**
  - `npm run check:site-settings`: run 1 23/25 (cause above); run 2 **27 of 27** (13 per backend plus 1 comparison):
    - Before seeding the public API returns the approved values and writes nothing; seed creates once.
    - Public fields only; admin metadata; normalisation; partial updates; Delhi/Noida landlines.
    - 23 invalid values rejected (`javascript:`, `data:`, `file:`, `http:`, look-alike hosts, user/password, port, wrong platform, malformed emails, invalid phones, operator injection).
    - Unknown or internal fields rejected; cache read once and cleared on save (Firestore: 1 read, then 0); 5 parallel saves leave one record; re-seeding keeps admin changes; stored as `site_settings/contact_social`; same values on both backends.
    - Logs: `probiz-baseline\stage85-settings-run1.log`, `stage85-settings-run2.log`.
  - `npm run check:transactions`: 32 of 32. `npm run check:firestore-adapter`: 122 of 122 scenarios, **48 of 48** models identical (the new model included).
  - Build: exit 0, 115 pages (new `/admin-panel/settings`), 0 warnings (run twice; the second after the cache change).
  - Live PostgreSQL/PGlite (production build, isolated database):
    - Seed run twice: created, then "nothing changed".
    - Access: anonymous 401, customer 401, employee 403, admin 200 (GET and PUT); rejected attempts changed nothing; spoofed URL and internal field 400 over HTTP.
    - Change visible immediately on the same instance; still saved after a server restart.
    - Smoke as expected; `check:intake` 86 of 86; no server errors.
  - Live Firestore emulator (two production instances on ports 3000 and 3001):
    - Seed run twice: created, then "nothing changed".
    - Same access results.
    - Change on instance A visible there immediately and on instance B after **120 s** (its 2-minute cache).
    - Still saved after restarting instance A.
    - Smoke as expected; `check:intake` 86 of 86; no errors on either instance; PGlite canary folder never created.
  - Browser (integrated browser, production build):
    - Contact page and footer at 1440×900 and 390×844 (screenshots inspected): primary before secondary, `tel:+919981303887` then `tel:+918770052912`, the email, and four social icons. The icons point to the approved URLs with `target="_blank"`, `rel="noopener noreferrer"` and "Visit Probiz Finance on …" labels.
    - The database value replaced the fallback after loading.
    - Floating WhatsApp button: `https://wa.me/919981303887`, 56 px, 20 px from the bottom-left corner on desktop and 16 px on mobile; no overlap with the assistant button; covers no footer link or icon at the bottom of the page.
    - Admin page: stored values and "Last updated … by Admin"; an invalid Facebook URL shows a field error and an error toast; while saving the button is disabled ("Saving…") and a second click sends no second request; success toast "Website settings saved. The public website shows them within about 5 minutes."; values kept after a reload. An employee sees "Admins only", no form and no navigation item.
    - After an admin change, a normally reloaded public page showed it after **46 s** (60 s browser HTTP cache), with no rebuild.
  - Original database: 972 files, 0 differences, newest write 11:35:22 (before the tests and at the final check).
  - Final checks: secret scan of 61 changed and untracked files, 0 hits; no browser code imports server-only modules; no direct SQL outside the Postgres adapter.
- **Update propagation (measured, then documented):** same instance: next uncached request (immediately for API calls; up to 60 s in a browser). Another server instance: up to 2 minutes (measured 120 s). Worst case for a new page load: 2 minutes server + 60 s CDN + 60 s browser, about 4 minutes. Worst case for a tab left open: plus up to 1 minute until its next refresh, about 5 minutes.
- **Free tier:** at most 1 Firestore read per server instance every 2 minutes (under 1,000 reads a day even with one instance permanently warm, under 2% of the free quota); 1 write per admin save; one small document.
- **Known limitations:**
  - Pre-built pages contain the fallback values. Visitors without JavaScript and search engines see them until the next deployment, and they can be outdated if the settings change and the API is unreachable.
  - Digits alone cannot tell a 7x/8x landline from a mobile number or confirm WhatsApp registration.
  - Landline numbers are displayed in the mobile grouping (`+91 11234 56789`).
  - Facebook `srloans` and the LinkedIn page were set as approved, but their content could not be read without signing in. LinkedIn `probizfinance` is the public "Probiz Finance" page that the old link redirects to.
  - The floating button briefly overlaps page content while scrolling (as the assistant button does) and is a dark circle on the dark footer.
  - The stale `content/company.json` contact block remains (unused).
- **Errors and corrections:** the test failure above. My first HTML and toast checks gave misleading results (a PowerShell line array; a snapshot taken after the toast had closed); both were re-checked directly. No secrets were printed.
- **Files outside the repository:** in `probiz-baseline`: `stage85-settings\run-*`, the logs above (`live-stage85-*.log`, `server-stage85-*.log`, `smoke-stage85-*.log`, `intake-stage85-*.log`, `build-stage85.log`, `emulator-stage85.log`); `%TEMP%\probiz-stage85\live.mjs`. The isolated test database now holds the seeded settings record (approved values).
- **No real Firebase project, no billing, no deployment, no commit, no push.** Branch `shivansh_dev`, HEAD `9f2bb93` (same as `origin/main`), nothing staged, Git configuration unchanged.
- **Next proposed stage:** Stage 9, secure file storage (separate approval).

### Stage 9: Secure file storage (planning)

- **Request (2026-11-15):** plan only; reuse earlier audits; no application code changes until approved.
- **Code verified:**
  - `server/storage.js` `uploadFile()` returns a public URL: Supabase public bucket `uploads` in production, `public/uploads` (served publicly) locally.
  - `server/http.js` `multipart()` trusts the declared MIME type and takes the extension from the client file name.
  - All 20 upload middlewares (`property` plus 19 document types) store `file.location` in about 50 controller fields.
  - No code deletes files (lead or property deletion).
  - The admin lead page recognises files by `http(s)://` or `/uploads/`.
  - Public `POST /api/addProperty` has no rate limit.
- **Provider facts re-checked today:**
  - **Supabase Free:** 1 GB file storage, 5 GB egress, 50 MB maximum upload, 2 active projects; pauses after 1 week of inactivity; no backups.
  - **Supabase buckets:** private by default; downloads only through server-signed, time-limited URLs, which cannot be revoked individually.
  - **Backblaze B2:** first 10 GB free, egress free up to 3× storage, Class A/B/C calls free, 2,500 Class D calls per day free, pre-signed URLs and server-side encryption supported.
  - **Firebase:** pages still blocked (403); Cloud Storage for Firebase needing Blaze rests on the Stage 5 check.
- **Proposed plan:** Supabase private bucket for documents, existing public bucket for property media only, `pf:` references, signed links in the lead detail after `canSee`, local HMAC file route, magic-byte checks, file deletion with records, D12 rate limit, `check:storage` tests. Existing files are untouched; their move is the Stage 10 optional step.
- **Files changed in planning:** this log only.

### Stage 9: Secure file storage (implementation)

- **Approval (2026-11-15):** Cloud Storage for Firebase as the provider (instead of the planned Supabase private bucket), Storage emulator only; no billing, no cloud resources; preserve existing documents; no Stage 10.
- **Decisions applied as recommended in the plan:**
  - **D4:** signed links in the lead detail after `canSee`.
  - **D10:** download-token URLs for public property media.
  - **D11:** legacy admin list endpoints return `pf:` references.
  - **D12:** `addProperty` rate limit.
  - **D13:** bucket region decided at cloud setup.
- **Files created:** `server/storage/firebase.js`, `server/storage/sniff.js`, `server/routes/files.routes.js`, `scripts/check-storage.mjs`.
- **Files modified:**
  - `server/storage.js`: facade; `legacy` provider kept as the default and unchanged except for the content-derived extension.
  - `server/http.js`: content check during parsing; per-route visibility; stored files recorded per request.
  - `server/middlewares/uploads.js`: `property` public, the 19 document types private.
  - `server/routes/index.js`: file route registered, `/api/files/:token` in `PUBLIC_READS`, D12 limiter.
  - `server/leads/intake.js`: orphan deletion on failed submissions; `clientIp` export.
  - `server/controllers/adminPanel.controller.js`: signed links and `no-store` in the lead detail; file deletion with the lead.
  - `server/controllers/admin.controller.js`: media deletion with the listing.
  - `pages/admin-panel/leads/[type]/[id].js`: recognises `/api/files/` links.
  - `.env.example`: `FILE_STORAGE_BACKEND`, `PRIVATE_FILE_URL_TTL_SECONDS`.
  - `package.json`: `check:storage`.
  - Docs: architecture section 10, security plan sections 4 to 7, data model section 5, free-tier section 6, this log.
- **Tests:**
  - **`check:storage` (app on the Firestore and Storage emulators, `FILE_STORAGE_BACKEND=firebase`, 60 s links): 20 of 20 on the second run.** The first run had 19 of 20: the test expected `.._.._My_PAN_.pdf`, but Busboy already strips directory parts, so the stored name is `My_PAN_.pdf`; the expectation was corrected.
    - **Private storage:** documents stored as `pf:` with no download token, detected type and `private, no-store`. Direct anonymous bucket read: 403. The submission response has no URLs.
    - **Upload checks:** a renamed executable, HTML sent as an image, and a file over 5 MB are refused (400), with nothing extra stored.
    - **Lead detail:** signed link with `no-store`; the link returns the exact bytes with safe headers. Tampered, swapped, wrong-extension, traversal and truncated links: 404.
    - **Access:** assigned employee 200 with links; other employee 403 with no links; customer and anonymous 401. Legacy list returns `pf:`.
    - **Expiry:** links expire (404 after 62 s).
    - **Deletion safeguards:** pre-Stage 9 and malformed references are never deleted; an employee cannot delete (403); admin lead deletion removes its documents.
    - **Property media:** images get a working download-token URL; the D12 limit allows 5 then 429; listing deletion removes its media.
  - **Firebase-mode regression:** health and smoke as expected; Windows-path multipart 201 stored as `pf:`; `check:intake` 86 of 86. No server errors, no link tokens in the log, no SQL use (the PGlite canary folder was never created).
  - **Browser (admin lead page, Firebase mode):** the private PNG preview loaded and the PDF link returned 200 `application/pdf` through `/api/files/`.
  - **Default (`legacy`) mode on isolated PGlite:**
    - `check:intake` 86 of 86; a spoofed PDF is refused (400).
    - With `next dev`, a real PDF upload is stored as before (`/uploads/image/...pdf`, extension now from the content), written under the working folder.
    - With `next start` the legacy provider refuses local writes in production (existing behaviour), so a production-mode legacy upload returns 500 as before Stage 9.
  - **Build:** exit 0, 115 pages, 0 warnings.
  - **Final checks:** original database 972 files, 0 differences; secret scan of 69 files, 0 hits.
  - **Not repeated:** `check:transactions`, `check:firestore-adapter`, `check:site-settings` (no data-layer change).
- **Emulator vs real Firebase Storage:** see the security plan, section 6 (token URLs under deny-all rules, credentials, encryption and region, Blaze cost, host response limits for streamed files).
- **Known limitations:**
  - **Default mode stays insecure:** the default `legacy` mode keeps documents public (existing behaviour) until `FILE_STORAGE_BACKEND=firebase` is enabled at cutover.
  - **Old files stay public:** files stored before Stage 9 remain publicly reachable until the approved Stage 10 move.
  - **Signed links:** they are capability links (anyone holding one can open the file until it expires; 10 minutes by default), and they cannot be revoked individually before expiry.
  - **Not implemented:** malware scanning (no free option) and direct-to-storage uploads (F3).
  - **Orphans:** files from a failed `addProperty` or `updateProperty` call are not cleaned up (submission orphans are).
  - **Pre-existing:** the legacy home-loan controller logs full applications (`Request files:` / `Loan Data:`) to the server console, including customer personal data; recommended for Stage 11.
- **No real Firebase project, no billing, no deployment, no commit, no push.** Branch `shivansh_dev`, HEAD `9f2bb93`.
- **Next proposed stage:** Stage 10, migration utility (separate approval).

### Stage 10: Migration utility (planning)

- **Request (2026-11-15):** plan a safe, resumable migration of PGlite/Postgres records to Firestore and of legacy public KYC files to private Firebase Storage. Planning only.
- **Plan:** reuse the Stage 5 migration plan; source reader in key order; adapter conversion with exact timestamps; create-or-skip writes with conflict reporting; local checkpoints; duplicate scan instead of the removed `unique_keys` reservations; verify step; separate file command with SHA-256 and size verification before the `pf:` rewrite; no deletion.
- **Approval (2026-11-15):** implementation approved with decisions on rollback (deferred), legacy originals (kept, retirement report), manifest (Firestore `_migration_files`) and no production access. Final architecture: Firestore + Firebase Storage; Supabase only as a read-only legacy source.

### Stage 10: Migration utility (implementation)

- **Files created:**
  - `server/migrate/guards.js`: source and target safety checks (run before anything is opened).
  - `server/migrate/source.js`: read-only SQL (key-ordered pages, counts, samples, duplicate groups, reference values).
  - `server/migrate/transform.js`: row to document (adapter `toStored` and `lowercaseCopies`, microsecond Timestamps, `lead.lastActivityAt` fill), canonical hash, unique rules, masking, Firestore validity checks.
  - `server/migrate/data.js`: `data` command (classification, batched `create`, conflict handling, write budget, checkpoints, retries).
  - `server/migrate/verify.js`: counts, content hashes, unique values, references before and after, active admin, applications without a lead.
  - `server/migrate/files.js`: `files` command (legacy reader, content check, private upload, read-back verification, transactional rewrite, retirement list).
  - `server/migrate/manifest.js`, `server/migrate/run.js`: `_migration_files` helpers; reports, checkpoints, budget, retry, small worker pool.
  - `scripts/migrate-firestore.js` (CLI), `scripts/check-migration.js` (tests).
- **Files modified:** `server/data/firestore.js` (exports `toStored` and `lowercaseCopies`; no behaviour change), `server/storage/firebase.js` (exports `objectPath`; no behaviour change), `package.json` (`migrate:firestore`, `migrate:files`, `migrate:verify`, `check:migration`), and the docs listed below.
- **Behaviour:**
  - Dry run by default; `--apply` explicit; `verify` never writes.
  - Same IDs; password hashes and all data copied as stored; `createdAt`/`updatedAt` kept to the microsecond.
  - Existing documents: identical ones are skipped; different ones are reported as conflicts (source newer or target newer) and never overwritten, except source-newer ones with `--update-older` (replaced in a transaction only if the target has not changed since it was read).
  - Batches use `create()`, so a document that appears meanwhile fails safely; transient errors retry with backoff; an ambiguous retry is re-read and classified.
  - `--max-writes` (default 18,000) stops cleanly with exit 2; `--resume` continues from the local checkpoint.
  - Duplicate unique values in the source (case-insensitive emails, employee ID, mobile, area name) refuse that collection.
  - Relationships: lead to application (`refId`, `refIds`), lead to staff (`assignedTo`), event to lead, lead meta to application. Broken ones are reported before migration; verification fails if the target has any the source does not.
  - Files: see the migration plan, section 8. Supabase-related code is limited to the read-only legacy reader in `server/migrate/files.js`; no new dependency.
  - Direct SQL outside the adapter: `server/migrate/source.js` only (read-only, intended; reported by the final checks).
- **Tests (`scripts/check-migration.js`, fresh emulators, copies of `%USERPROFILE%\probiz-baseline`):**
  - **Migration checks: 26 of 26 passed on the first run.** Run folder `%USERPROFILE%\probiz-baseline\stage10-migrate\run-2026-11-14T21-49-44-268Z` (copy A for migration, copy B for duplicates; synthetic fixtures only).
    - Guards refuse the original database, repository folders, `DATABASE_URL`, missing folders, real projects, missing or remote emulators and a real legacy bucket; the CLI refuses without the emulator.
    - Dry run: 777 rows planned, 0 writes, no collections created. Planted orphan event reported before migration.
    - `--max-writes=120`: exit 2 with exactly 120 documents; `--resume`: 657 created, 777 of 777, no duplicates; third apply: 777 unchanged, 0 writes.
    - Verify (all documents compared): counts, content hashes, unique values, references (none introduced), active admin.
    - Admin password hashes identical; fixture timestamps exact to the microsecond (`.123456`, `.654321`).
    - Files dry run: 5 to migrate, 3 refused, 2 failed, nothing written. Apply: 5 migrated; spoofed content, path traversal, another host, a redirect and a missing file refused or failed and left unchanged; each copy matches the source SHA-256 and size, has `private, no-store` and no download token; anonymous direct read 403; retirement report 5 ready, 0 keep, no URLs. Rerun: nothing copied again.
    - Data rerun after the file move: 777 unchanged, 5 `pf:` references kept, 0 writes; verify passes again.
    - Source copy unchanged (full row text of every table) and legacy files unchanged and present.
    - Conflicts: a Firestore edit and a source edit are both reported (exit 1), neither overwritten; `--update-older` replaced only the source-newer one.
    - Duplicate email in a different case: `user` refused, masked value only.
    - Reports: no password hashes, emails, phone numbers, URLs or tokens.
  - **App on the migrated emulator data (`next start`, `DATA_BACKEND=firestore`, `FILE_STORAGE_BACKEND=firebase`): 4 of 4 passed.** Admin and customer sign in with migrated hashes; the admin opens a migrated document through a signed link (same SHA-256); anonymous and customer requests 401; direct bucket read 403; legacy list returns `pf:`. No server errors, no links or tokens in the server log, PGlite canary folder not created.
  - **Usage on 777 records:** dry run 824 reads; full apply 777 writes (120 + 657); verify 1,659 reads; files apply 15 writes for 5 files.
  - **Build:** exit 0, 115 pages, 0 warnings.
  - **Final checks:** original database 972 files, 0 differences; secret scan of 79 files, 0 hits.
  - **Not repeated (no behaviour change in the code they cover):** `check:intake`, `check:storage`, `check:transactions`, `check:firestore-adapter`, `check:site-settings`.
- **Known limitations:**
  - **Emulator only:** quotas, latency, index builds and Storage behaviour are not proven against real Firebase. The real legacy Supabase reader was only tested against a local stand-in.
  - **Small data set:** 777 records and 5 files; production volume, run time and the daily write quota are estimates (the dry run reports the writes needed).
  - **Deferred:** reverse migration (`to-postgres`), `--since` catch-up and `--confirm-project` for real projects. A tested rollback and cutover plan is mandatory before production migration.
  - **Public originals remain reachable** until each is secured or deleted after separate approval (retirement report).
  - **Not handled:** file references inside arrays (none in the schemas; reported if found); files over 10 MB (reported).
  - **Checkpoints are local files:** if lost, a rerun starts from the beginning without duplicates (it only reads more).
  - **Interrupted file move:** a copy uploaded before the rewrite stays recorded as `pending` and is reused by the next run; an abandoned one would be an orphan object.
  - **Retirement report:** contains object keys that still locate the public copies; keep it private.
  - **Verification samples:** default 50 per collection (`--sample` raises it); tests compared every document.
- **Docs updated:** migration plan (section 0, sections 6, 8, 9, 11), data model (`_migration_files`, migration notes), security plan (sections 6 and 7), this log.
- **No real Firebase project or Supabase access, no billing, no deployment, no commit, no push.** Branch `shivansh_dev`, HEAD `9f2bb93`.
- **Next proposed stage:** Stage 11, complete local testing and security verification (separate approval). Known item for it: the legacy home-loan controller logs full applications to the server console.

### Stage 11: Complete local testing and security verification

- **Approval (2026-11-15):** "Proceed with Stage 11"; Stage 10 accepted. Emulators and isolated data only; run each suite once; minimal fixes for confirmed defects.
- **Security findings and fixes:**
  1. **Personal data in server logs (known item, fixed):** `server/controllers/user.controller.js` logged `req.files` (9 handlers, including the home-loan form) and whole applications (`Loan Data:`, `Car Loan Data:`; 10 handlers) before saving. All 21 lines removed. The Cashfree webhook logged the first 500 characters of its raw payload (customer contact and payment details); it now logs the size only.
  2. **Submitted values in logged errors (fixed):** `ValidationError` and `CastError` messages contain the submitted value, and about 140 controller catch blocks log the error object. Logged output now shows the field paths and error kinds only (`server/data/values.js` `hideValuesInLogs`, used by `server/odm.js`); the messages, which some legacy endpoints return to the caller, are unchanged.
  3. **Password hashes in API responses (fixed):** the legacy admin-only employee endpoints (`addEmployee`, `updateEmployee`, `getAllEmployee`, `deleteEmployee`) returned bcrypt hashes. Removed in `server/controllers/employee.controller.js`.
  4. **No limit on password guessing (fixed):** `adminLogin`, `staffLogin`, `employeeLogin`, `userLogin`, `changeUserPassword` and `admin/me/password` now share a per-IP limit (20 per 10 minutes, 200 per day, then 429) in `server/routes/index.js`, using the existing limiter (both backends).
  5. **Checked, no change needed:** Storage and Firestore rules deny all client access; staff tokens are verified with the secret and re-checked against live, non-deleted accounts (removed employees lose access at once; unsigned `alg: none` tokens are refused); the generic API error handler returns "Internal server error" without details; other logs hold paths, object paths or codes only. Calculator endpoints still log computed numbers (no personal data; left unchanged).
- **Files changed:** `server/controllers/user.controller.js`, `server/controllers/employee.controller.js`, `server/data/values.js`, `server/odm.js`, `server/routes/index.js`; new `scripts/check-e2e.mjs` (role end-to-end checks); `package.json` (`check:e2e`); security plan (defects 22 to 25, section 11, new section 13 launch blockers); this log.
- **Tests (each suite once; fresh emulators and isolated copies of `%USERPROFILE%\probiz-baseline`; logs in `%USERPROFILE%\probiz-baseline\stage11`):**
  - **Emulator suites:** `check:firebase` all passed; `check:firestore-adapter` 122 of 122 scenarios; `check:transactions` 32 of 32; `check:site-settings` 27 of 27.
  - **Log redaction unit check:** messages keep the values; logged output hides them and keeps paths and stack.
  - **Build:** exit 0, 115 pages, 0 warnings (after all code fixes).
  - **Migration verification (`check:migration`, fresh emulators):** 26 of 26. This also loaded the migrated baseline data used by the app runs below.
  - **App in Firebase mode** (`next start`, `DATA_BACKEND=firestore`, `FILE_STORAGE_BACKEND=firebase`, `TRUST_PROXY=1`, 60 s links, unreachable stand-ins for `SUPABASE_URL` and `DATABASE_URL`, PGlite canary folder):
    - Migrated-data access: 4 of 4 (migrated admin and customer sign in; signed link returns the same SHA-256; anonymous and customer 401; direct bucket read 403; legacy list returns `pf:`).
    - **Role end-to-end (`check:e2e`): 19 of 19.** Anonymous (public reads only, 401 elsewhere, malformed JSON 400, unknown route 404, unsigned token refused); customer (sign-up, sign-in, no hash in responses, staff endpoints refused, password change needs the old password); admin (overview, leads, lists without hashes, employee creation with case-insensitive duplicate check, site-settings validation and save, 404s, invalid status 400, assignment); employee (sees own and unassigned leads only, claims by working a lead, cannot reassign or reach admin endpoints, changes own password, loses access when removed, leads return to the pool); the 21st password attempt from one IP gets 429 while other IPs work.
    - `check:intake` 86 of 86; `check:storage` 20 of 20, including link expiry (404 after 62 s), tampered links, access control and upload validation.
    - `scripts/smoke-api.sh` (Git Bash): exit 0. Health, login, bad login 401, protected list 401, admin lists and overview, unknown route 404 as expected; signup returned 409 because the migrated data already holds the smoke account; the multipart step sends nothing on Windows (known defect 20; multipart is covered by `check:storage` and `check:intake`).
    - **No Supabase or SQL at runtime:** every suite passed with unreachable Supabase and Postgres addresses; no connection errors in the server log; the PGlite canary folder was not created.
    - **Server log scan after all runs:** 0 test emails, phone numbers, names, `pf:` paths, signed links, tokens or password hashes; the webhook probe logged its size only. The only `[api]` error line is the deliberate malformed-JSON request (400).
    - **Browser (admin panel):** a stale token redirected to sign-in; admin sign-in worked; the migrated home-loan lead showed its PAN document as a signed `/api/files/` link and the activity from the end-to-end run.
  - **Default mode** (PGlite copy, legacy storage): `check:e2e` 19 of 19; rerun once (19 of 19) after replacing literal test credentials in the script, which the secret scan had flagged.
  - **Run-order mistake (recorded for transparency):** the first Firebase-mode app run started before the migration step had loaded data, so sign-ins failed (401) on empty emulators. No code was changed; the emulators were restarted and the suites run in the correct order with the results above.
  - **Final checks:** original database 972 files, 0 differences; secret scan 0 hits (after the test-credential change).
- **Remaining risks (not fixed in Stage 11):**
  - **Production launch blockers:** see the security plan, section 13 (legacy public KYC copies, insecure default `legacy` storage mode, Firebase Storage needs the Blaze plan, rollback and cutover not built, real-project checks).
  - Legacy controllers return `error.message` on some 500 responses (internal detail, the caller's own values).
  - Password-attempt limit is per IP only (no per-account lockout) and counts successful sign-ins; it depends on `TRUST_PROXY`/Vercel headers being correct in production.
  - Customer tokens last 7 days and are not revoked when the password changes; signup has no rate limit.
  - Emulator results do not prove real-project rules deployment, indexes, IAM or quotas.
- **No real Firebase or Supabase access, no billing, no deployment, no commit, no push.** Branch `shivansh_dev`, HEAD `9f2bb93`.
- **Next proposed stage:** Stage 12, final local review and handover (separate approval).

## Codebase Analysis (Stage 4A, commit 9f2bb93)

### Files inspected

`README.md`, `setup.md`, `AGENTS.md`, `package.json`, `package-lock.json` (lockfileVersion, libc metadata), `.gitignore`, `.env.example`, `next.config.js`, `.vscode/mcp.json`, `pages/api/[...path].js`, `server/http.js`, `server/db.js`, `server/odm.js`, `server/storage.js`, `server/config/auth.config.js`, `server/routes/{index,admin.routes,user.routes,adminPanel.routes,calculator.route}.js`, `server/controllers/{admin,adminPanel,user,employee}.controller.js`, `server/middlewares/{staffAuth,uploads}.js`, `server/admin/leads.js`, `server/leads/{intake,backfill,rateLimit,events}.js`, `server/leads/notify/whatsapp.js`, all 47 files in `server/models/`, `scripts/{seed-areas.js,backfill-leads.js,check-intake.mjs,smoke-api.sh}`, `lib/{api,admin-api,use-user,lead-schema,forms}.js`, `components/forms/ApplicationForm.jsx`, `components/admin/AdminShell.jsx` (API calls), `pages/{sign-in,sign-up,add-product,property-detail}.js`, `pages/admin-panel/{index,dashboard,customers,properties,subscribers,team}.js`, `pages/admin-panel/leads/index.js`, `pages/admin-panel/leads/[type]/[id].js`, and the Next.js 16 guides listed above.

### 1. Next.js architecture

- Next.js 16.4.6, Pages Router, React 19.3.1, Tailwind 4. Turbopack is the default for `next dev` and `next build` in Next 16.
- `next dev` writes to `.next/dev`; a lock stops a second `next dev` or `next build` running in the same project at the same time.
- `next.config.js`: `turbopack.root`, `reactStrictMode`, `serverExternalPackages: ['@electric-sql/pglite', 'postgres']`, `images.loader: 'akamai'`, security headers (HSTS and `upgrade-insecure-requests` only on Vercel or with `FORCE_HTTPS=1`).
- `firebase-admin` is already on Next's built-in `serverExternalPackages` list (confirmed in `node_modules/next/dist/docs/02-pages/04-api-reference/04-config/01-next-config-js/serverExternalPackages.md`), so it will load through native `require`.
- Environment variables: only `NEXT_PUBLIC_*` are inlined into the browser bundle at build time; everything else is server-only. `serverRuntimeConfig`/`publicRuntimeConfig` were removed in Next 16 (not used here). Scripts outside Next load env with `@next/env` `loadEnvConfig` (already used by `scripts/seed-areas.js` and `scripts/backfill-leads.js`).

### 2. API routing

- One catch-all API route, `pages/api/[...path].js`, with `bodyParser: false` and `externalResolver: true`, hands every `/api/*` request to `server/http.js` `dispatch()`.
- `server/http.js` is a small Express-style router: path patterns with `:params`, JSON and urlencoded body parsing, `raw()` for the Cashfree webhook, `multipart(types).fields(spec)` (busboy) for uploads, chained middleware, and a 500 handler that hides internal errors.
- About 205 routes: 201 single-line registrations (84 GET, 62 POST, 41 PUT, 13 DELETE, 1 PATCH) plus 3 multi-line registrations in `user.routes.js` (`/api/kisanCreditLoanApplication`, `/api/updatekisanCreditLoanApplication/:id`, `/api/updateLoanAgainstPropertyDetail/:id`) and `POST /api/leads/:formKey` added by `server/leads/intake.js`.
- By file: `user.routes.js` 139+3, `admin.routes.js` 34, `adminPanel.routes.js` 16, `calculator.route.js` 11, `index.js` 1 (`/api/health`).

### 3. Existing database architecture

- `server/db.js`: if `DATABASE_URL` is set, uses `postgres` (postgres.js, `prepare: false` for the Supabase transaction pooler, `max: 5`); otherwise PGlite stored in `.data/pglite`. PGlite is refused when `NODE_ENV=production` unless `ALLOW_LOCAL_DB` is set.
- The client is a singleton on `globalThis.__probizDb` so it survives dev hot reloads.
- `ensureTable(table)` creates `(id text PRIMARY KEY, data jsonb, created_at timestamptz, updated_at timestamptz)` on first use; `ping()` runs `SELECT 1`.

### 4. Custom ODM (`server/odm.js`)

- Mongoose-compatible facade imported by all 47 models as `mongoose`.
- Schema compilation: `Schema(definition, options)` (callable with or without `new`), nested objects, arrays, `Schema.Types.{ObjectId, Mixed, String, Number, Boolean, Date}`, `Schema.ObjectId`.
- Casting: string (`trim`, `lowercase`, `uppercase`), number, boolean (`true/'true'/1/'1'/'yes'`), date, ObjectId (stored as string). Unknown keys are dropped (strict mode). Defaults applied on construction; arrays default to `[]`.
- Validation: `required` (bool, `[bool, message]` or function), `enum`, `match`, `min`, `max`; cast errors become `ValidationError`.
- Persistence: `save()` INSERTs new documents; updates replace the whole `data` JSONB (or merge it when the document was loaded with a projection). `created_at`/`updated_at` are database columns surfaced as `createdAt`/`updatedAt` only when the schema has `timestamps: true`.
- Unique fields: `checkUnique` runs a SELECT before writing (query-then-insert, not atomic).
- Queries: `Query` is a thenable builder (`sort`, `skip`, `limit`, `select`, `lean`, `populate` no-op). Filters are translated to JSONB SQL. Default order is `created_at ASC, id ASC`; sorting by `_id` maps to `created_at`.
- `updateMany`/`deleteMany` loop row by row; `update` reads one row, applies operators in memory, then saves.
- `saveTracker` (AsyncLocalStorage) records inserts during a request so the lead pipeline can find the per-form record a legacy controller saved.
- Table names come from `tableName(modelName)`: camelCase to snake_case, other characters to `_`, lower-case (see the table list in item 16).

### 5. PGlite local behaviour

- Used whenever `DATABASE_URL` is empty. Data lives in `.data/pglite` (ignored by Git). PGlite is single-process, which is why `seed:areas` and `backfill:leads` require stopping `next dev`.
- On this machine `.data/pglite` already exists (contents not inspected). `.env.local` does not exist. `.next/` exists from an earlier run.

### 6. Postgres / Supabase dependencies

- `postgres` npm package and `DATABASE_URL` (Supabase transaction pooler, port 6543).
- Supabase Storage through its REST API with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; bucket from `SUPABASE_STORAGE_BUCKET` (default `uploads`), documented as a **public** bucket.
- `@electric-sql/pglite` for local mode.

### 7. Direct SQL usage (outside the ODM)

| File | SQL |
|---|---|
| `server/db.js` | `CREATE TABLE IF NOT EXISTS` per model; `SELECT 1` |
| `server/odm.js` | All model CRUD, counts, unique checks |
| `server/leads/rateLimit.js` | `CREATE TABLE IF NOT EXISTS rate_limits`; atomic `INSERT ... ON CONFLICT DO UPDATE` fixed-window counter |
| `server/leads/backfill.js` | `UPDATE "lead" SET created_at = ...` to backdate imported leads |
| `server/routes/index.js` | `/api/health` calls `db.ping()` |

### 8. Existing storage implementation

- `server/storage.js` `uploadFile(buffer, { originalName, mimetype })`: object key `image/` or `video/` + `media-<timestamp>-<8 hex><ext>`. Note PDFs also go under `image/`.
- With Supabase configured: POST to `/storage/v1/object/<bucket>/<key>` (no upsert) and return the **public** URL `/storage/v1/object/public/<bucket>/<key>`.
- In production without Supabase: throws. In development: writes to `public/uploads/<key>` and returns `/uploads/<key>`, which Next serves publicly.
- No delete function: files are never removed when records or leads are deleted.
- `server/http.js` uploads each accepted file after the lead gate passes, sets `file.location`, and drops the buffer; controllers store `file.location` strings in `uploadedDocuments.*`, `propertyImage[]` or `propertyVideo`.

### 9. Existing authentication

- Customers: `POST /api/userSignUp`, `POST /api/userLogin` (bcrypt compare, JWT). Customer JWT stored in browser `localStorage` key `userData`.
- Staff: `POST /api/staffLogin` (one sign-in for admins and employees; admin wins on a shared email), legacy `POST /api/adminLogin` and `POST /api/employeeLogin`. Staff JWT stored in `localStorage` key `probiz:admin-token`.
- First admin: `POST /api/createAdmin` is open only while no admin exists (`requireAdminUnlessFirst`).

### 10. JWT behaviour

- `server/config/auth.config.js` throws at import time if `JWT_SECRET` is unset, so every route module needs it.
- Customer token payload `{ id }`, expiry 15552000 s (180 days). Staff token payload `{ id, role }`, expiry 7 days.
- `staffFromRequest` verifies the token, then loads the live admin/employee (`deleteFlag: false`) on every request, so removed accounts lose access immediately (one database read per staff request).
- Customer tokens have no `role`, so they never pass staff guards. The lead pipeline accepts a customer token only to link a lead (`customerId()` also checks the user still exists).

### 11. Password hashing

- `bcryptjs` (sync). Cost 8 for customer signup and customer password change; cost 10 for employees and for admins (`createAdmin` uses the default of 10). Hashes are stored in the `password` field and removed from API responses with destructuring or `select('-password')`.
- `confirmPassword` is passed to `User.create` but dropped by strict schema casting (not stored).

### 12. Admin permissions

- `server/routes/index.js` puts `requireAdmin` in front of every GET except the public reads (`/api/health`, property listing reads, area reads), every PUT/PATCH/DELETE except `PUT /api/changeUserPassword/:usersRegId`, and the admin-only creates (`/api/addInHouseProperty`, `/api/addRoleByAdmin`, `/api/addEmployee`, `/api/bulkAddAreas`). `/api/admin/*` routes use their own guards.
- Admin-only panel routes: `DELETE /api/admin/leads/:type/:id`, admins list/remove, employees list/add/remove, reset employee password.

### 13. Employee permissions

- `requireStaff` routes: `GET /api/admin/me`, `PUT /api/admin/me/password`, `GET /api/admin/config`, `GET /api/admin/overview`, `GET /api/admin/leads`, `GET/PATCH /api/admin/leads/:type/:id`.
- `canSee`: admins see all; employees see unassigned leads and their own. Employees cannot reassign; acting on an unassigned lead (claim, status, or note) claims it. Employees get 403 on everything behind `requireAdmin`.

### 14. Customer permissions

- Sign up, sign in, submit any lead form (token optional, links the lead), change password (`PUT /api/changeUserPassword/:id`, no token, needs the old password).
- No endpoint lets a customer view their own leads.
- `POST /api/addProperty` is not protected server-side; the website page requires sign-in, but the listing is not linked to the customer.

### 15. Models

47 model files; every one has `timestamps: true` except `Property InHouse`. Mixed fields: `Lead.source`, `Lead.consent`, `LeadEvent.actor`, `LeadEvent.data`, `CreditScore.reportRaw`, `CreditScore.reportPdfRaw`. ObjectId fields (stored as strings): `Property.area`, `ITRInformation.userId`, `MSMERegistration.userId`, `GumastaLicense.userId`. Only declared unique field: `Area.name`.

### 16. Current tables (one per model, plus `rate_limits`)

| Model file | Model name | Table | Fields | Required |
|---|---|---|---|---|
| admin.model.js | admin | admin | 4 | 3 |
| adminRole.model.js | adminRoles | admin_roles | 2 | 1 |
| area.model.js | Area | area | 6 | 1 (name unique) |
| automobile.model.js | Automobile Insurance | automobile_insurance | 6 | 5 |
| balanceTransfer.model.js | BalanceTransfer | balance_transfer | 26 | 0 |
| balanceTransferTopUp.model.js | BalanceTransferTopUp | balance_transfer_top_up | 27 | 0 |
| bloan.model.js | BusinessLoanApplication | business_loan_application | 19 | 4 |
| businessConsultation.model.js | BusinessConsultation | business_consultation | 4 | 3 |
| caService.model.js | CAService | caservice | 4 | 3 |
| carLoan.model.js | CarLoanApplication | car_loan_application | 30 | 5 |
| commercialPropertyMortagePurchase.js | CommercialPropertyMortagePurchase | commercial_property_mortage_purchase | 30 | 0 |
| commercialPropertyPurchase.js | CommercialPropertyPurchase | commercial_property_purchase | 30 | 0 |
| constructionLoan.model.js | ConstructionLoanApplication | construction_loan_application | 30 | 0 |
| contact.model.js | Contact | contact | 4 | 4 |
| creditScore.model.js | CreditScore | credit_score | 12 | 3 |
| creditcard.model.js | CreditCard | credit_card | 15 | 5 |
| digitalMarketing.model.js | DigitalMarketing | digital_marketing | 4 | 3 |
| dsaService.model.js | DSAService | dsaservice | 4 | 3 |
| eStamp.model.js | EStamp | estamp | 4 | 3 |
| education.model.js | EducationLoanApplication | education_loan_application | 28 | 0 |
| employee.model.js | Employee | employee | 7 | 6 |
| flatepurchase.model.js | FlatePurchaseLoanOffer | flate_purchase_loan_offer | 30 | 0 |
| gold.model.js | GoldLoan | gold_loan | 15 | 4 |
| governmentBusi.model.js | GovernmentBusiness | government_business | 4 | 3 |
| gumastaLicense.model.js | GumastaLicense | gumasta_license | 30 | 17 |
| healthInsurance.js | healthInsurance | health_insurance | 6 | 5 |
| homeloan.model.js | LoanOffer | loan_offer | 31 | 0 |
| homerenovation.model.js | HomeRenovationLoan | home_renovation_loan | 30 | 0 |
| inHouse.model.js | Property InHouse | property_in_house | 13 | 0 (no timestamps) |
| investment.model.js | Investment Plan | investment_plan | 6 | 5 |
| itrInformation.model.js | ITRInformation | itrinformation | 35 | 12 |
| kisanCreditCard.model.js | KisanCreditLoanApplication | kisan_credit_loan_application | 20 | 4 |
| lead.model.js | Lead | lead | 18 | 2 |
| leadEvent.model.js | LeadEvent | lead_event | 5 | 3 |
| leadMeta.model.js | LeadMeta | lead_meta | 6 | 2 |
| legalDoc.model.js | legalDocSchema | legal_doc_schema | 4 | 3 |
| loanagainstProperty.model.js | LoanagainstProperty | loanagainst_property | 30 | 0 |
| msmeRegistration.model.js | MSMERegistration | msmeregistration | 32 | 24 |
| newslatter.model.js | NewsLatters | news_latters | 1 | 1 |
| pLoan.module.js | PersonalLoan | personal_loan | 23 | 4 |
| plotPurchaseConstruction.model.js | PlotPurchaseConstructionLoanOffer | plot_purchase_construction_loan_offer | 30 | 0 |
| plotpurchase.model.js | PlotPurchaseLoanOffer | plot_purchase_loan_offer | 30 | 0 |
| pradhanmantri.model.js | PradhamMantriLoan | pradham_mantri_loan | 23 | 4 |
| projectFunding.model.js | ProjectFundingLoanApplication | project_funding_loan_application | 19 | 4 |
| property.model.js | Property | property | 23 | 0 |
| realState.model.js | RealStateService | real_state_service | 4 | 3 |
| user.model.js | User | user | 7 | 4 |

Field counts include nested fields (for example `uploadedDocuments.*`). Plus `rate_limits (key, window_start, count)` created by `server/leads/rateLimit.js`.

### 17. Lead intake

- `server/admin/leads.js` registers 37 lead types (20 loans, 3 cover, 9 services, 2 inbox, 3 archive). 34 have a legacy POST endpoint; 33 have a website form key (`lib/forms.js` defines 33 forms: 14 JSON-only, 19 multipart with file slots). All 19 multipart forms' file slots are accepted by their routes.
- `installLeadIntake` wraps every legacy endpoint and adds `POST /api/leads/:formKey`. The gate runs: honeypot `company_website` (fake 201), rejected-file check, rate limit, shared validation (`lib/lead-schema.js`), consent required for new-style submissions. Staff in-house entries skip the gate.
- The original controller runs with a captured response; `saveTracker` finds the per-form record it inserted; `upsertLead` creates or merges the `Lead` envelope; `emit` writes `LeadEvent` rows and runs listeners (WhatsApp alert on `lead.created`, off unless `WHATSAPP_*` is set).

### 18. Lead deduplication

- `dedupeKey = <type>:<last 10 digits of phone>`. `Lead.findOne({ dedupeKey, status: { $in: ['new','contacted','in_progress'] }, lastActivityAt: { $gte: now - 7 days } }).sort({ lastActivityAt: -1 })`.
- A match appends `refId` to `refIds`, increments `repeatCount`, refreshes name/email/amount/detail/consent and emits `lead.repeat`; otherwise a new Lead and `lead.created`.
- Not atomic: two concurrent submissions can both miss the match and create two envelopes.

### 19. Lead assignment

- Admin `PATCH /api/admin/leads/:type/:id` with `assignTo` (employee id, checked to exist and not be deleted) or empty (unassign). Events `lead.assigned` / `lead.unassigned`.
- Removing an employee in the panel (soft delete) returns their open leads to the pool with `lead.unassigned` events.

### 20. Employee lead claiming

- An employee acting on an unassigned lead sets `assignedTo` to themselves (`lead.assigned` with `claimed: true`).
- Read-modify-write with a full-document save: two employees can both "claim" the same lead; the last write wins and both get an assigned event.

### 21. Lead-event history

- `LeadEvent` is append-only (`leadId`, `type`, `at`, `actor`, `data`). The lead page loads all events for one lead (`LeadEvent.find({ leadId })`) and sorts them in memory, newest first.
- Lead deletion removes the per-form records, the events and the envelope.

### 22. Rate limiting

- `allow([{ key: lead:<ip>:<type>, limit 5, 600 s }, { key: lead:<ip>, limit 30, 86400 s }])` using an atomic Postgres upsert per key. Forwarded IP headers are trusted only on Vercel or with `TRUST_PROXY=1`.
- Old rows are never cleaned up.

### 23. Backfill behaviour

- `ensureBackfilled()` runs once per server process before the first staff lead read (`loadLeads`, `findLead`, `removeEmployee`).
- It loads every Lead and LeadMeta, then every record of all 37 lead-type tables, creates missing envelopes, backdates `created_at` with direct SQL, and recreates `lead.created` and note events.
- On serverless hosting every cold start repeats this full scan. `npm run backfill:leads` runs it by hand.

### 24. Upload categories

- `middleware.property`: PNG/JPG/JPEG/PDF + MP4, fields `propertyImage` (max 10) and `propertyVideo` (max 1). Public listing media.
- All other upload middlewares (19 loan and card forms): PNG/JPG/JPEG/PDF only. Private applicant documents.
- Limits: 5 MB per file, 30 files per request; wrong type or size is rejected with a 400 by the lead gate. Files sent under an undeclared field name are silently ignored.

### 25. Sensitive-document and sensitive-data categories

- Uploaded documents: Aadhaar front/back, PAN card, bank statements, salary slips, offer letters, income-tax returns, electricity bills/rent agreements, property papers, tax receipts and photos, business documents (Gumasta, MSME), loan account statements, lists of documents, foreclosure letters, car RC/insurance/quotation/photo, land records (khasra copy, pawti), education admission letters, marksheets and fee structures.
- Stored fields: Aadhaar number (MSME, Gumasta), PAN (ITR, MSME, Gumasta), bank account number and IFSC (ITR, MSME), dates of birth, income, CIBIL scores, credit report payloads (`CreditScore.reportRaw`), addresses and phone numbers, bcrypt hashes.

### 26. API routes

See item 2. Public: `/api/health`, property and area reads, all form submissions, signup/login, calculators, Cashfree stubs. Staff: `/api/admin/*`. Admin: everything else that reads customer data or changes records.

### 27. Existing scripts

| npm script | File | What it does |
|---|---|---|
| `dev` / `build` / `start` | Next.js | |
| `seed:areas` | `scripts/seed-areas.js` | De-duplicates ~1000 area names, then `Area.findOne` + `Area.create` for each |
| `backfill:leads` | `scripts/backfill-leads.js` | Runs `backfillLeads()` once |
| `check:intake` | `scripts/check-intake.mjs` | End-to-end lead intake checks against a running server (needs admin and customer logins, `TRUST_PROXY=1`) |
| (none) | `scripts/smoke-api.sh` | Bash + curl API smoke test (signup, login, calculator, multipart home loan, admin reads) |

No unit-test framework and no lint script exist.

### 28. Query features actually used by callers

| Feature | Where |
|---|---|
| Equality | Throughout (`deleteFlag`, `_id`, `type`, `assignedTo`, `leadId`, `admin_Email`, `user_Email`, `mobile_no`, `name`, `formType`, `status`, `userId`, `organisationType`, `designation`, `city`, `propertyType`) |
| `$in` | Lead dedupe (`status`) |
| `$gte` | Lead dedupe (`lastActivityAt`), dashboard counts (`createdAt`), property filter (`price`) |
| `$lte` | Dashboard counts (`createdAt`), property filter (`price`) |
| `$ne` | `updateArea` (`_id`) |
| `$or` | `employee.controller` `AddEmployee` (`email` or `employeeId`), `getAllAreas` search (`name`/`city`/`state`) |
| RegExp value | `getAllAreas` (`city`, `state`, search terms) |
| `$regex` with RegExp | Area lookup by exact name, case-insensitive (`AddProperty`, `UpdatePropertyById`); property filter `areaName` contains |
| `sort` | `{ createdAt: -1 }` (most list endpoints), `{ _id: -1 }` (in-house properties), `{ name: 1 }` (areas), `{ lastActivityAt: -1 }` (dedupe) |
| `skip` / `limit` | `getAllAreas` only |
| `select('-password')` | `getAllUsers` |
| `lean()` | Lead pipeline, staff auth, panel controller, some controllers |

Not used by any caller: `$eq`, `$gt`, `$lt`, `$nin`, `$exists`, `$and`, `$nor`, string `$options`, `populate`.

ODM methods actually called: `find`, `findOne`, `findById`, `countDocuments`, `create`, `new Model().save()`, `findByIdAndUpdate` (20 call sites, options `{ new: true }` and `runValidators: true`), `findOneAndUpdate` (1), `findByIdAndDelete` (11), `deleteMany` (1, lead events), `toObject` (9), implicit `toJSON` (via `res.json`).

Not called anywhere: `estimatedDocumentCount`, `exists`, `insertMany`, `updateOne`, `updateMany`, `findOneAndDelete`, static or instance `deleteOne`, `populate`, and direct `validate`/`validateSync` (only used inside `save`).

### 29. Update operators actually used

- `$set`: one call site (`changeUserPassword`).
- Direct field assignment: all 20 `findByIdAndUpdate` call sites, plus in-memory changes followed by `save()` (the most common pattern).
- Not used: `$unset`, `$inc`, `$push`, `$pull`.

### 30. Baseline build results

`npm run build`: pass (exit 0, 114 static pages, no warnings). See Stage 4B execution.

### 31. Baseline test results

`GET /api/health` pass; `scripts/smoke-api.sh` pass with one Windows-only script issue (multipart step); `npm run check:intake` pass, 86 of 86 checks (originally recorded as 91; corrected in Stage 6). See Stage 4B execution.

### 32. Existing defects (found by reading the code; not yet confirmed by tests)

1. `userSignUp` stores `user_Email` exactly as typed, but `userLogin` lower-cases the input, so a customer who signs up with capital letters cannot sign in. The duplicate check is also case-sensitive.
2. `createAdmin` checks for duplicates with the raw email but stores it lower-cased, so case variants bypass the check.
3. Uniqueness for customer email/mobile, admin email, employee email/employee ID, and `Area.name` is query-then-insert in both backends (race-prone).
4. `Area.name` uniqueness ignores `deleteFlag`, so a soft-deleted area name cannot be added again (`E11000` error in `bulkAddAreas`).
5. Employee claim and duplicate-lead merge are not atomic (items 18 and 20); saves overwrite the whole document, so concurrent edits can be lost.
6. `staffLogin`, `employeeLogin` and the panel's `addEmployee` load every admin/employee and filter in memory.
7. `GET /api/admin/leads`, `/api/admin/overview` and `/api/admin/employees` load every lead on each request; the admin shell calls `overview` on every page load and after every lead update; CSV export pages through, reloading all leads for each page.
8. `findLead` falls back to scanning every lead of a type to resolve old per-form ids.
9. Lead backfill scans all lead tables once per server process (every serverless cold start).
10. `getPropertyById` computes a transformed object but returns the untransformed document, unlike the other property endpoints.
11. `POST /api/addProperty` requires no token and does not link the listing to a customer, although the page says listings are linked to an account.
12. Regular expressions are built from unescaped user input (`getAllAreas` city/state/search, property `areaName`, area lookup in add/update property): invalid input causes errors and pathological patterns are possible.
13. Uploaded KYC and financial documents get public URLs (public Supabase bucket, or `public/uploads` locally). Anyone with the link can download them.
14. Files are never deleted when their records or leads are deleted.
15. Legacy `DELETE /api/deleteEmployee/:id` hard-deletes and leaves that employee's leads assigned to a missing account (the panel's remove does it correctly).
16. `Property InHouse` has no timestamps, so backfilled in-house leads get the backfill time as `createdAt`.
17. Several `userSignUp` validation responses send HTTP 400 with `status: 200` in the body.
18. `PUT /api/changeUserPassword/:usersRegId` needs no token (documented in README).
19. `node_modules` has two extraneous packages (`@emnapi/runtime`, `@img/sharp-wasm32`) left by an earlier npm 10.9.2 install; harmless.
20. `scripts/smoke-api.sh` uses `/tmp/smoke.pdf`, which Windows `curl.exe` cannot open under Git Bash, so its multipart step silently sends nothing on Windows (confirmed in Stage 4B).
21. `server/storage.js` puts PDFs under the `image/` prefix (confirmed in Stage 4B: `/uploads/image/media-....pdf`).

### 33. Firebase migration risks

1. Firestore has no regex or substring search: area lookups, property `areaName`, area search and the admin lead `q` search need a different approach (normalised fields, prefix search, or a bounded in-memory filter).
2. Collection-wide reads are billed per document: the current admin list, overview, employees, staff login and backfill patterns would burn the free daily read quota quickly.
3. Race-sensitive flows (claim, dedupe, rate limit, uniqueness) need Firestore transactions or reservation documents.
4. Default ordering by insertion time needs an internal timestamp on every document, including `Property InHouse`, which has no `createdAt`.
5. Firestore rejects `undefined`, stores Dates as Timestamps (must be converted back to `Date`), forbids directly nested arrays (not used by current schemas), and caps documents at 1 MiB (`CreditScore.reportRaw` could be large).
6. Composite indexes are needed for the dedupe query and lead list filters.
7. Counts must use aggregation queries.
8. Model names with spaces (`Investment Plan`, `Automobile Insurance`, `Property InHouse`) need the existing `tableName` mapping for collection names.
9. Batched writes and transactions are limited to 500 operations (migration, `deleteMany`).
10. Health check, backfill timestamp fix and rate limits are SQL today.
11. Private documents need authorised access; the lead detail page only treats `http(s)://...` or `/uploads/...` strings as files, so a new private-file URL format must still render as a file.
12. Vercel limits request bodies to 4.5 MB while the app allows 5 MB per file (existing limitation, unchanged by Firebase).
13. Tooling: the Firestore emulator needs Java, and Java is not installed on this machine (`java` not on PATH, `JAVA_HOME` unset). The Firebase CLI is also not installed. Both downloads go through the office network, where npm previously stalled on TLS.
14. npm 10.9.2 rewrites `package-lock.json` (drops `libc` metadata) on `npm install`; dependency additions must be checked so only intentional lockfile changes remain.

### 34. Components that can stay unchanged

All website pages and components, `lib/*` (forms, validation, API client), all 47 model files, route files and URL paths, the lead-type registry, `lead-schema` validation, calculators, `server/http.js` routing and body parsing, `server/leads/events.js`, WhatsApp notifications, JWT/bcrypt logic, `staffAuth` guards (by-id reads only).

### 35. Components that need refactoring for Firestore

- `server/odm.js`: split shared schema/casting/validation from persistence; add a Firestore adapter beside the existing Postgres one; transactional unique reservations.
- `server/db.js`: backend selection (`DATA_BACKEND`), Firebase Admin singleton, provider-neutral ping.
- `server/leads/rateLimit.js`, `server/leads/backfill.js` (migration marker, no SQL timestamp fix), `/api/health` in `server/routes/index.js`.
- `server/leads/intake.js` `upsertLead`: transactional dedupe.
- `server/controllers/adminPanel.controller.js`: indexed staff email lookup, paginated/indexed lead queries, count aggregation, atomic claim, `findLead` fallback.
- `server/controllers/admin.controller.js`: regex-based area and property queries.
- `server/storage.js`, `server/http.js`, `server/middlewares/uploads.js`: explicit public vs private uploads, Firebase Storage provider, delete support.
- `pages/admin-panel/leads/[type]/[id].js`: recognise the private-file URL format (small change, if needed).
- `scripts/*`: work against either backend; new migration script.

### 36. Differences between README, setup.md, AGENTS.md and the code

- README says "~35 website forms": the code has 33 website forms and 37 lead types.
- README describes the Supabase bucket as Public; that conflicts with keeping KYC documents private.
- The add-property page says listings are linked to an account; the API does not link them (defect 11).
- README's environment table matches `.env.example`; `ALLOW_LOCAL_DB` (used in `server/db.js`) is not documented.
- `setup.md` demo-account flow matches the current endpoints. `AGENTS.md` only carries the Next.js notice. Node requirement (20.9+) matches `package.json` `engines` and Next 16; this machine has Node v23.6.0.

### Environment readiness (presence checks only)

| Item | State |
|---|---|
| `node_modules` | Usable: `npm ls --depth=0` exit 0, all 22 declared dependencies present (plus 2 extraneous) |
| `package-lock.json` | lockfileVersion 3, matches HEAD |
| `.env.local` | Missing (ignored by `.gitignore` rule `**/.env.*`) |
| `.data/pglite` | Exists (ignored); contents not inspected |
| `public/uploads` | Missing (ignored) |
| `.next` | Exists (ignored) |
| Git Bash / curl | `C:\Program Files\Git\bin\bash.exe` and Git's `curl.exe` present; `bash` is not on PATH |
| Port 3000 | Free |
| Java | Not installed |

### Network and TLS findings (Node.js)

| Check | Result |
|---|---|
| `node --use-system-ca` | Not supported by Node v23.6.0 (`bad option`) |
| Node HTTPS to `fonts.googleapis.com` | `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` |
| Node HTTPS to `registry.npmjs.org` | `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` |
| npm registry | Corporate mirror `artifactory.lseg.com` (from the user `.npmrc`); `strict-ssl=true`; no `cafile`; no proxy |
| Node HTTPS to the npm mirror | Reachable (HTTP 401 without credentials, so TLS is fine; npm authenticates from `.npmrc`) |
| `NODE_EXTRA_CA_CERTS`, `NODE_TLS_REJECT_UNAUTHORIZED` | Neither set |

Impact:

- `pages/_app.js` uses `next/font/google` (`Inter`). Per `node_modules/next/dist/compiled/@next/font/dist/google/loader.js`, `next dev` logs the download failure and falls back to a system font, but `next build` fails with ``Failed to fetch `Inter` from Google Fonts``. The baseline build is expected to fail on this network unless Node trusts the corporate root certificate.
- The same applies later to anything Node downloads from public Google endpoints (for example the Firebase emulator JARs).
- Secure fix (not applied): export the trusted root certificates from the Windows certificate store to a PEM file outside the repository and point `NODE_EXTRA_CA_CERTS` at it for the commands that need it. Certificate verification stays on.

## Architecture

Completed in Stage 5 (design only; nothing implemented):

| Topic | Document |
|---|---|
| Existing application and persistence architecture | [firebase-architecture.md](firebase-architecture.md) section 3; Codebase Analysis items 1 to 16 |
| Proposed Firebase architecture, adapter and query design | [firebase-architecture.md](firebase-architecture.md) sections 4 to 9 |
| Authentication model (unchanged; Firebase Authentication out of scope) | [firebase-architecture.md](firebase-architecture.md) section 1; [firebase-security-plan.md](firebase-security-plan.md) section 2 |
| Firestore data model, collections, indexes | [firebase-data-model.md](firebase-data-model.md) |
| Storage model | [firebase-architecture.md](firebase-architecture.md) section 10; [firebase-security-plan.md](firebase-security-plan.md) sections 4 to 7 |
| Security model | [firebase-security-plan.md](firebase-security-plan.md) |
| Migration strategy | [firebase-migration-plan.md](firebase-migration-plan.md) |
| Testing strategy | [firebase-architecture.md](firebase-architecture.md) section 12; [firebase-migration-plan.md](firebase-migration-plan.md) section 9 |
| Rollback strategy | [firebase-migration-plan.md](firebase-migration-plan.md) section 11 |
| Free-first (₹0/month) strategy, hosting and storage options | [FIREBASE_FREE_TIER_STRATEGY.md](FIREBASE_FREE_TIER_STRATEGY.md) |

## Final Local Handover

Stage 12 (2026-11-15). Local implementation complete and verified on the Firebase emulators and isolated PGlite copies. **Not production-ready** until the blockers below are resolved and approved.

- Final local branch: `shivansh_dev`
- Starting commit: `9f2bb9390a77e8432c14d45958576f08f2dc3c95` (equal to `origin/main`)
- Commit status: committed on `shivansh_dev` after approval (2026-11-15, "yes go ahead"); one commit with the 80 files listed below (hash: `git log -1 shivansh_dev`)
- Push status: pushed to `origin/shivansh_dev` (new remote branch); `main` untouched

### Stage 12 review and verification

- **Change review:** all 80 changed or new files are recorded in this log (automated cross-check: 0 unrecorded). No stray files; `.data/`, `.env.local`, `.next/`, `firestore-debug.log` and `node_modules/` are git-ignored; all test databases, reports and logs live outside the repository (`%USERPROFILE%\probiz-baseline`).
- **Consistency fixes:** the decision rows D4, D10, D11 and D12 still said "Pending" although Stage 9 applied them as recommended; updated. `.env.example` completed (`ALLOW_LOCAL_DB`, `ALLOW_FIREBASE_EMULATORS`, `LEGACY_SUPABASE_URL`, `LEGACY_SUPABASE_BUCKET`; outdated "not used yet" comment).
- **Test credentials:** the new test scripts (`check-e2e.mjs`, `check-storage.mjs`, `check-migration.js` app phase) no longer contain the local demo passwords; they now require `ADMIN_PASSWORD` / `CUSTOMER_PASSWORD` and stop with a message if missing (verified). The same demo credentials already exist in `origin/main` (`setup.md`, `scripts/check-intake.mjs`, `scripts/smoke-api.sh`); those files were not changed.
- **`check:e2e` in Firebase emulator mode (required rerun): 19 of 19.** Data loaded with `migrate:firestore --apply` (773 records, 0 conflicts) from a fresh isolated copy; app with unreachable Supabase and Postgres stand-ins; server log afterwards: no test emails, tokens, hashes, `pf:` paths or connection errors; PGlite canary not created.
- **Reused results (not repeated):** Stage 10 migration 26 + 4; Stage 11 emulator suites (adapter 122, transactions 32, site settings 27, emulator foundation), intake 86, storage 20 (link expiry included), e2e 19 (both modes), smoke, build (115 pages, 0 warnings). No application code changed in Stage 12, so the Stage 11 build stands.
- **Commit-safety scan** of the files that would be committed: 0 private keys, service-account keys, API keys, tokens, bcrypt hashes or database URLs with passwords. Emails and numbers found are synthetic test values (`example.com`, `probiz.test`, `9000000000`-style) or the company's public contact details already published in `origin/main` (`lib/site.js`, `content/company.json`). This log contains local Windows paths (user folder name), no secrets.
- **Final checks:** original database 972 files, 0 differences; secret scan 0 hits.

### File inventory (safe to commit after review)

| Area | Files |
|---|---|
| Data layer (Stages 7–8) | `server/data/{index,postgres,firestore,tx,values}.js`, `server/odm.js`, `server/db.js`, `server/firebase/admin.js` |
| Leads and transactions (8) | `server/leads/{intake,backfill,rateLimit}.js`, `server/controllers/{admin,adminPanel,employee,user}.controller.js`, `server/routes/index.js` |
| Site settings (8.5) | `server/models/siteSettings.model.js`, `server/controllers/siteSettings.controller.js`, `server/routes/siteSettings.routes.js`, `content/site-settings.json`, `lib/site-settings.js`, `lib/site.js`, `lib/admin-api.js`, `pages/admin-panel/settings.js`, `pages/{_app,contact,Careers,forgot-password,property-detail}.js`, `components/site/{SiteFooter,MobileNav,WhatsAppButton}.jsx`, `components/admin/{AdminShell,CommandPalette,ui}.jsx`, `components/assistant/{Assistant.jsx,brain.js}`, `components/blocks/ApplySection.jsx`, `components/forms/ApplicationForm.jsx`, `components/templates/{ProductPage,ServicePage}.jsx` |
| File storage (9) | `server/storage.js`, `server/storage/{firebase,sniff}.js`, `server/routes/files.routes.js`, `server/http.js`, `server/middlewares/uploads.js`, `pages/admin-panel/leads/[type]/[id].js` |
| Migration (10) | `server/migrate/{guards,source,transform,data,files,verify,manifest,run}.js`, `scripts/migrate-firestore.js` |
| Firebase config (6) | `firebase.json`, `.firebaserc` (demo project only), `firestore.rules`, `storage.rules`, `firestore.indexes.json` |
| Tests | `scripts/check-{firebase-emulator,firestore-adapter,transactions,site-settings,migration}.js`, `scripts/check-{storage,e2e}.mjs`, `scripts/seed-site-settings.js` |
| Project | `package.json`, `package-lock.json` (firebase-admin; 28 `libc` entries kept), `.gitignore`, `.env.example` |
| Docs | `docs/FIREBASE_IMPLEMENTATION_LOG.md`, `docs/firebase-{architecture,data-model,migration-plan,security-plan}.md`, `docs/FIREBASE_FREE_TIER_STRATEGY.md` |

Never commit: `.env.local`, `.data/`, `.next/`, `*.log`, service-account JSON files, migration reports or checkpoints, anything from `%USERPROFILE%\probiz-baseline`.

### Production launch blockers (must be resolved and approved)

1. **Legacy public KYC files:** run the file migration, verify, then secure or delete each original in the retirement report after separate approval. A Supabase public bucket cannot hide single objects, so "secure" means moving them to a private bucket or deleting them; never make the whole bucket private (property images).
2. **Insecure default storage mode:** `FILE_STORAGE_BACKEND` defaults to `legacy` (public KYC URLs). Production must run with `firebase`.
3. **Real-project gates are intentionally closed:** `server/data/index.js` and `server/storage.js` refuse Firestore and Firebase Storage without the emulators, and the migration CLI refuses real projects and real legacy sources. Opening them is a code change for Stage 13 (explicit opt-in, approval).
4. **Blaze billing decision:** a real Cloud Storage for Firebase bucket needs the Blaze plan; this conflicts with the free-first rule (F2) and needs your decision (no-cost usage in US regions, budget alerts do not cap spend).
5. **Rollback and cutover:** reverse migration (`to-postgres`), `--since` catch-up and `--confirm-project` are not built; a tested rollback and a rehearsed cutover are mandatory.
6. **Demo accounts:** the demo admin and customer passwords are published in `setup.md`. Confirm no production account uses them (cannot be checked locally) and that production has at least one real admin before switching (an empty admin collection lets `POST /api/createAdmin` create an admin without a token; the migration `verify` checks this).
7. **Hosting:** Vercel Hobby is non-commercial only (F5 decision pending).
8. **Real-project verification:** rules and index deployment, IAM, region, quotas and Storage behaviour are proven on emulators only.

### Other remaining risks (fix before or soon after launch)

- Some legacy controllers return `error.message` on 500 responses.
- Password-attempt limit is per IP only, counts successful sign-ins, and relies on correct proxy headers (`TRUST_PROXY` or Vercel).
- Customer tokens last 7 days and survive a password change; signup has no rate limit.
- Decisions still pending: D1, D2, D3, D5, D7, D13 and F1–F6.
- `scripts/smoke-api.sh` multipart step does not work on Windows (defect 20).

### Deployment prerequisites (Stage 13 and later, each needs approval)

1. Decide F5 (host), Blaze (D13 region for Storage; D3 `asia-south1` proposed for Firestore) and the remaining pending decisions.
2. Create the Firebase project (non-`demo-` ID), Firestore (Standard edition, default database), and the Storage bucket.
3. Deploy `firestore.rules`, `storage.rules` and `firestore.indexes.json` with the pinned `firebase-tools@15.36.0`; wait until all indexes are built.
4. Create a dedicated service account with least privilege (Firestore user, Storage object admin on the one bucket); store its key only in the host's secret settings.
5. Implement and review the real-project opt-in (blocker 3) and the rollback tooling (blocker 5); run all suites again on the emulators.
6. Deploy to a Preview/staging environment first and run the smoke, intake, storage and e2e checks against a staging project, never production data.

### Environment-variable checklist (production, Firebase mode)

| Variable | Production value |
|---|---|
| `JWT_SECRET` | New long random value (`openssl rand -hex 32`); also derives the signed-link key; changing it logs everyone out and invalidates file links |
| `DATA_BACKEND` | `firestore` (after cutover; `postgres` until then and for rollback) |
| `FILE_STORAGE_BACKEND` | `firebase` (never `legacy` in production) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET` | Real project and bucket |
| `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Service-account credentials (secret; key newlines as `\n`) |
| `PRIVATE_FILE_URL_TTL_SECONDS` | Optional (default 600) |
| `TRUST_PROXY` | Empty on Vercel (handled); `1` only behind a proxy that sets `X-Forwarded-For` |
| `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | Keep for the rollback window and the legacy file migration only; not needed at runtime in Firebase mode |
| `SITE_URL`, `WHATSAPP_*`, `NEXT_PUBLIC_CASHFREE_*`, `NEXT_PUBLIC_API_URL` | Unchanged from today |
| `FIRESTORE_SCAN_LIMIT`, `LEAD_BACKFILL_AUTO` | Empty (defaults) |
| **Must not be set:** `FIRESTORE_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, `ALLOW_LOCAL_DB`, `ALLOW_FIREBASE_EMULATORS`, `PGLITE_DIR`, `GCLOUD_PROJECT` with a `demo-` ID | |
| Migration run only: `LEGACY_SUPABASE_URL`, `LEGACY_SUPABASE_BUCKET`, `PGLITE_DIR`/`DATABASE_URL` source | Set on the operator's machine for the run, not in the host |

### Migration checklist (production, after approval)

1. Rollback tooling built and rehearsed on the emulators (blocker 5); staging rehearsal of the full cutover.
2. Note `T0`; run `migrate:firestore` dry run against production Postgres; review duplicates, conflicts, invalid records and the write estimate (`--max-writes`, free quota 20,000/day).
3. `--apply` (resume on following days if the budget stops it); then `migrate:verify` (counts, hashes, unique values, references, active admin); run `backfill:leads` in Firestore mode if `applicationsWithoutLead` is not empty.
4. `migrate:files` dry run, then `--apply`; review refused and failed items; keep the retirement report private.
5. Switch `DATA_BACKEND=firestore` and `FILE_STORAGE_BACKEND=firebase`, redeploy (`T1`); catch-up copy since `T0`; post-checks (health, staff sign-in, lead list, one document link, one public property page).
6. Legacy KYC protection: after verification and approval, secure or delete each original in the retirement report; re-check that the old URLs no longer serve the files.
7. Keep Postgres and the legacy bucket untouched for at least 30 days; watch Firestore usage and errors daily in the first week.

### Rollback verification (required before cutover)

1. Build `--direction=to-postgres` and `--since` (reviewed and approved).
2. Emulator test: migrate to Firestore, write new records in Firebase mode, copy back since `T1` into a fresh PGlite copy; counts, hashes and sign-ins match.
3. Staging rehearsal: switch back `DATA_BACKEND`/`FILE_STORAGE_BACKEND`, redeploy, verify, and record the time taken.

### Recommended next steps

1. ~~Review the change set and approve a commit and push of the files above~~ (approved and done 2026-11-15).
2. Decide Blaze, hosting (F5), regions and the other pending decisions.
3. Approve Stage 13 (Firebase cloud setup) including the real-project opt-in code and rollback tooling, then a staging rehearsal before any production migration.
