# Probiz Finance: Firebase Security Plan

Stage 5 design document (not yet implemented). Companion to [firebase-architecture.md](firebase-architecture.md) and [firebase-data-model.md](firebase-data-model.md). Facts marked "verified" were checked against official sources or this repository on 2026-11-14.

## 1. Principles

1. **Server-only data access.** All Firestore and Cloud Storage access goes through the Firebase Admin SDK inside Next.js API routes. No Firebase client SDK and no Firebase configuration in the browser.
2. **Deny all direct client access.** Firestore and Storage rules deny everything. Server libraries bypass rules (verified: "The server client libraries bypass all Firestore Security Rules", Google Cloud Firestore docs), so rules are a second line of defence against misconfiguration, not the main control.
3. **Existing authorisation stays the main control**, unchanged in behaviour (section 2).
4. **Least privilege** for the production service account (section 8).
5. **No secrets or personal data in the repository, logs, documents or error responses.**
6. **Private by default for uploads.** Only property listing media is public.

## 2. Existing access model (verified in code, unchanged)

| Layer | Rule | Source |
|---|---|---|
| Customer token | JWT `{ id }`, 180 days, from `server/config/auth.config.js` `JWT_SECRET` | user controller |
| Staff token | JWT `{ id, role }`, 7 days; `requireStaff`, `requireAdmin`, `requireAdminUnlessFirst` load the admin or employee record on each request | `server/middlewares/staffAuth.js` |
| Global guard | Every legacy `GET` except six public reads, every `PUT`/`PATCH`/`DELETE` except `changeUserPassword`, and four admin-only `POST` routes require an admin token | `server/routes/index.js` |
| Admin panel | `/api/admin/*` routes guarded per route (`requireStaff` or `requireAdmin`) | `server/routes/adminPanel.routes.js` |
| Lead visibility | `canSee`: admin, unassigned lead, or lead assigned to the requesting employee | `server/controllers/adminPanel.controller.js` |
| Lead forms | Honeypot, IP rate limits (5 per product per 10 minutes, 30 per day), schema validation, consent | `server/leads/intake.js` |

Firebase Authentication is not used (architecture section 1).

## 3. Firestore rules (`firestore.rules`, Stage 6)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- Deployed to the production project before any data is written (cloud setup, later prompt).
- Stage 11 test: an unauthenticated REST request to the emulator must be denied, while the Admin SDK still works.

## 4. Storage rules (`storage.rules`, Stage 6)

Stage 9 update: the user chose **Cloud Storage for Firebase** as the document provider (Blaze to be approved later; emulator only now). The deny-all rules below are the production rules: browsers never read or write storage directly; the server uses the Admin SDK, and private files reach staff only through the signed `/api/files` route (section 6).

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

- **Private documents:** reachable only through short-lived links issued by the server (section 6).
- **Public property media:** reachable through permanent download-token URLs (`https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?alt=media&token=<token>`).
  - **Verified** from the Admin SDK source: `getDownloadURL()` builds this URL and fails if the object has no download token. The upload code must therefore set a token for public media only.
  - **Not verified this session** (firebase.google.com blocked): that token URLs work while rules deny all reads. Stage 9 tests this on the emulator. The fallback is a bucket-level public-read setting for the `public/` prefix in a separate bucket, decided at cloud setup.
- Private objects never receive a download token.
- Stage 6 emulator result: a download-token URL returned HTTP 200 while rules denied all reads, and an anonymous request without a token returned 403. Production behaviour is still unverified; this only matters if Firebase Storage (Blaze) is ever approved.

## 5. Upload validation

### 5.1 Today (verified in `server/http.js` and `server/middlewares/uploads.js`)

- **Request limits:** Busboy allows 5 MB per file and 30 files per request, with a per-field `maxCount`.
- **Type check:**
  - The MIME allowlist is png, jpg, jpeg and pdf. Property uploads also allow mp4.
  - The check uses the type the browser declares, not the file content.
  - Files that are too large or of the wrong type are skipped and listed in `req.rejectedFiles`.
- **Upload timing:** files are uploaded after the lead gate but before the controller runs. If the controller then fails, the files stay behind as orphans.
- **Naming:** objects are named `image/media-<timestamp>-<8 hex><ext>` or `video/...`. The extension comes from the client file name, so PDFs land under `image/`.

### 5.2 Planned (Stage 9)

Status (Stage 9): implemented.

- **Content check, extension from content, generated paths, sanitised original name, orphan deletion and the D12 rate limit:** as below.
- **Size and count limits:** unchanged.
- **Direct-to-storage uploads (F3):** not implemented; uploads still pass through the server (5 MB per file).
- **Path traversal:** blocked by the strict reference patterns. Busboy also keeps only the base file name.

| Control | Design |
|---|---|
| Size and count | Unchanged (5 MB, 30 files, per-field limits) |
| Content check | Magic bytes must match the declared type. Allowed signatures: PNG (`89 50 4E 47 0D 0A 1A 0A`), JPEG (`FF D8 FF`), PDF (`%PDF-`) and MP4 (`ftyp` at byte 4). Anything else is rejected through the existing "type" rejection path |
| Extension and content type | Taken from the detected type (`.png`, `.jpg`, `.pdf`, `.mp4`), never from the client file name |
| Object path | Generated by the server only: `public/property/YYYY/MM/<uuid>.<ext>` or `private/documents/YYYY/MM/<uuid>.<ext>` |
| Original file name | Kept only in object metadata. It is sanitised: characters outside `A-Za-z0-9._-` are replaced, and it is cut to 100 characters |
| Path traversal | References are parsed with a strict pattern (`^pf:private/documents/\d{4}/\d{2}/[0-9a-f-]{36}\.(png\|jpg\|pdf)$`). The local driver resolves paths under one fixed root and rejects anything outside it |
| Orphans | Files uploaded for a request are deleted if the controller responds with an error |
| Malware scanning | Not available without paid services. This is an accepted risk, documented for the business. Files are served from the storage domain (or with `nosniff` locally), never run by the server |
| Public listing form | `POST /api/addProperty` is public by design (the "add property" page). Decision D12: apply the existing IP rate limiter to it, so anonymous users cannot fill the storage quota |
| Upload path (F3) | Browsers upload each file directly to storage with a server-issued, single-use signed upload URL that is valid for minutes and scoped to one generated object path. The server then checks the stored object (magic bytes, size) and deletes it if invalid. This avoids host request-body limits (Vercel: 4.5 MB, verified) without making anything public |

## 6. Private file access

Status (Stage 9): implemented with Firebase Storage on the emulator. Private files are always streamed through the signed `/api/files/<payload>.<signature>.<ext>` route described below, in both the emulator and (later) production; V4 signed URLs are not used.

**Emulator vs real Firebase Storage (to verify at cloud setup):**

| Topic | Emulator (tested) | Real Firebase Storage |
|---|---|---|
| Rules | Deny-all enforced: anonymous read of a private object returned 403 | Same rules file; expected the same |
| Download-token URLs (public property media) | Served (200) while rules deny all reads | Expected to work (token URLs bypass rules), not verified |
| Admin SDK access | No credentials; `demo-` project | Service account (`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`) or default credentials; least-privilege role on the bucket |
| URLs | `http://127.0.0.1:9199/v0/b/...` | `https://firebasestorage.googleapis.com/v0/b/...` (chosen automatically) |
| Encryption at rest, durability, region | Not applicable (in memory) | Google-managed encryption; region chosen at bucket creation (D13; cannot be changed) |
| Limits and cost | None | Blaze billing per GB stored, downloaded and per operation; budget alerts recommended |
| Response size through the host | Unlimited locally | Streaming 5 MB files through `/api/files` depends on the host's response limit (for example Vercel functions); switch to V4 signed URLs there if needed |

- **Stored value:** private uploads are saved in their existing record fields as `pf:<object path>`, never as a URL.
- **Main access path:** `GET /api/admin/leads/:type/:id` checks `requireStaff`, then `canSee`. Only then does it replace each `pf:` value with a short-lived link.
  - The link lifetime comes from `PRIVATE_FILE_URL_TTL_SECONDS`: default 600, allowed range 60 to 3600.
  - The response is otherwise unchanged and is sent with `Cache-Control: no-store`.
- **Link types:**
  - **Firebase backend (paid fallback only):** V4 signed URL (`action: read`). V4 signed URLs last at most 7 days (verified). With a service-account key, signing happens locally.
  - **Supabase (default production provider, F2; works with either database):** a private bucket plus the Supabase sign endpoint. Public property media stays in the current public bucket.
  - **Backblaze B2 (alternative, F2):** a private bucket with S3-compatible presigned URLs.
  - **Local and emulator:** `GET /api/files/<token>.<ext>`.
    - The token holds the base64url form of `{ path, exp }` plus an HMAC-SHA256 signature. The HMAC key is derived from `JWT_SECRET` with HKDF (info `probiz-file-links-v1`), and signatures are compared in constant time.
    - Invalid or expired tokens return 404.
    - Responses use the headers `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`, and an inline disposition with a generic file name.
    - The route is turned off unless `FILE_STORAGE_BACKEND=local`.
- **Legacy admin-only per-form endpoints** (`GET /api/getHomeLoan` and others, not used by the current frontend): decision D11 is to return `pf:` values unchanged rather than sign links in about 30 endpoints. Admins open documents through the lead page.
- **Logging:** links and tokens are never logged. Only object paths may be logged, and only on errors.
- **Existing documents:** KYC documents uploaded before Stage 9 are still at public URLs (defect 13). Stage 10 built `npm run migrate:files` (emulator-tested): it copies each one to private storage, verifies SHA-256 and size, and only then switches the record to the `pf:` reference. It never deletes or hides the originals; the retirement report lists the verified ones. **Before production launch** each listed public copy must be secured or deleted, individually and after separate approval. The whole legacy bucket must not be made private, because it also serves public property images. Until then, the originals stay reachable by anyone who has the URL.

## 7. Deletion and retention

Status (Stage 10): lead and listing deletion remove the files created by the active provider. Files from before Stage 9 are preserved (not deleted); `migrate:files` copies them privately and the retirement report lists the verified originals for a separately approved retirement step. The orphan report is not built yet.

- **Lead deletion** (admin only) removes:
  - the lead and its events
  - every application document in `refIds`
  - their uploaded files: `pf:` references plus legacy URLs that point to this application's storage
  
  File deletion is best effort: failures are logged with the path only and do not change the response.
- **Property deletion** removes the listing's media.
- **Optional orphan report** (not built; proposed for a later stage): would list stored objects that no record references.
- **Migration reports** (Stage 10) hold counts, record IDs, field names, masked unique values (`p***@e***.com`, `******1234`), hashes and object keys only; never file contents, password hashes, emails, phone numbers or credentials. They are written under `.data/` (git-ignored) or the given `--report-dir`. The retirement report's object keys still locate the public legacy copies, so it must be kept private until they are retired.
- **Retention periods** are a business decision (data model, section 9).

## 8. Credentials, secrets and IAM

### 8.1 Environment variables

| Variable | Where | Notes |
|---|---|---|
| `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET` | Server | Not secret, but kept server-side |
| `FIREBASE_CLIENT_EMAIL` | Server | Service-account identity |
| `FIREBASE_PRIVATE_KEY` | Server, secret | Vercel stores `\n` as literal characters; the Admin initialiser converts them |
| `JWT_SECRET`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, WhatsApp token | Server, secret | Existing |
| `FIRESTORE_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, `GCLOUD_PROJECT` | Local only | Emulator; project must start with `demo-` |

- No variable gets the `NEXT_PUBLIC_` prefix. Next.js inlines only `NEXT_PUBLIC_` variables into browser bundles; others stay in the Node.js environment (verified in `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`).
- `.env.example` gets placeholders only, with no values.
- The Admin initialiser refuses a `demo-` project outside emulator mode, refuses emulator mode in production unless explicitly allowed, and never logs credential values.

### 8.2 Repository protection (Stage 6 `.gitignore` additions)

Already ignored (verified): `.env*` (except `.env.example`), `**/*.key`, `**/*.pem`, `**/*.log`, `.data/`, `public/uploads/`.

To add:

- service-account files: `**/*service-account*.json`, `**/*serviceAccount*.json`, `**/*-firebase-adminsdk-*.json`
- the Firebase CLI cache: `.firebase/`
- `.runtimeconfig.json`

Emulator exports go under `.data/firebase-emulator/`, which `.data/` already covers.

### 8.3 Secret scan (Stage 11 and before handover)

The scan looks for these patterns and reports only file and line, never the matched value:

- private-key headers
- the quoted private-key field name used in service-account JSON files
- Google API keys (`AIza...`)
- JWT-shaped strings
- connection strings with passwords
- Supabase secret keys

### 8.4 IAM for production (cloud setup, later prompt)

- Use a dedicated service account for the app with `roles/datastore.user`, described as "read/write access to data … intended for application developers and service accounts" (verified).
- Grant object read/write on the app bucket only, not project-wide storage roles.
- Do not run the app with Owner or Editor credentials.
- Rotate the key on a schedule and immediately if exposed. Disable old keys.
- Keep projects separate: `demo-probiz-finance` (emulator only, needs no credentials), production, and optionally staging.

## 9. Existing defects addressed by the migration stages

Defect numbers refer to the Stage 4A analysis in [FIREBASE_IMPLEMENTATION_LOG.md](FIREBASE_IMPLEMENTATION_LOG.md).

| # | Defect | Stage | Fix |
|---|---|---|---|
| 1 | Signup stores email as typed; login lowercases | 8 | New signups stored lower-case; case-insensitive reservation (D2). Existing mixed-case accounts are reported by the migration, which does not change them silently |
| 2 | `createAdmin` duplicate check case-sensitive | 8 | Case-insensitive reservation |
| 3 | Query-then-insert uniqueness races | 8 | Transactional reservations (data model, section 4) |
| 4 | `Area.name` uniqueness ignores `deleteFlag` | 8 | Kept as schema intent (unique across all records), now enforced |
| 5 | Claim and dedupe not atomic | 8 | Transactions in both backends (D6) |
| 6 to 9 | Full-collection reads | 8 | Indexed queries, counts, cache, backfill marker |
| 12 | Regular expressions built from raw user input (ReDoS risk) | 8 | Escape user input before building regular expressions |
| 13 | KYC documents have public URLs | 9 | Private references and signed links |
| 14 | Files never deleted | 9 | Deletion with lead and property |
| 15 | Legacy `deleteEmployee` hard-deletes | 8 | Kept (admin only); releases reservations |
| 16 | In-house records have no timestamps | 7 | Internal timestamps |
| 21 | PDFs stored under `image/` | 9 | New path scheme |
| 22 | Legacy application controllers log whole applications and uploaded-file details (`Request files:`, `Loan Data:`), and the Cashfree webhook logs its raw payload | 11 | Debug logs removed (21 lines); the webhook logs its size only |
| 23 | Logged validation and cast errors contain the submitted values | 11 | Logs show field paths only (`util.inspect.custom`); API messages unchanged |
| 24 | Legacy employee endpoints (`addEmployee`, `updateEmployee`, `getAllEmployee`, `deleteEmployee`) return bcrypt hashes | 11 | Hashes removed from responses |
| 25 | No limit on password attempts (sign-in and password change) | 11 | Per-IP limit: 20 per 10 minutes, 200 per day (429) |

Recorded but out of scope (behaviour changes need separate approval):

- **#10:** `getPropertyById` returns an untransformed document.
- **#11:** `addProperty` needs no authentication. It is a public form; D12 adds rate limiting only.
- **#17:** signup returns an HTTP 400 status with `status: 200` in the body.
- **#18:** `changeUserPassword` needs no token but checks the old password. Stage 11 added the per-IP password-attempt limit (defect 25); a per-account limit is still open.
- **#19:** extraneous packages.
- **#20:** the smoke-script path on Windows.

## 10. Cost and abuse protection

These are availability risks: when the free tier runs out, the database stops answering.

| Item | Fact | Control |
|---|---|---|
| Firestore free tier | 50,000 reads, 20,000 writes, 20,000 deletes per day; 1 GiB stored; resets at midnight Pacific time, 12:30 or 13:30 IST (verified) | Indexed queries, counts, caches (D1, D7), catalogue snapshot (F1), bounded fallbacks, backfill marker |
| No billing | TTL, backups and PITR need billing (verified). Operations beyond the free quota are expected to fail until the daily reset (not stated on the pages checked; confirm at cloud setup) | In-code cleanup for rate limits and locks; health check stays one read |
| Budgets | Alerts-only budgets do not cap spending (verified); spend-cap budgets exist for some services | If billing is ever enabled: alerts at 50/90/100% and a review of spend-cap support |
| Cloud Storage for Firebase | Requires Blaze (user-confirmed); its free 5 GB applies only in US regions (verified) | Not used in production (free-first). Documents use a free private bucket (F2); retention policy (F4) keeps them within the free allowance |
| Hosting terms | Vercel Hobby allows only personal or non-commercial use (verified) | Host decision F5; never rely on a plan whose terms exclude this business |
| Public uploads | Up to 30 files of 5 MB per request | D12 rate limit; content checks |
| Lead forms | Existing honeypot and rate limits | Moved to Firestore transactions (no raw IPs stored) |

## 11. Monitoring

- **Logs:** server logs record the backend name, request failures and quota errors (`RESOURCE_EXHAUSTED`). They never include record contents, tokens or links. Verified in Stage 11 (defects 22 and 23): after the full test run the server log contained no test emails, phone numbers, names, `pf:` paths, signed links, tokens or password hashes. Error messages returned to API callers can still contain the caller's own submitted values.
- **Health:** `/api/health` stays as it is (D5).
- **Production usage:** after cloud setup, the usage dashboards in the Firebase and Google Cloud consoles are reviewed weekly during the first month.

## 12. Decisions requested in this document

| ID | Decision | Recommendation |
|---|---|---|
| D10 | Public property media uses download-token URLs (verified mechanism; behaviour with deny-all rules checked in Stage 9) | Yes |
| D11 | Legacy admin-only per-form endpoints return `pf:` references (not signed links) | Yes (endpoints unused by the frontend) |
| D12 | Apply the existing IP rate limiter to the public `addProperty` upload | Yes |
| D13 | Storage bucket region, decided at cloud setup | A US region if the free tier matters more than latency |

## 13. Production launch blockers (Stage 11)

Production must not launch until each item is resolved and approved:

1. **Legacy public KYC files:** every original listed in the migration retirement report must be secured or deleted individually, after verified migration and separate approval. Do not make the whole legacy bucket private (it also serves property images).
2. **Default storage mode is insecure:** `FILE_STORAGE_BACKEND` defaults to `legacy`, which stores new KYC uploads at public URLs (Supabase public bucket or `public/uploads`). Production must run with the private provider (`FILE_STORAGE_BACKEND=firebase`, enabled for a real project only after approval); a deployment without it must be treated as a blocker.
3. **Firebase Storage needs the Blaze plan** (billing account) for a real bucket. The final architecture (Firestore + Firebase Storage) therefore needs an approved billing decision; the free-first strategy (F2) is otherwise in conflict.
4. **Rollback and cutover:** the reverse migration and `--since` catch-up are not built; a tested rollback and cutover plan is mandatory before production migration.
5. **Real-project checks:** rules deployment, composite indexes, IAM, region and quotas are verified on emulators only.
