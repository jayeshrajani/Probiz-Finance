# Merge and deploy guide: `shivansh_dev` into `main` (for Jayesh)

Maintained by Shivansh; updated with every change pushed to `shivansh_dev`. Last update: 2026-11-17 (mobile OTP sign-in and lead references).

How to use: read sections 1-2, then give this file to Copilot and ask it to carry out section 3 ("Steps") one step at a time.
Steps marked **[Jayesh]** need a person (website dashboards, approvals); Copilot should stop and ask at those.

Rules for whoever carries this out (person or Copilot):

- Do not change the live server (AWS EC2) or GoDaddy DNS. Do not force-push. Do not rewrite `main`'s history.
- No secrets in Git, chat or docs. `.env.local` is never committed. Real customer data never goes into staging or test runs.
- If a conflict is not covered by section 4, stop and ask; do not drop either side's work.

## 1. What is waiting on `shivansh_dev`

Already merged into `main` by Jayesh on 2026-11-17 (`2a42756`, `bdb3d5d`): address and maps, GA4 with consent, WhatsApp messages,
service cards, document access log, earlier docs. GA4 still needs its Vercel variable (step 3.6).

New, on top of `main` `0cca2d5`. List the exact commits with `git log --oneline origin/main..origin/shivansh_dev`.

| Change | Needs anything at deploy? | Details |
|---|---|---|
| **Mobile OTP sign-in** (WhatsApp first, SMS by MSG91 as fallback), automatic account, **"Mobile sign-ins" (NUL) leads** with WhatsApp alert, conversion to the product lead when they apply (`NUL-000042` becomes `HL-000042`), **lead references on every lead**, **verified-number** flag and prompts (account page, after applying), 7-day removal of unconverted NUL leads | **Yes, to switch it on** (step 3.7). Without the variables the mobile option and the "verify your number" prompts stay hidden; lead references and the Mobile sign-ins inbox work anyway | [changes/2026-11-17_shivansh_mobile-otp-and-lead-refs.md](changes/2026-11-17_shivansh_mobile-otp-and-lead-refs.md) |
| Docs: staging bucket lockdown results, Jayesh's 2026-11-17 commits | No | [changes/2026-11-17_shivansh_kyc-document-safeguards.md](changes/2026-11-17_shivansh_kyc-document-safeguards.md), [changes/2026-11-15_jayesh_main-updates.md](changes/2026-11-15_jayesh_main-updates.md) |

No new packages, no Firestore index or rule changes. New collections/tables, created on first use by both backends: `otp_challenge`,
`mobile_signin`, `counter`. New fields on leads (`ref`, `seq`, `convertedFrom`, `phoneVerified`, `phoneVerifiedAt`) and users
(`signupMethod`, `mobileVerified`, `mobileVerifiedAt`); user name, email and password are optional in the model now (mobile-only accounts).
`vercel.json` gains a daily cron. Firebase staging itself is covered separately in [FIREBASE_STAGING_HANDOFF.md](FIREBASE_STAGING_HANDOFF.md).

## 2. What to expect

- `shivansh_dev` sits on `main` `0cca2d5`. If `main` has not moved since, the merge is a fast-forward with no conflicts.
- If `main` has new commits, conflicts are most likely in the lead pipeline and admin lead pages: see section 4.
- Without the OTP variables nothing visible changes for customers (the mobile option and the verify prompts stay hidden).
  Staff see lead references (`HL-000123`) and a "Mobile sign-ins" inbox (empty).
  The first admin lead-list load gives every existing lead a reference (once; a few seconds on Firestore).

## 3. Steps

### 3.1 Get both branches

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git log --oneline main..origin/shivansh_dev   # the commits being merged
```

### 3.2 Merge

Preferred: open a pull request on GitHub from `shivansh_dev` into `main` and merge it there (keeps a record). Or locally:

```bash
git merge --no-ff origin/shivansh_dev -m "Merge shivansh_dev: mobile OTP sign-in, lead references, verified numbers"
```

If Git reports conflicts, resolve them with section 4, then `git add <files>` and `git commit`.

### 3.3 Install and build

```bash
npm ci
npm run build
```

Expected: build succeeds (about 246 pages, English and Hindi). `npm ci` must use `registry.npmjs.org` only (see `.npmrc`).

### 3.4 Checks

```bash
npm run check:i18n
```

Expected: `total 6 missing`, all already on `main`: `(prefers-reduced-motion: reduce)` and a canvas font string (not text; can be
excluded from the check), "Swim before work.", "Write freely.", "30 lakh at 7% for 10 years" and "Sales executives can't be assigned leads."
(need Hindi). Any other missing string comes from the merge: add its Hindi to `locales/hi/ui.json`.

OTP end-to-end check (local, synthetic data; codes are shown instead of sent):

```bash
# terminal 1 (a copy of the local database; never real data)
OTP_DEV_MODE=1 TRUST_PROXY=1 CRON_SECRET=local-check npm run dev
# terminal 2 (local demo logins from setup.md)
ADMIN_PASSWORD=... CUSTOMER_PASSWORD=... CRON_SECRET=local-check npm run check:otp -- http://localhost:3000
```

Expected: `All OTP checks passed.` (it waits about 30 seconds once, for the resend limit).
Also run `npm run check:intake` (lead forms) against the same server: all passed.

Then check in the browser (same server):

| Page | Expect |
|---|---|
| `/sign-in` | Customer tab shows "Mobile number" and "Email and password"; mobile: number + consent, "Send code", code (test mode shows it), signed in, lands on `/account` |
| `/account` after a mobile sign-in | Green tick next to the number; "What can we help you with?"; no password card |
| `/homeloan`, apply while signed out | Thank-you screen asks "Verify your mobile number" |
| Admin > Inbox > Mobile sign-ins | The sign-in as `NUL-000…`, "Mobile sign-in", green tick; after applying it moves to the product as `HL-000…` with the same number |
| Admin > any lead list | References under the names, searchable; CSV has "Ref" and "Number verified" |

### 3.5 Deploy the code **[Jayesh]**

Push `main` (or merge the pull request). Vercel deploys production. Check the live site with the table in 3.4.

### 3.6 Switch on GA4 **[Jayesh]**

1. Vercel > Project > Settings > Environment Variables > Add:
   `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-JFRQMSBFQ9`, environment **Production only**.
2. Redeploy production (Deployments > latest production > Redeploy). The value is read at build time; without a redeploy nothing changes.
3. In a private window on the live site: the notice appears; after "Allow", GA4 > Reports > Realtime shows the visit;
   clicking WhatsApp/phone shows `whatsapp_click` / `phone_click`.
4. GA4 > Admin > Data display > Events: mark `generate_lead`, `whatsapp_click`, `phone_click` as key events.
5. Do not add the Google Tag Manager (`GTM-5M29V599`) snippet or any other GA snippet (double counting).

Rollback: delete the variable and redeploy.

### 3.7 Switch on mobile OTP **[Jayesh / owner]**

Vercel > Project > Settings > Environment Variables (Production; secrets only here, never in Git or chat):

1. **WhatsApp codes:** in Meta WhatsApp Manager create an **Authentication** template with a **Copy code** button (English), wait for approval.
   Add `WHATSAPP_OTP_TEMPLATE=<template name>` and `WHATSAPP_OTP_TEMPLATE_LANG=en` (uses the same `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` as the lead alerts).
2. **SMS fallback (MSG91):** after the company's DLT registration (entity, sender ID, OTP template with `##OTP##`), create the OTP template in MSG91.
   Add `MSG91_AUTH_KEY` and `MSG91_OTP_TEMPLATE_ID`.
3. **Daily cleanup:** add `CRON_SECRET=<long random string>`. `vercel.json` already schedules `/api/cron/purge` daily (03:00 IST).
4. **Lead alerts** (also for mobile sign-ins): `WHATSAPP_TEMPLATE` and `WHATSAPP_ALERT_TO`, if not set yet.
5. Never add `OTP_DEV_MODE` in Vercel.
6. Redeploy. On the live site: `/sign-in` shows "Mobile number"; sign in with your own number; the code arrives on WhatsApp
   ("Didn't get it? Send by SMS" tries MSG91); the admin Inbox shows the sign-in as `NUL-…` and the team gets a WhatsApp alert.

Works with only one of WhatsApp or SMS configured. Rollback: remove the variables and redeploy (the option disappears; data stays).

### 3.8 After deploying

Tell Shivansh the merge commit hash and deploy date; he records it in the change notes.

## 4. Conflict rules

General rule: keep Jayesh's structure (i18n `t()`, layout, new components) and re-apply Shivansh's addition on top.

| File | Keep from `main` | Add from `shivansh_dev` |
|---|---|---|
| `pages/_app.js` | Providers and everything inside them (`I18nProvider`, `SiteSettingsProvider`, `CallbackDialog`, ...) | `<Analytics />` next to `<WhatsAppButton />` and `<Assistant />`, inside the providers |
| `lib/site.js`, `content/company.json` | Address text and map URLs as on `main` (the Hindi dictionary uses the address text as its key) | Nothing, unless `main` changed the address: then update `streetAddress`/`postalCode` in `components/site/Seo.jsx` to match |
| `components/site/SiteFooter.jsx` | `t()` calls, callback button, layout | `<AddressLink />` in place of the plain address link; "Cookie preferences" button (`gaConfigured && setConsent(null)`) |
| `pages/about.js`, `pages/contact.js` | `t()` calls | `<AddressLink />` where the address is shown (About) |
| `components/site/WhatsAppButton.jsx` | `useT()` | Message from the page: `productBySlug`/`serviceBySlug` by path, `t(WHATSAPP_PRODUCT, { name })` or `t(WHATSAPP_GREETING)` |
| `components/assistant/Assistant.jsx` | All of `main`'s assistant | `track("chat_open")` when it opens |
| `lib/callback.js`, `components/forms/ApplicationForm.jsx`, `components/site/NewsletterForm.jsx` | `main`'s logic and `t()` | One `track(...)` call after a successful submit (`generate_lead` / `sign_up`) |
| `components/templates/ServicePage.jsx` | Everything except the "What we handle." cards | The grid of `<ServiceCard section={s} />` |
| `styles/globals.css` | All of `main` | The `.svc-*` block (service cards) |
| `server/storage.js`, `server/routes/files.routes.js`, `server/controllers/adminPanel.controller.js` | `main`'s logic | Links carry `by` (staff and lead); `/api/files` writes `DocumentAccess` before sending; `documentAccess` endpoint |
| `locales/hi/ui.json` | All keys from both sides (it is one flat JSON object; check it still parses) | |
| `server/leads/intake.js` | `main`'s gate, personas, merge rules | In `upsertLead`: the `signinKey` lock, `verified`, the block "Signed in with an OTP earlier and now applying" (NUL conversion) before `Lead.create`, `ref`/`seq`/`phoneVerified` on create; `leadRef`/`phoneVerified` in the 201 response; the `lead.converted` alert listener; `takeMeta` export |
| `server/controllers/adminPanel.controller.js` | `main`'s permissions, personas and actions | `ref`, `convertedFrom`, `phoneVerified` in `row`; `otp_signin` channel; new activity texts; `ensureRefs` in overview/list/get; `maybePurge` in list; `findLead` fallback by id |
| `server/admin/leads.js` | `main`'s lead types | The `signin` type (Inbox) and the `CODES` table (add a code for any new type) |
| `pages/admin-panel/leads/index.js`, `pages/admin-panel/leads/[type]/[id].js` | `main`'s layout and actions | Reference and green tick (list, CSV, header, origin), the mobile sign-in note, redirect when the lead's type changed |
| `pages/sign-in.js`, `pages/account.js`, `components/forms/ApplicationForm.jsx` | `main`'s layout and `t()` | Mobile/email switch with `OtpForm`; interest, verify and mobile-only cards; verify step on the thank-you screen |
| `server/models/user.model.js`, `server/models/lead.model.js` | `main`'s fields | The new fields listed in section 1 |
| `vercel.json` | `regions` | `crons` |

After resolving: `npm run build` and `npm run check:i18n` again (3.3-3.4).

## 5. Decisions still open (not needed for the merge)

- **Check now (Jayesh): `FILE_STORAGE_BACKEND` in Vercel production.** It must be `firebase`. The default `legacy` stores newly uploaded KYC documents at public URLs.
- **Before real customers:** staging (`probiz-finance-staging`) holds Jayesh's test data (about 71 leads, 6 customer accounts, 235 private test documents).
  Real customers go to a separate production Firebase project, or staging is emptied first; test data is never carried over.
  Also: retention period for documents (client); consent and privacy text (lawyer); breach contacts. Checklist: [changes/2026-11-17_shivansh_kyc-document-safeguards.md](changes/2026-11-17_shivansh_kyc-document-safeguards.md).
- Privacy policy: add the Google Analytics paragraph (draft in the GA4 change note) before or right after switching GA4 on.
- Facebook Pixel (`pages/_app.js`) loads without consent; consider putting it behind the same notice.
- WhatsApp lead alerts (built by Jayesh, off): need the Meta WhatsApp Cloud API settings and the client's details (see the WhatsApp change note).
- Platform manager default login in non-production runs (see review notes in Jayesh's change note).

## 6. Owner decisions (2026-11-17) and tasks for Jayesh

Decisions:

- **Aadhaar:** customers upload their normal Aadhaar (no masked-Aadhaar requirement; it was found tedious and could lose customers).
  Full Aadhaar numbers are therefore stored: keep them private, logged and deleted after the retention period (to be decided).
- **No old customer data exists** (owner, 2026-11-17): the company worked manually before this site, so there are no old KYC files
  or records to migrate or secure. The data in staging is Jayesh's test data.
- **Commits and pushes on `shivansh_dev`** happen only after the owner's (Shivansh's) go-ahead.
- **Mobile OTP** (2026-11-17): WhatsApp first, SMS (MSG91) fallback; OTP sign-in creates an account; sign-ins without an application are
  `NUL-` leads that convert to the product's code when they apply, and are removed after 7 days; everyone else is asked to verify their number.

Tasks for Jayesh (each needs a go-ahead before anything is changed; Copilot must stop and ask at each **[Jayesh]**):

1. **[Jayesh] Vercel production:** confirm `FILE_STORAGE_BACKEND=firebase`. If it is unset or `legacy`, new KYC uploads are stored at public URLs; report it.
2. **[Jayesh] Mobile OTP setup** (step 3.7): WhatsApp authentication template, MSG91 + DLT, `CRON_SECRET`.
3. **[Jayesh] Go-live data:** keep test data out of production (separate production Firebase project, or empty staging first).
