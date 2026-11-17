# Merge and deploy guide: `shivansh_dev` into `main` (for Jayesh)

Maintained by Shivansh; updated with every change pushed to `shivansh_dev`. Last update: 2026-11-17 (KYC safeguards).

How to use: read sections 1-2, then give this file to Copilot and ask it to carry out section 3 ("Steps") one step at a time.
Steps marked **[Jayesh]** need a person (website dashboards, approvals); Copilot should stop and ask at those.

Rules for whoever carries this out (person or Copilot):

- Do not change the live server (AWS EC2) or GoDaddy DNS. Do not force-push. Do not rewrite `main`'s history.
- No secrets in Git, chat or docs. `.env.local` is never committed. Real customer data never goes into staging or test runs.
- If a conflict is not covered by section 4, stop and ask; do not drop either side's work.

## 1. What is waiting on `shivansh_dev`

Everything below is on top of `main` `5c727d4` (Jayesh's Hindi/English site). List the exact commits with
`git log --oneline origin/main..origin/shivansh_dev`.

| Change | Needs anything at deploy? | Details |
|---|---|---|
| Office address everywhere with a map-pin link to Google Maps (footer, About, Contact, assistant, structured data) | No | [changes/2026-11-16_shivansh_address-and-map-links.md](changes/2026-11-16_shivansh_address-and-map-links.md) |
| Google Analytics 4 with a consent notice, plus conversion events (leads, WhatsApp/phone/email/map clicks, chat, newsletter) | **Yes: one Vercel variable, then redeploy** (step 3.6) | [changes/2026-11-16_shivansh_ga4-analytics.md](changes/2026-11-16_shivansh_ga4-analytics.md) |
| WhatsApp button opens with a pre-filled message naming the product or service on the page | No | [changes/2026-11-16_shivansh_whatsapp-prefilled-messages.md](changes/2026-11-16_shivansh_whatsapp-prefilled-messages.md) |
| Service pages: cards show headings only, details open on hover (tap on phones) | No | [changes/2026-11-17_shivansh_service-cards-hover.md](changes/2026-11-17_shivansh_service-cards-hover.md) |
| KYC safeguards: log of which staff member opened which customer document (`/api/admin/document-access?leadId=...`, admin only). Aadhaar uploads stay as they are (owner decision) | No (new `document_access` collection/table is created automatically; no index) | [changes/2026-11-17_shivansh_kyc-document-safeguards.md](changes/2026-11-17_shivansh_kyc-document-safeguards.md) |
| Change notes for Jayesh's own commits (for the record) | No | [changes/2026-11-15_jayesh_main-updates.md](changes/2026-11-15_jayesh_main-updates.md) |
| Firebase implementation log updates | No | [FIREBASE_IMPLEMENTATION_LOG.md](FIREBASE_IMPLEMENTATION_LOG.md) |

No new packages, no Firestore index or rule changes. One new collection/table (`document_access`), created on first use by both backends.
Firebase staging itself is covered separately in [FIREBASE_STAGING_HANDOFF.md](FIREBASE_STAGING_HANDOFF.md).

## 2. What to expect

- `shivansh_dev` was rebased onto `main` `5c727d4`. If `main` has not moved since, the merge is a fast-forward with no conflicts.
- If `main` has new commits, conflicts are most likely in the files both of us touch: see section 4.
- Without the GA4 variable, the site behaves exactly as before apart from the address, map links, WhatsApp text and service cards
  (no analytics notice, no Google scripts). So the code can be merged and deployed first, and GA4 switched on later.

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
git merge --no-ff origin/shivansh_dev -m "Merge shivansh_dev: address and maps, GA4 with consent, WhatsApp messages, service cards, KYC safeguards"
```

If Git reports conflicts, resolve them with section 4, then `git add <files>` and `git commit`.

### 3.3 Install and build

```bash
npm ci
npm run build
```

Expected: build succeeds (about 236 pages, English and Hindi). `npm ci` must use `registry.npmjs.org` only (see `.npmrc`).

### 3.4 Checks

```bash
npm run check:i18n
```

Expected: `total 4 missing`. These 4 are already on `main` and are not from this merge:
`(prefers-reduced-motion: reduce)` and a canvas font string (not text; can be excluded from the check),
"Swim before work." and "Write freely." (need Hindi). Any other missing string comes from the merge: add its Hindi to `locales/hi/ui.json`.

Then `npm run dev` and check in the browser (synthetic data only):

| Page | Expect |
|---|---|
| Footer (any page) | Address with a map-pin icon; click opens Google Maps in a new tab |
| `/contact`, `/about` | Same address and map link; `/hi/contact` shows the Hindi address |
| `/homeloan` | WhatsApp button opens `wa.me/91...?text=Hi Probiz Finance, I'm interested in Home Loan...` |
| `/contact` | WhatsApp text is the general greeting |
| `/ca-services` | "What we handle." cards show headings only; hover opens one; on a phone-sized window a tap opens it |
| Admin panel > a lead with an uploaded document (Firebase storage mode) | Open the document, then as admin `GET /api/admin/document-access?leadId=<lead id>` lists your access |
| Any page | No analytics notice and no "Cookie preferences" link (expected until the GA4 variable is set) |
| `/admin-panel` | Unchanged |

Optional, to see the GA4 notice locally without counting visits: put `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST000000` in `.env.local`,
restart `npm run dev`, check the notice and "Cookie preferences", then remove the line again.

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

### 3.7 After deploying

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

After resolving: `npm run build` and `npm run check:i18n` again (3.3-3.4).

## 5. Decisions still open (not needed for the merge)

- **Check now (Jayesh): `FILE_STORAGE_BACKEND` in Vercel production.** It must be `firebase`. The default `legacy` stores newly uploaded KYC documents at public URLs.
- **Before real KYC data:** old KYC files at public URLs on the current system must be copied privately and the originals secured (launch blocker); retention period for documents (client); consent and privacy text (lawyer); breach contacts. Full checklist: [changes/2026-11-17_shivansh_kyc-document-safeguards.md](changes/2026-11-17_shivansh_kyc-document-safeguards.md).
- Privacy policy: add the Google Analytics paragraph (draft in the GA4 change note) before or right after switching GA4 on.
- Facebook Pixel (`pages/_app.js`) loads without consent; consider putting it behind the same notice.
- WhatsApp lead alerts (built by Jayesh, off): need the Meta WhatsApp Cloud API settings and the client's details (see the WhatsApp change note).
- Platform manager default login in non-production runs (see review notes in Jayesh's change note).
