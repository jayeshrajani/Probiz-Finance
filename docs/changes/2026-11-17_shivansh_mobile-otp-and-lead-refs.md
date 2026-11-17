# Mobile OTP sign-in, lead references (NUL to product) and verified numbers

Author: Shivansh. Date: 2026-11-17. Branch: `shivansh_dev`. Owner decisions: WhatsApp first with SMS (MSG91) as the fallback;
OTP sign-in creates an account; a signed-in visitor who has not applied is a lead with a `NUL-` reference that changes to the
product's code when they apply; NUL leads are removed after 7 days; everyone else is asked to verify their number.

## What customers see

| Where | Behaviour |
|---|---|
| `/sign-in` (Customer) | "Mobile number" (default when a sender is configured) or "Email and password". Mobile: number + consent, "Send code" (WhatsApp), 6-digit code (auto-submits), "Resend code" after 30 s, "Didn't get it? Send by SMS". New numbers get an account automatically; then they land on `/account` |
| `/account` after a mobile sign-in | "What can we help you with?" with 13 products/services (and "Something else"). Picking one is noted on their lead and opens that product's application |
| `/account`, number not verified | "Verify your mobile number" card (code to the number in their details). Changing the number un-verifies it |
| `/account`, mobile-only account | No password card ("You sign in with your mobile number and a one-time code"); green tick next to the verified number |
| After any application (not yet verified) | "Verify your mobile number" step on the thank-you screen; "Mobile number verified." once done. Skipped when a signed-in customer's number is already verified |

Hindi translations are included for all of these.

## What staff see (admin panel)

- **Lead references** on every lead: product code + one shared 6-digit sequence, for example `HL-000123` (home loan), `PL-...` (personal loan),
  `CB-...` (callback), `NUL-...` (mobile sign-in, not applied). Codes: `server/admin/leads.js` (`CODES`). Shown in the lead list (under the name),
  the lead page header and "Where it came from"; searchable; in the CSV export. Older leads get a reference the first time the list or lead is opened (oldest first).
- **"Mobile sign-ins"** in the Inbox group: people who signed in with an OTP but have not applied. Normal status flow, L1 pool, WhatsApp alert to the team
  ("Mobile sign-in", name, number, link). Their page explains the conversion and the 7-day removal.
- **Conversion:** when that customer applies (any product form, with the same number), the NUL lead **becomes** the product lead: same lead, same number,
  `NUL-000042` becomes `HL-000042`, activity "Applied for Home loan: NUL-000042 became HL-000042", and a new WhatsApp alert with the product.
  Old links (`/admin-panel/leads/signin/<id>`) open the converted lead.
- **Sign-in again** with an open lead: no new lead; activity "Signed in on the website with a mobile code" and the lead moves to the top.
- **Verified number:** green tick next to the phone in the list, "Mobile number verified by OTP" on the lead page, "Mobile: Verified by OTP" in
  "Where it came from", activity "Mobile number verified (signed in with a mobile code / from their account / after applying)", CSV column "Number verified".
- **7-day removal:** NUL leads still not converted 7 days after the sign-in are deleted with their activity (the customer account stays).
  Runs daily (Vercel Cron) and at most hourly when staff open the lead list.

## How it works (server)

| Part | Files |
|---|---|
| Codes: 6 digits, 5 minutes, 5 tries, single use, only an HMAC stored (key derived from `JWT_SECRET`) | `server/otp/index.js`, `server/models/otpChallenge.model.js` |
| Delivery: WhatsApp authentication template (copy-code button) first, MSG91 SendOTP (our own code) as fallback; `OTP_DEV_MODE=1` returns the code (never in production) | `server/otp/deliver.js` |
| API: `POST /api/otp/send`, `POST /api/otp/verify` with `purpose` `signin` (typed number + consent), `account` (signed-in customer's number), `lead` (number on a lead from the last 7 days); `GET /api/otp/status` | `server/controllers/otp.controller.js`, `server/routes/otp.routes.js` |
| Limits (cost protection against SMS pumping): per number 1 per 30 s, 3 per 10 min, 10 per day; per IP 10 per 10 min, 40 per day; verify 30 per 10 min per IP | `otp.controller.js` |
| Account for the number (found by `mobile_no` variants or created, `signupMethod: 'otp'`), sign-in lead, verification marks, 7-day removal | `server/leads/mobile.js`, `server/models/mobileSignin.model.js` |
| References and sequence (`counter` record `lead-ref`, locked in the same transaction) | `server/leads/refs.js`, `server/models/counter.model.js` |
| Conversion NUL to product inside the intake transaction; new leads get `ref`/`seq`; `phoneVerified` set when a signed-in customer's verified number matches | `server/leads/intake.js` |
| Account: `interest` options and `POST /api/account/interest`; `mobileVerified`, `hasPassword`; set a password without a current one (mobile-only accounts) | `server/controllers/account.controller.js` |
| Email sign-in on a mobile-only account explains to use the mobile option | `server/controllers/user.controller.js` |
| Daily cleanup `GET /api/cron/purge` (Bearer `CRON_SECRET`) | `otp.controller.js`, `vercel.json` (`30 21 * * *` UTC = 03:00 IST) |

Data changes (created automatically on both backends, equality queries only, no new Firestore index): lead `ref`, `seq`, `convertedFrom`, `phoneVerified`, `phoneVerifiedAt`;
user `signupMethod`, `mobileVerified`, `mobileVerifiedAt` (name, email and password are now optional in the model; the email sign-up form still requires them);
new collections `otp_challenge`, `mobile_signin`, `counter`.

## Setup before it works in production (Jayesh / owner)

1. **WhatsApp:** in Meta WhatsApp Manager create an **Authentication** template with a **copy code** button (English; Meta's fixed text), wait for approval.
   Vercel: `WHATSAPP_OTP_TEMPLATE=<template name>`, `WHATSAPP_OTP_TEMPLATE_LANG=en` (plus `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, shared with the lead alerts).
2. **SMS fallback (MSG91):** account in the company's name, **DLT registration** (entity, 6-letter sender ID, OTP template containing `##OTP##`, about 3 to 7 days).
   MSG91 OTP section: create the OTP template, note its ID. Vercel: `MSG91_AUTH_KEY`, `MSG91_OTP_TEMPLATE_ID`.
3. **Cleanup:** Vercel: `CRON_SECRET=<long random string>`. Vercel Cron calls `/api/cron/purge` daily with it.
4. Never set `OTP_DEV_MODE` in Vercel.
5. Redeploy. The mobile option appears on `/sign-in` as soon as WhatsApp or SMS is configured; without either it stays hidden and nothing changes.
6. The team's new-lead alerts need `WHATSAPP_TEMPLATE` and `WHATSAPP_ALERT_TO` (already documented); mobile sign-ins use the same alert.

Costs (approximate, check current rates): WhatsApp authentication message about ₹0.12-0.15; MSG91 SMS about ₹0.15-0.25 plus one-time DLT about ₹5,900.

## Verification (2026-11-17, local, synthetic data, isolated database copies)

- `npm run check:otp` (new, app with `OTP_DEV_MODE=1`, `TRUST_PROXY=1`, `CRON_SECRET`): **38 of 38**. Consent and number checks; 30-second resend limit;
  wrong code (4 tries left); single use; new account + `NUL-000001` lead (verified, mobile sign-in); second sign-in reuses account and lead; account shows
  interest options; interest noted; home loan application converts `NUL-000001` to `HL-000001` (same lead, verified, activity, old link works); anonymous
  application gets `HL-…`, verified by code afterwards; email customer verifies from the account page; account codes need sign-in; cron secret enforced;
  in-process: NUL lead older than 7 days removed with its activity, a recent one and the customer account kept.
- `check:firestore-adapter` 129/129 (new models included); `check:intake` all passed; build exit 0 (246 pages); `check:i18n` only the 6 pre-existing gaps.
- Browser: `/sign-in` mobile flow to `/account` (green tick, "What can we help you with?"); admin Inbox shows `NUL-000232`, "Mobile sign-in", green tick.

## Notes

- First admin list load after deploy assigns references to all existing leads (one write each, once); on Firestore that load takes a few seconds once.
- A customer who signs in with a number that already has an open product lead is attached to that lead (no NUL).
- The 7-day removal deletes NUL leads even if staff changed their status; it does not touch converted leads or customer accounts.
