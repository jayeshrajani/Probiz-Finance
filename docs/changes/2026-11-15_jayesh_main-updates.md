# Jayesh Rajani: changes on `main` (2026-11-13 to 2026-11-15)

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

## Review notes (Shivansh, 2026-11-16)

- **Platform manager default password:** any non-production run (`npm run dev`, a preview without `NODE_ENV=production`) accepts `platformmanager` / `platformmanager` as a full admin. Suggest removing the default and requiring both variables everywhere.
- **Service-account key on Vercel:** keep it only in Vercel's encrypted environment variables, with least-privilege roles, scoped to the staging project until production is decided.
- `main`'s lockfile has no private-registry URLs; `.npmrc` and the handoff guide are present.
