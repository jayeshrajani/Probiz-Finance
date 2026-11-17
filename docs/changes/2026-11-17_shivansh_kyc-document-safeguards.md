# KYC document safeguards: document access log

Author: Shivansh. Date: 2026-11-17. Branch: `shivansh_dev`.
Background: Indian rules for storing KYC documents (summary below; not legal advice, to be confirmed by the client's lawyer).

## Code changes

### 1. Masked Aadhaar: added, then removed (owner decision, 2026-11-17)

- A "Masked Aadhaar only" instruction was added to every Aadhaar upload slot and then removed the same day.
- Owner's decision: downloading a masked Aadhaar is tedious for customers and may lose leads, so customers upload their normal Aadhaar.
- Consequence: full Aadhaar numbers are stored. UIDAI rules restrict storing full Aadhaar numbers by entities that are not authorised;
  this is a known risk accepted by the owner, to be reviewed with the lawyer. It makes the other safeguards (private storage,
  access log, retention and deletion) more important. Possible later options without asking customers: staff mask the number
  before sharing with a lender, or documents are deleted soon after the lender receives them.

### 2. Document access log (who opened which customer document)

- The signed link that the lead page gives to staff (`/api/files/...`) now carries, inside the signed payload, the staff member, role and lead.
- Each time a private document is actually opened, `/api/files` writes a `DocumentAccess` record **before** sending the file
  (time, object path, staff id and name, role, lead id and type, IP). If the record cannot be written, the file is not sent.
- Kept when a lead is deleted (lead events are deleted with the lead; this log is separate on purpose). Holds no customer content.
- Admins can read it: `GET /api/admin/document-access?leadId=<lead id>` (admin only, `no-store`). No admin-panel screen yet.
- Database: new collection/table `document_access` (created automatically on both backends; equality query only, so no Firestore index).
- Links issued before this change (valid 10 minutes) still work and are logged without staff details.

| File | Change |
|---|---|
| `server/storage.js` | `fileLink(ref, by)`, `withFileLinks(value, by)`, new `readFileLink(token)` returning `{ path, by }`; `verifyFileLink` unchanged for callers |
| `server/routes/files.routes.js` | Writes the `DocumentAccess` record before streaming; closes the file stream on failure |
| `server/models/documentAccess.model.js` | New model |
| `server/controllers/adminPanel.controller.js`, `server/routes/adminPanel.routes.js` | Lead detail passes the staff member and lead into the links; new `documentAccess` endpoint |
| `scripts/check-storage.mjs` | Two new checks (access logged with staff, lead and IP; log kept after lead deletion) |

### Verification (2026-11-17)

- Build: exit 0, 236 pages. `check:i18n`: total missing unchanged (4, all pre-existing).
- `check:firestore-adapter` (Firestore emulator): all 125 scenarios passed, including the new model.
- `check:storage` (Storage emulator, app on an isolated copy of the synthetic baseline database, 60 s links): **22 of 22 passed**, including the two new checks,
  link expiry, tampered links, access control and upload validation.
- After removing the masked-Aadhaar instruction: `lib/forms.js` and `components/forms/FileSlot.jsx` are identical to `main`.

## Indian rules that apply to stored KYC documents (summary)

| Rule | What it requires here |
|---|---|
| DPDP Act 2023 and DPDP Rules 2025 (most duties phased in by about mid-2027) | Reasonable security safeguards (encryption or masking, access control, access logs kept at least 1 year, backups); consent for a stated purpose; delete when the purpose is over; breach notice to the Data Protection Board (detailed report within 72 hours) and to affected people |
| Aadhaar Act and UIDAI regulations | No storing full Aadhaar numbers unless authorised; keep masked Aadhaar (last 4 digits visible) |
| RBI digital lending rules (if Probiz acts as a lending service provider / DSA) | Data stored in India; explicit consent; collect only what is needed; possible limits on what a service provider may keep. **Lawyer to confirm Probiz's role** |
| CERT-In directions 2022 | Report cyber incidents within 6 hours; keep system logs 180 days in India |
| IT Act s.43A and SPDI Rules 2011 (being replaced by DPDP) | Financial information is sensitive personal data; reasonable security practices |

Encryption: Cloud Storage encrypts every object at rest (AES-256, Google-managed keys) and in transit (HTTPS) by default; no code change needed.
Optional for production: a customer-managed key (Cloud KMS, CMEK) so Probiz controls and can revoke the key.

## Status checklist

| # | Item | Status |
|---|---|---|
| 1 | Customer documents private (`private/documents/...`, `pf:` references), deny-all storage rules, 10-minute signed links after the lead access check | Done (Firebase work) |
| 2 | Data in India (`asia-south1`, Mumbai) | Done (staging); production project must use the same region |
| 3 | Upload checks (real file type, 5 MB), no documents or personal data in logs | Done (Firebase work) |
| 4 | Masked Aadhaar | **Not used (owner decision 2026-11-17):** normal Aadhaar uploads; risk accepted, to be reviewed with the lawyer |
| 5 | App-level document access log | **Done (this change)** |
| 6 | Bucket lockdown: public access prevention, uniform bucket-level access | To do in Cloud Shell, with approval (steps below) |
| 7 | Google Cloud audit logs for Storage (data read/write), kept 365 days | To do in Cloud Shell, with approval (steps below) |
| 8 | Retention: how long documents are kept after a lead is closed or rejected, then automatic deletion | **Client decision needed** (period); then built |
| 9 | Consent notice and privacy policy: purpose, sharing with the chosen bank/NBFC, retention, grievance contact | Client/lawyer to approve text |
| 10 | Breach plan: who reports to CERT-In (6 h) and the Data Protection Board (72 h) | Client to name owners |
| 11 | Old KYC files at public URLs on the current system (Supabase public bucket) | **Launch blocker.** Copy privately (`npm run migrate:files`), then secure or delete originals, with approval (Jayesh) |
| 12 | Production storage mode: `FILE_STORAGE_BACKEND=firebase` in production. The default `legacy` mode stores new uploads at public URLs | **Jayesh to check Vercel now** |
| 13 | Separate production Firebase project, least-privilege service account, data processing terms with Google and Vercel | Before go-live |
| 14 | WhatsApp lead alerts send name and phone to Meta (no documents) | Mention in privacy policy if switched on |

## Cloud steps for staging (not yet done; run only after approval, one at a time)

Cloud Shell, project `probiz-finance-staging`. Synthetic files only.

1. Lock down the bucket:

   ```bash
   gcloud storage buckets update gs://probiz-finance-staging.firebasestorage.app --public-access-prevention
   gcloud storage buckets update gs://probiz-finance-staging.firebasestorage.app --uniform-bucket-level-access
   gcloud storage buckets describe gs://probiz-finance-staging.firebasestorage.app --format="default(public_access_prevention,uniform_bucket_level_access)"
   ```

2. Check that public property images (Firebase download-token URLs) still work, with a made-up test image:

   ```bash
   printf '\x89PNG\r\n\x1a\n' > /tmp/t.png
   TOKEN=$(cat /proc/sys/kernel/random/uuid)
   gcloud storage cp /tmp/t.png gs://probiz-finance-staging.firebasestorage.app/public/property/check.png --custom-metadata=firebaseStorageDownloadTokens=$TOKEN
   curl -s -o /dev/null -w '%{http_code}\n' "https://firebasestorage.googleapis.com/v0/b/probiz-finance-staging.firebasestorage.app/o/public%2Fproperty%2Fcheck.png?alt=media&token=$TOKEN"   # expect 200
   curl -s -o /dev/null -w '%{http_code}\n' "https://firebasestorage.googleapis.com/v0/b/probiz-finance-staging.firebasestorage.app/o/public%2Fproperty%2Fcheck.png?alt=media"            # expect 403
   gcloud storage rm gs://probiz-finance-staging.firebasestorage.app/public/property/check.png
   ```

   If the first request is not 200, undo step 1 (`--no-public-access-prevention` / `--no-uniform-bucket-level-access`) and report.

3. Turn on Cloud Storage data-access audit logs: Console > IAM & Admin > Audit Logs > "Google Cloud Storage" > tick "Data Read" and "Data Write" > Save.
   Keep logs 365 days: `gcloud logging buckets update _Default --location=global --retention-days=365`.
   Cost: small (log storage beyond 30 days is charged per GB; staging volume is tiny). The budget alert stays in place.
