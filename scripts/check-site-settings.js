// Usage: npm run check:site-settings (starts the Firestore emulator, runs this file, stops the emulator).
// Stage 8.5 checks for the website settings on a fresh PGlite folder (under %USERPROFILE%\probiz-baseline) and on
// the Firestore emulator: seeding, public fields, validation, unknown fields, persistence, metadata, caching and
// concurrent saves, through the real controller.
const fs = require('fs');
const os = require('os');
const path = require('path');

const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '').trim();
if (!process.env.FIRESTORE_EMULATOR_HOST || !project.startsWith('demo-')) {
  console.error('Run this through `npm run check:site-settings` (Firestore emulator with a demo- project only).');
  process.exit(1);
}
if ((process.env.DATABASE_URL || '').trim()) {
  console.error('Refusing to run: DATABASE_URL is set. These tests only use a fresh local PGlite folder.');
  process.exit(1);
}

const repoData = path.resolve(__dirname, '..', '.data').toLowerCase();
const runDir = path.join(os.homedir(), 'probiz-baseline', 'stage85-settings', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const pgliteDir = path.join(runDir, 'pglite');
if (pgliteDir.toLowerCase().startsWith(repoData)) {
  console.error('Refusing to run: the test database must not be inside the repository .data folder.');
  process.exit(1);
}
fs.mkdirSync(runDir, { recursive: true });
process.env.PGLITE_DIR = pgliteDir;

const data = require('../server/data');
const firestore = require('../server/data/firestore');
const { closeFirebase } = require('../server/firebase/admin');
const SiteSettings = require('../server/models/siteSettings.model');
const settings = require('../server/controllers/siteSettings.controller');
const DEFAULTS = require('../content/site-settings.json');

const ADMIN = { id: 'admin-check', role: 'admin', name: 'Check Admin', email: 'check.admin@example.com' };
const PUBLIC_KEYS = 'contactEmail,primaryPhone,secondaryPhone,social,whatsappPhone';
const SOCIAL_KEYS = 'facebook,instagram,linkedin,youtube';

function call(handler, req = {}) {
  return new Promise((resolve, reject) => {
    const headers = {};
    const done = (body) => {
      resolve({ status: res.code, body, headers });
      return res;
    };
    const res = {
      code: 200,
      status(c) { res.code = c; return res; },
      setHeader(k, v) { headers[k.toLowerCase()] = v; return res; },
      json: done,
      send: done,
    };
    Promise.resolve(handler({ query: {}, params: {}, headers: {}, body: {}, staff: ADMIN, ...req }, res)).catch(reject);
  });
}
const put = (body, staff = ADMIN) => call(settings.update, { body, staff });
const stored = () => SiteSettings.findById(settings.SITE_SETTINGS_ID).lean();

const scenarios = [];
const S = (name, run) => scenarios.push({ name, run });

S('before seeding: public API returns the approved values and writes nothing', async () => {
  const res = await call(settings.getPublic);
  const count = await SiteSettings.countDocuments({});
  const ok = res.status === 200 && JSON.stringify(res.body.data) === JSON.stringify(DEFAULTS) && count === 0;
  return { ok, detail: `status=${res.status} records=${count}` };
});

S('seed creates the record once', async () => {
  const first = await settings.seedSiteSettings();
  const second = await settings.seedSiteSettings();
  const count = await SiteSettings.countDocuments({});
  const rec = await stored();
  return { ok: first.created && !second.created && count === 1 && rec.primaryPhone === '9981303887', detail: `created=${first.created}/${second.created} records=${count}` };
});

S('public response has only the approved fields', async () => {
  settings.clearCache();
  const res = await call(settings.getPublic);
  const d = res.body.data;
  const keys = Object.keys(d).sort().join(',');
  const social = Object.keys(d.social).sort().join(',');
  const cache = res.headers['cache-control'];
  const ok = keys === PUBLIC_KEYS && social === SOCIAL_KEYS && JSON.stringify(Object.keys(res.body)) === '["data"]' &&
    d.primaryPhone === '9981303887' && d.secondaryPhone === '8770052912' && d.whatsappPhone === '9981303887' &&
    d.contactEmail === 'info@probizfinance.com' && d.social.linkedin === 'https://www.linkedin.com/company/probizfinance/' &&
    d.social.facebook === 'https://www.facebook.com/srloans' && cache === 'public, max-age=60, s-maxage=60';
  return { ok, detail: `keys=${keys} cache="${cache}"` };
});

S('admin GET returns the stored values with update metadata', async () => {
  const res = await call(settings.getAdmin);
  const d = res.body.data;
  return { ok: res.status === 200 && d.saved === true && Boolean(d.updatedAt) && res.headers['cache-control'] === 'no-store' && !('updatedBy' in d), detail: `saved=${d.saved}` };
});

S('valid formats are normalised', async () => {
  const before = await stored();
  const res = await put({ primaryPhone: '+91 98765-43210', secondaryPhone: '(0731) 234 5678', whatsappPhone: '919876543210', contactEmail: '  Hello@ProbizFinance.com ' });
  const rec = await stored();
  const ok = res.status === 200 && rec.primaryPhone === '9876543210' && rec.secondaryPhone === '7312345678' && rec.whatsappPhone === '9876543210' &&
    rec.contactEmail === 'hello@probizfinance.com' && rec.updatedBy === ADMIN.id && rec.updatedByName === ADMIN.name &&
    new Date(rec.updatedAt) > new Date(before.updatedAt) && new Date(rec.createdAt).getTime() === new Date(before.createdAt).getTime();
  return { ok, detail: `stored=${rec.primaryPhone}/${rec.secondaryPhone}/${rec.whatsappPhone}/${rec.contactEmail}` };
});

S('partial update keeps the other values; empty optional values are allowed', async () => {
  const res = await put({ secondaryPhone: '', social: { youtube: '' } });
  const rec = await stored();
  const ok = res.status === 200 && rec.secondaryPhone === '' && rec.social.youtube === '' && rec.primaryPhone === '9876543210' && rec.social.linkedin === DEFAULTS.social.linkedin;
  return { ok, detail: `secondary="${rec.secondaryPhone}" youtube="${rec.social.youtube}" linkedin kept=${rec.social.linkedin === DEFAULTS.social.linkedin}` };
});

S('Delhi and Noida landlines are accepted as primary and secondary numbers', async () => {
  const res = await put({ primaryPhone: '011 2345 6789', secondaryPhone: '0120-234 5678' });
  const rec = await stored();
  const restore = await put({ primaryPhone: '9876543210', secondaryPhone: '' });
  const ok = res.status === 200 && rec.primaryPhone === '1123456789' && rec.secondaryPhone === '1202345678' && restore.status === 200;
  return { ok, detail: `status=${res.status} stored=${rec.primaryPhone}/${rec.secondaryPhone}` };
});

const INVALID = [
  ['primaryPhone', { primaryPhone: 'abc' }],
  ['primaryPhone', { primaryPhone: '12345' }],
  ['primaryPhone', { primaryPhone: '+1 9981303887' }],
  ['primaryPhone', { primaryPhone: '0000000000' }],
  ['primaryPhone', { primaryPhone: '' }],
  ['primaryPhone', { primaryPhone: { $gt: '' } }],
  ['whatsappPhone', { whatsappPhone: '011 2345 6789' }],
  ['secondaryPhone', { secondaryPhone: '99813038871' }],
  ['contactEmail', { contactEmail: 'bad@' }],
  ['contactEmail', { contactEmail: 'a@b' }],
  ['contactEmail', { contactEmail: 'x@y.com<script>' }],
  ['social.linkedin', { social: { linkedin: 'javascript:alert(1)' } }],
  ['social.linkedin', { social: { linkedin: 'http://www.linkedin.com/company/probizfinance/' } }],
  ['social.linkedin', { social: { linkedin: 'https://linkedin.com.evil.example/company/x' } }],
  ['social.linkedin', { social: { linkedin: 'https://evil.example/www.linkedin.com' } }],
  ['social.linkedin', { social: { linkedin: 'https://www.linkedin.com@evil.example/' } }],
  ['social.linkedin', { social: { linkedin: 'https://user:pass@www.linkedin.com/' } }],
  ['social.linkedin', { social: { linkedin: 'https://www.linkedin.com:8443/company/x' } }],
  ['social.linkedin', { social: { linkedin: 'https://www.youtube.com/@probizfinance' } }],
  ['social.youtube', { social: { youtube: 'data:text/html,<script>alert(1)</script>' } }],
  ['social.instagram', { social: { instagram: 'file:///etc/passwd' } }],
  ['social.facebook', { social: { facebook: 'https://facebook.com.evil.example/srloans' } }],
  ['social.facebook', { social: { facebook: 'not a url' } }],
];

S(`${INVALID.length} invalid values are rejected and nothing changes`, async () => {
  const before = JSON.stringify(await stored());
  const failures = [];
  for (const [field, body] of INVALID) {
    const res = await put(body);
    if (res.status !== 400 || !res.body.fields?.[field]) failures.push(`${JSON.stringify(body)} -> ${res.status}`);
  }
  const after = JSON.stringify(await stored());
  return { ok: failures.length === 0 && before === after, detail: failures.length ? failures.join('; ') : `all ${INVALID.length} rejected, record unchanged=${before === after}` };
});

S('unknown and internal fields are rejected', async () => {
  const before = JSON.stringify(await stored());
  const bodies = [{ updatedBy: 'x' }, { _id: 'other' }, { createdAt: '2020-01-01' }, { social: { twitter: 'https://x.com/a' } }, { isAdmin: true, primaryPhone: '9981303887' }, ['primaryPhone'], 'text'];
  const statuses = [];
  for (const body of bodies) statuses.push((await put(body)).status);
  const after = JSON.stringify(await stored());
  const count = await SiteSettings.countDocuments({});
  return { ok: statuses.every((s) => s === 400) && before === after && count === 1, detail: `statuses=${statuses.join(',')} records=${count}` };
});

S('public cache: one read, cleared by a save', async ({ backend }) => {
  settings.clearCache();
  if (backend === 'firestore') firestore.resetStats();
  const a = await call(settings.getPublic);
  const reads1 = backend === 'firestore' ? firestore.stats().reads : null;
  const b = await call(settings.getPublic);
  const reads2 = backend === 'firestore' ? firestore.stats().reads : null;
  await put({ primaryPhone: '9981303887' });
  const c = await call(settings.getPublic);
  const ok = a.body.data.primaryPhone === '9876543210' && b.body.data.primaryPhone === '9876543210' && c.body.data.primaryPhone === '9981303887' &&
    (backend !== 'firestore' || (reads1 === 1 && reads2 === 1));
  return { ok, detail: `before=${a.body.data.primaryPhone} cached=${b.body.data.primaryPhone} after save=${c.body.data.primaryPhone}${reads1 === null ? '' : ` firestore reads: first=${reads1} second=${reads2 - reads1}`}` };
});

S('5 parallel saves: all succeed, one record, last write consistent', async () => {
  const emails = [1, 2, 3, 4, 5].map((n) => `team${n}@probizfinance.com`);
  const results = await Promise.all(emails.map((contactEmail) => put({ contactEmail })));
  const rec = await stored();
  const count = await SiteSettings.countDocuments({});
  return { ok: results.every((r) => r.status === 200) && count === 1 && emails.includes(rec.contactEmail), detail: `statuses=${results.map((r) => r.status).join(',')} records=${count}` };
});

S('restore the approved values; seeding again does not overwrite', async () => {
  const res = await put({ ...DEFAULTS });
  await put({ contactEmail: 'changed@probizfinance.com' });
  const seeded = await settings.seedSiteSettings();
  const rec = await stored();
  await put({ contactEmail: DEFAULTS.contactEmail });
  settings.clearCache();
  const pub = await call(settings.getPublic);
  const ok = res.status === 200 && !seeded.created && rec.contactEmail === 'changed@probizfinance.com' && JSON.stringify(pub.body.data) === JSON.stringify(DEFAULTS);
  return { ok, detail: `seed created=${seeded.created} kept=${rec.contactEmail}`, view: pub.body.data };
});

S('stored document id and table', async ({ backend }) => {
  const rows = await SiteSettings.find({}).lean();
  return { ok: rows.length === 1 && rows[0]._id === 'contact_social' && SiteSettings.tableName === 'site_settings', detail: `${backend}: ${SiteSettings.tableName}/${rows[0]?._id}` };
});

async function runAll(backend) {
  data.useBackend(backend);
  settings.clearCache();
  const out = [];
  let view = null;
  for (const s of scenarios) {
    if (backend === 'firestore') firestore.resetStats();
    let result;
    try {
      result = await s.run({ backend });
    } catch (err) {
      result = { ok: false, detail: `threw ${err.name}: ${err.message}` };
    }
    if (result.view) view = result.view;
    console.log(`${result.ok ? 'PASS' : 'FAIL'} [${backend}] ${s.name}${result.detail ? ` | ${result.detail}` : ''}`);
    out.push(result.ok);
  }
  return { out, view };
}

async function main() {
  console.log(`PGlite test folder: ${pgliteDir}`);
  console.log(`Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST} (project ${project}); DATABASE_URL not set`);
  const pg = await runAll('postgres');
  const fs2 = await runAll('firestore');
  const same = JSON.stringify(pg.view) === JSON.stringify(fs2.view);
  console.log(`${same ? 'PASS' : 'FAIL'} [both] same public settings on both backends`);
  const results = [...pg.out, ...fs2.out, same];
  const failed = results.filter((ok) => !ok).length;
  console.log(failed ? `${failed} of ${results.length} checks failed.` : `All ${results.length} checks passed.`);
  return failed;
}

main()
  .then((failed) => { process.exitCode = failed ? 1 : 0; })
  .catch((err) => { console.error(`FAIL ${err.stack || err.message}`); process.exitCode = 1; })
  .finally(async () => {
    await closeFirebase();
    setTimeout(() => process.exit(process.exitCode), 2000).unref();
  });
