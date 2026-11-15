# Probiz Finance: Firebase Staging Handoff (Jayesh)

Staging only. Synthetic test data only: never enter or upload real customer details or KYC documents into staging.
This guide contains no secrets; credentials are never stored in Git or shared in chat.

## 1. What exists (2026-11-15)

| Item | Value |
|---|---|
| Firebase project ID | `probiz-finance-staging` (display name "Probiz Finance Staging", project number 530217231156) |
| Owner | The Probiz Finance Google account (grants access; billing contact) |
| Plan and budget | Blaze (pay-as-you-go) with a ₹200/month budget alert (alerts only; it does not cap spending) |
| Firestore | `(default)` database, Standard edition, `asia-south1` (Mumbai), delete protection on, point-in-time recovery off |
| Firestore rules | Deny all direct client access (`firestore.rules`); the app's server uses the Firebase Admin SDK, which is not subject to rules |
| Firestore indexes | 14 composite indexes and 5 field overrides from `firestore.indexes.json` (collections `lead`, `area`, `property`), all READY |
| Storage bucket | `probiz-finance-staging.firebasestorage.app`, `asia-south1`, Standard class |
| Storage rules | Deny all direct client access (`storage.rules`); customer documents (`private/documents/...`) open only through short-lived signed links issued by the server; property media (`public/property/...`) use Firebase download-token URLs |
| Enabled APIs | Firestore, Cloud Storage, Cloud Storage for Firebase, Firebase Management |
| Code | GitHub `jayeshrajani/Probiz-Finance`, branch `shivansh_dev` (Firebase work stays off `main` until the merge is approved) |
| Website hosting | None yet; run the app locally against staging (section 3). Firebase App Hosting config exists (`apphosting.yaml`, `apphosting.staging.yaml`) but is not deployed |
| Data | Empty: no records, no files, no admin account yet (section 4) |

Console: https://console.firebase.google.com/project/probiz-finance-staging/overview

Not done yet: production data source identification and migration (section 5), website hosting, custom domain, bucket hardening test (uniform bucket-level access / public access prevention with property download URLs).

## 2. Access (granted by the project owner)

The owner adds Jayesh's Google account with the least access needed (run in Cloud Shell, after approval):

```bash
gcloud projects add-iam-policy-binding probiz-finance-staging \
  --member="user:<jayesh-google-email>" --role="roles/datastore.user"
gcloud storage buckets add-iam-policy-binding gs://probiz-finance-staging.firebasestorage.app \
  --member="user:<jayesh-google-email>" --role="roles/storage.objectAdmin"
```

No service-account keys are created for local development.

## 3. One-time setup on Jayesh's computer

1. Install Node.js 20.9 or newer and the Google Cloud CLI.
2. Sign in for Application Default Credentials (browser sign-in; nothing to copy into files):

   ```bash
   gcloud auth application-default login
   gcloud auth application-default set-quota-project probiz-finance-staging
   ```

3. Get the code:

   ```bash
   git clone --branch shivansh_dev https://github.com/jayeshrajani/Probiz-Finance.git
   cd Probiz-Finance
   npm ci
   ```

   The project `.npmrc` uses the public npm registry; do not commit lockfile entries that point at any private or company registry.

4. Create `.env.local` (git-ignored; never commit it) from `.env.example` with these values:

   ```env
   DATA_BACKEND=firestore
   FILE_STORAGE_BACKEND=firebase
   FIREBASE_PROJECT_ID=probiz-finance-staging
   FIREBASE_CONFIRM_PROJECT=probiz-finance-staging
   FIREBASE_STORAGE_BUCKET=probiz-finance-staging.firebasestorage.app
   JWT_SECRET=<generate your own: openssl rand -hex 32>
   ```

   Leave `DATABASE_URL`, `SUPABASE_*`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` and the emulator variables empty.
   `FIREBASE_CONFIRM_PROJECT` must repeat the project ID exactly, or the app refuses to connect (safety gate).

5. Start: `npm run dev`, then open http://localhost:3000.

## 4. Staging data (to do once, synthetic only)

With `.env.local` from section 3 and the dev server stopped for the seed scripts:

```bash
npm run seed:site-settings   # approved company contact details and social links; only if missing
npm run seed:areas           # public locality list from the repository; skips existing names
```

First admin: start `npm run dev`, then call `POST http://localhost:3000/api/createAdmin` with `admin_Name`, `admin_Email` and a strong `password`
(JSON body). This endpoint accepts an unauthenticated request only while no admin exists; afterwards only admins can add admins.
Keep the password in a password manager. Check that a second unauthenticated `createAdmin` returns 401.

Add only made-up names, phone numbers and documents (for example sample PDFs). Delete test records when finished.

## 5. Production data (MongoDB): Jayesh's responsibility

The live site (`probizfinance.com`, GoDaddy DNS, an AWS server) appears to run the older Express app; its data is believed to be in MongoDB.
Jayesh owns identifying and handling that data. Points to keep:

- The repository's migration utility (`npm run migrate:firestore`, `migrate:files`, `migrate:verify`; see `docs/firebase-migration-plan.md`)
  reads PostgreSQL/PGlite only. It has no MongoDB reader; MongoDB data needs either a new reader or a conversion into the
  existing model shapes (`server/models/*`, one collection per model, document ID = record ID, dates as timestamps) first.
- Real customer data and KYC documents never go into `probiz-finance-staging`. Production gets its own Firebase project, created with the owner's approval.
- KYC documents go only to the private bucket path (`private/documents/...`, stored as `pf:` references); never public URLs.
- Always dry-run first, verify counts and samples afterwards, confirm at least one active admin, and keep the MongoDB source unchanged until the switch is signed off.
- Share only counts and masked samples when reporting; no personal data in chat, tickets or Git.

## 6. Rules of the road

- Work on a branch from `shivansh_dev` (for example `jayesh/<feature>`) and open a pull request into `shivansh_dev`.
- Do not deploy rules, indexes or hosting, change billing, or run the migration utility against staging without the owner's approval.
- Never commit `.env.local`, keys or downloaded credentials.

## 7. Troubleshooting

| Message | Cause |
|---|---|
| `Real Firebase project refused: set FIREBASE_CONFIRM_PROJECT ...` | `FIREBASE_CONFIRM_PROJECT` missing or different from `FIREBASE_PROJECT_ID` |
| `FIREBASE_STORAGE_BUCKET must be set explicitly ...` | Bucket variable missing |
| `PERMISSION_DENIED` from Firestore or Storage | Access in section 2 not granted yet, or signed in with another Google account (`gcloud auth application-default login` again) |
| `Could not load the default credentials` | Step 3.2 not done |
| Query error mentioning an index | Report it; indexes are deployed only from `firestore.indexes.json` with approval |
| `npm ci` fails fetching a package | The lockfile must point at `registry.npmjs.org` only; never commit private-registry URLs |
