# Jayesh Rajani: changes on `main` (2026-11-13 to 2026-11-17)

Author: Jayesh Rajani. Source: `git log --author=Jayesh origin/main`, reviewed 2026-11-16 by Shivansh. Commit hashes refer to `main`.

## Foundation (2026-11-13 to 2026-11-14, before the Firebase work started)

| Commit | Change |
|---|---|
| `6a2a55c` | First commit (original codebase) |
| `633b3a7` | Rebuilt the site as one Next.js app on Supabase with a redesigned public website |
| `075d777` | Rebuilt the admin panel; customer data locked down (staff-only access) |
| `edb136f` | Employee persona, unified staff sign-in, India-wide copy |
| `84d8943` | Lead intake unified around a Lead record plus event log (history); WhatsApp new-lead alert to the team via the Meta WhatsApp Cloud API (`server/leads/notify/whatsapp.js`, off until configured) |
| `9f2bb93` | `setup.md` with a setup prompt and local demo logins |
| `4df7e30` | `package-lock.json` pointed at the public npm registry (308 entries) |

## After merging the Firebase work (2026-11-15)

`3409adc` merged `shivansh_dev` (up to `1a1bf52`, all Firebase stages, `.npmrc`, staging handoff guide) into `jayesh-dev`, then into `main`.
Default behaviour is unchanged: Postgres and legacy file storage unless the Firebase variables are set.

| Commit | Area | Change |
|---|---|---|
| `b12f604` | Customer, SEO | Customer account page (`pages/account.js`, `server/controllers/account.controller.js`, `server/middlewares/customerAuth.js`); SEO metadata, breadcrumbs, `public/sitemap.xml`, `public/robots.txt`, `scripts/generate-sitemap.mjs` (runs before every build via `prebuild`) |
| `1c3e10a` | Admin | Analytics dashboard (`server/admin/analytics.js`: volume, conversion, sources, campaigns, per-advisor assigned/won/conversion/first response/stale); reworked leads list and detail, customers, team; shadcn components (dialog, table, select, card, tooltip, skeleton, alert-dialog); `scripts/check-staff.mjs` |
| `de4b064` | Auth | "Platform manager" built-in full-admin login from `PLATFORM_MANAGER_USERNAME` / `PLATFORM_MANAGER_PASSWORD` (not stored in the database; timing-safe comparison; behind the password-attempt limiter). Defaults to `platformmanager` / `platformmanager` when `NODE_ENV` is not `production`; off in production unless both are set |
| `36ae11c` | Careers, hosting | Job openings with an admin editor (`pages/admin-panel/careers.js`, job model, `/api` routes, `npm run seed:jobs`); careers page and company copy updates; `vercel.json` region `bom1` (Mumbai) |
| `8f2a870` | Admin, forms, Firebase on Vercel | Admin overview fix (range-only `lead_event` query, no extra Firestore index); one sidebar link per category; stricter loan forms (GST number, required amount/income/gold weight, gold type, country of study, clearer labels); confirmation scroll/focus; floating buttons hidden on phones while typing; Firebase on Vercel via `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` with a clear error when missing; `/api/health` logs its failure reason |
| `549133c` | Website | Social links on the home page and higher in the footer (`components/site/SocialLinks.jsx`); mobile layout fixes |

## 2026-11-16

| Commit | Area | Change |
|---|---|---|
| `933a3ff` | Admin | Staff can add leads by hand (`pages/admin-panel/leads/new.js`, "Add lead" in the leads list and sidebar); `server/leads/intake.js` accepts staff-entered leads |
| `5c727d4` | Website | Hindi/English site: Next.js i18n (`locales: ['en','hi']`, `/hi/...` URLs), `lib/i18n.js` (`useT()`, English text is the key), `lib/i18n-static.js`, Hindi dictionaries in `locales/hi/*.json`, `components/site/LanguageToggle.jsx`, `npm run check:i18n` (`scripts/i18n-check.mjs`), sitemap with Hindi URLs |
| | Leads | Quick callback requests (name + mobile): `server/models/callback.model.js`, `POST /api/addCallbackRequest` (lead type `callback`, "Callback requests" inbox), `lib/callback.js`, `components/site/CallbackDialog.jsx` (header "Get a callback"), `components/blocks/QuickLead.jsx` (product and service pages) |
| | Assistant, forms | Reworked chat assistant (`components/assistant/*`, callback inside the chat, contact card); shorter loan forms (`lib/forms.js`) with name/mobile pre-filled from an earlier callback in the same visit |

Note: the i18n check reports 4 untranslated strings on `main`. Two are not text (`(prefers-reduced-motion: reduce)` and a canvas font string)
and can be excluded from the check; the other two ("Swim before work.", "Write freely.") need Hindi.

## 2026-11-17

Merged `shivansh_dev` twice (`2a42756`, `bdb3d5d`): address and maps, GA4 with consent, WhatsApp messages, service cards, document access log, merge guide.

| Commit | Area | Change |
|---|---|---|
| `43dfc42` | Admin | Lead archive (hidden from lists and counts except the admin "Archived" view; `archived`, `archivedAt`, `archivedBy` on the lead); light/dark staff theme (`lib/admin-theme.js`); property editor (`pages/admin-panel/properties.js`); document previews on the lead page |
| | Services | Five new service pages and forms with private document uploads: GST registration, ITR filing, Udyam registration, Gumasta licence, rent agreement (`server/models/serviceRequest.model.js`, `server/routes/serviceRequests.routes.js`, registered as lead types in `server/admin/leads.js`); Hindi added |
| | Fixes | Sign-up signs the customer in; add-property page rework |
| `4c57a20` | Website | Application form in the hero of every service, loan, card, insurance and investment page (`ProductPage`, `ServicePage`); livelier social icons; form footer layout |
| `6b4b2ff` | Assistant | "30 lakh at 7% for 10 years" is understood as an EMI question, also right after the assistant asks for the amount |
| `a38c70b` | Staff | Personas: sales, operations L1, operations L2 (`server/admin/personas.js`). Sales add and follow only their own leads, read-only, without application fields or documents; their leads start in the L1 pool. L1 forwards to L2; L2 can send back to the previous L1 owner with a reason. Admins assign any operations employee or move leads between pools. Sign-in emails generated from the role (for example `name.sales@probiz.com`); role change via `PUT /api/admin/employees/:id`, blocked while the employee owns open leads. Sales dashboard, sales performance on the overview, level filters; `check:staff` covers the rules |
| `0cca2d5` | Website | About page hero: bouncy "Trusted since 2013." headline with floating stickers and confetti (`components/fun/JollyHero.jsx`); respects reduced motion |

Checked by Shivansh on 2026-11-17 (`shivansh_dev` fast-forwarded to `0cca2d5`): build exit 0, 246 pages; all merged Shivansh features present.
`check:i18n`: 6 missing; new since 2026-11-16: "30 lakh at 7% for 10 years" and "Sales executives can't be assigned leads.".
Note: with document previews, opening a lead page now records a document access for each previewed file (`document_access` log).

## Review notes (Shivansh, 2026-11-16)

- **Platform manager default password:** any non-production run (`npm run dev`, a preview without `NODE_ENV=production`) accepts `platformmanager` / `platformmanager` as a full admin. Suggest removing the default and requiring both variables everywhere.
- **Service-account key on Vercel:** keep it only in Vercel's encrypted environment variables, with least-privilege roles, scoped to the staging project until production is decided.
- `main`'s lockfile has no private-registry URLs; `.npmrc` and the handoff guide are present.
