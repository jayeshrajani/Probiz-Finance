// Usage: npm run check:transactions (starts the Firestore emulator, runs this file, stops the emulator).
// Stage 8 concurrency checks on a fresh PGlite folder (under %USERPROFILE%\probiz-baseline) and on the Firestore
// emulator: rollback, retries, duplicate-safe creates, the seven-day lead merge, lead claims, lost updates,
// rate limits, backfill and employee removal, through the real controllers and intake code.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomBytes } = require('crypto');

const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '').trim();
if (!process.env.FIRESTORE_EMULATOR_HOST || !project.startsWith('demo-')) {
  console.error('Run this through `npm run check:transactions` (Firestore emulator with a demo- project only).');
  process.exit(1);
}
if ((process.env.DATABASE_URL || '').trim()) {
  console.error('Refusing to run: DATABASE_URL is set. These tests only use a fresh local PGlite folder.');
  process.exit(1);
}

const repoData = path.resolve(__dirname, '..', '.data').toLowerCase();
const runDir = path.join(os.homedir(), 'probiz-baseline', 'stage8-tx', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const pgliteDir = path.join(runDir, 'pglite');
if (pgliteDir.toLowerCase().startsWith(repoData)) {
  console.error('Refusing to run: the test database must not be inside the repository .data folder.');
  process.exit(1);
}
fs.mkdirSync(runDir, { recursive: true });
process.env.PGLITE_DIR = pgliteDir;
process.env.FIRESTORE_SCAN_LIMIT = '500';
// Controllers need a signing secret; this random one exists only in this process.
process.env.JWT_SECRET ||= randomBytes(32).toString('hex');
for (const key of Object.keys(process.env)) if (key.startsWith('WHATSAPP_')) delete process.env[key];

const data = require('../server/data');
const firestore = require('../server/data/firestore');
const { closeFirebase } = require('../server/firebase/admin');
const { transaction } = require('../server/odm');
const Lead = require('../server/models/lead.model');
const LeadEvent = require('../server/models/leadEvent.model');
const Area = require('../server/models/area.model');
const Employee = require('../server/models/employee.model');
const { byType } = require('../server/admin/leads');
const { upsertLead } = require('../server/leads/intake');
const { backfillLeads } = require('../server/leads/backfill');
const { allow } = require('../server/leads/rateLimit');
const panel = require('../server/controllers/adminPanel.controller');
const adminCtl = require('../server/controllers/admin.controller');
const userCtl = require('../server/controllers/user.controller');
const employeeCtl = require('../server/controllers/employee.controller');

const ADMIN = { id: 'admin-check', role: 'admin', name: 'Check Admin', email: 'check.admin@example.com' };
const statuses = (results) => results.map((r) => r.status).sort((a, b) => a - b);
const countOf = (list, value) => list.filter((v) => v === value).length;

// Calls an Express-style handler with a mock response and resolves with { status, body }.
function call(handler, req) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('handler did not respond')), 60000);
    const done = (body) => { clearTimeout(timer); resolve({ status: res.code, body }); return res; };
    const res = { code: 200, status(c) { res.code = c; return res; }, json: done, send: done };
    Promise.resolve(handler({ query: {}, params: {}, headers: {}, ...req }, res)).catch((err) => { clearTimeout(timer); reject(err); });
  });
}

const employee = (n) => Employee.create({ name: `Advisor ${n}`, email: `advisor${n}@example.com`, mobile: '9000000000', roll: 'Advisor', password: 'x', employeeId: `EMP-${n}` });
const newLead = (extra = {}) => Lead.create({ type: 'homeloan', formKey: byType.homeloan.formKey, refId: `ref-${randomBytes(4).toString('hex')}`, name: 'Check', status: 'new', lastActivityAt: new Date(), source: { channel: 'web_form' }, ...extra });

const scenarios = [];
const S = (name, run) => scenarios.push({ name, run });

S('rollback discards writes and after-commit work', async ({ backend }) => {
  let after = 0;
  const err = await transaction(async (tx) => {
    await Area.create({ name: 'Rollback Area' });
    tx.afterCommit(() => { after += 1; });
    throw new Error('boom');
  }).catch((e) => e);
  const found = await Area.findOne({ name: 'Rollback Area' }).lean();
  return { ok: err?.message === 'boom' && !found && after === 0, detail: `error=${err?.message} found=${Boolean(found)} after=${after} (${backend})` };
});

S('commit, then after-commit sees the data', async () => {
  let seen = null;
  await transaction(async (tx) => {
    await Area.create({ name: 'Commit Area' });
    tx.afterCommit(async () => { seen = await Area.findOne({ name: 'Commit Area' }).lean(); });
  });
  return { ok: Boolean(seen), detail: `seen=${Boolean(seen)}` };
});

S('retried attempt is undone and redone once', async ({ backend }) => {
  let attempts = 0;
  const doc = new LeadEvent({ leadId: 'retry-check', type: 'check.retry', at: new Date() });
  await transaction(async () => {
    attempts += 1;
    await doc.save();
    if (attempts === 1) {
      const err = new Error('simulated conflict');
      err.code = backend === 'postgres' ? '40001' : 10; // serialization failure / ABORTED
      throw err;
    }
  });
  const rows = await LeadEvent.find({ leadId: 'retry-check' }).lean();
  return { ok: attempts === 2 && rows.length === 1 && doc.$isNew === false, detail: `attempts=${attempts} rows=${rows.length}` };
});

S('6 parallel creates of a unique area name', async () => {
  const results = await Promise.allSettled(Array.from({ length: 6 }, () => Area.create({ name: 'Race Area' })));
  const ok = countOf(results.map((r) => r.status), 'fulfilled');
  const dup = results.filter((r) => r.status === 'rejected' && r.reason?.code === 11000).length;
  const stored = await Area.countDocuments({ name: 'Race Area' });
  return { ok: ok === 1 && dup === 5 && stored === 1, detail: `created=${ok} duplicate=${dup} stored=${stored}` };
});

S('6 parallel submissions from one phone (seven-day merge)', async () => {
  const def = byType.homeloan;
  const phone = '9876500100';
  const recs = await Promise.all(Array.from({ length: 6 }, (_, i) => def.model.create({ fullName: `Race ${i}`, contactNumber: phone })));
  const ctx = { def, mode: 'new', channel: 'web_form', meta: { consent: { accepted: true, version: 'check' }, source: {} }, userId: null };
  const out = await Promise.allSettled(recs.map((r) => upsertLead(ctx, String(r._id), {})));
  const leads = await Lead.find({ dedupeKey: `homeloan:${phone}` }).lean();
  const events = leads[0] ? await LeadEvent.find({ leadId: String(leads[0]._id) }).lean() : [];
  const refs = new Set(leads[0]?.refIds || []);
  const ok = out.every((r) => r.status === 'fulfilled') && leads.length === 1 && leads[0].repeatCount === 5 &&
    refs.size === 6 && recs.every((r) => refs.has(String(r._id))) &&
    countOf(events.map((e) => e.type), 'lead.created') === 1 && countOf(events.map((e) => e.type), 'lead.repeat') === 5;
  return { ok, detail: `leads=${leads.length} repeatCount=${leads[0]?.repeatCount} refIds=${refs.size} events=${events.map((e) => e.type).sort().join(',')}` };
});

S('2 employees claim the same lead at once', async () => {
  const [a, b] = await Promise.all([employee('A'), employee('B')]);
  const lead = await newLead();
  const req = (e) => ({ params: { type: 'homeloan', id: String(lead._id) }, staff: { id: String(e._id), role: 'employee', name: e.name }, body: { claim: true } });
  const results = await Promise.all([call(panel.update, req(a)), call(panel.update, req(b))]);
  const winner = results[0].status === 200 ? a : b;
  const after = await Lead.findById(lead._id).lean();
  const assigned = await LeadEvent.find({ leadId: String(lead._id), type: 'lead.assigned' }).lean();
  const loser = results.find((r) => r.status === 403);
  const ok = statuses(results).join() === '200,403' && after.assignedTo === String(winner._id) && assigned.length === 1 &&
    loser?.body?.message === 'This lead belongs to another advisor.';
  return { ok, detail: `statuses=${statuses(results)} assignedEvents=${assigned.length}` };
});

S('status change and reassignment at once (no lost update)', async () => {
  const target = await employee('C');
  const lead = await newLead();
  const params = { type: 'homeloan', id: String(lead._id) };
  const results = await Promise.all([
    call(panel.update, { params, staff: ADMIN, body: { status: 'contacted' } }),
    call(panel.update, { params, staff: ADMIN, body: { assignTo: String(target._id) } }),
  ]);
  const after = await Lead.findById(lead._id).lean();
  const ok = statuses(results).join() === '200,200' && after.status === 'contacted' && after.assignedTo === String(target._id);
  return { ok, detail: `status=${after.status} assignedTo=${after.assignedTo === String(target._id) ? 'target' : after.assignedTo}` };
});

S('5 parallel staff-panel employee creates, same email in different case', async () => {
  const body = (i) => ({ name: 'Dup', email: i % 2 ? 'Dup.Employee@Example.com' : 'dup.employee@example.com', mobile: '9000000001', employeeId: `EMP-D${i}`, password: 'Password1' });
  const results = await Promise.all(Array.from({ length: 5 }, (_, i) => call(panel.addEmployee, { staff: ADMIN, body: body(i) })));
  const stored = await Employee.countDocuments({ email: 'dup.employee@example.com' });
  return { ok: statuses(results).join() === '201,409,409,409,409' && stored === 1, detail: `statuses=${statuses(results)} stored=${stored}` };
});

S('4 parallel staff-panel employee creates, same employee ID', async () => {
  const body = (i) => ({ name: 'Dup', email: `dup.id${i}@example.com`, mobile: '9000000001', employeeId: 'EMP-SAME', password: 'Password1' });
  const results = await Promise.all(Array.from({ length: 4 }, (_, i) => call(panel.addEmployee, { staff: ADMIN, body: body(i) })));
  const stored = await Employee.countDocuments({ employeeId: 'EMP-SAME' });
  return { ok: statuses(results).join() === '201,409,409,409' && stored === 1, detail: `statuses=${statuses(results)} stored=${stored}` };
});

S('4 parallel legacy employee creates, same email', async () => {
  const body = (i) => ({ name: 'Legacy', mobile: '9000000003', email: 'legacy.employee@example.com', roll: 'Advisor', password: 'Password1', employeeId: `EMP-L${i}` });
  const results = await Promise.all(Array.from({ length: 4 }, (_, i) => call(employeeCtl.AddEmployee, { body: body(i) })));
  const stored = await Employee.countDocuments({ email: 'legacy.employee@example.com' });
  return { ok: statuses(results).join() === '201,400,400,400' && stored === 1, detail: `statuses=${statuses(results)} stored=${stored}` };
});

S('4 parallel admin creates, same email in different case', async () => {
  const body = (i) => ({ admin_Name: 'Race', admin_Email: i % 2 ? 'Race.Admin@example.com' : 'race.admin@example.com', password: 'Admin@1234' });
  const results = await Promise.all(Array.from({ length: 4 }, (_, i) => call(adminCtl.createAdmin, { body: body(i) })));
  const Admin = require('../server/models/admin.model');
  const stored = await Admin.countDocuments({ admin_Email: 'race.admin@example.com' });
  return { ok: statuses(results).join() === '200,409,409,409' && stored === 1, detail: `statuses=${statuses(results)} stored=${stored}` };
});

S('4 parallel customer signups, same email and mobile', async () => {
  const body = { user_Email: 'race.user@example.com', user_Name: 'Race', country_code: '+91', mobile_no: '9000000002', password: 'Test@1234', confirmPassword: 'Test@1234' };
  const results = await Promise.all(Array.from({ length: 4 }, () => call(userCtl.userSignUp, { body: { ...body } })));
  const User = require('../server/models/user.model');
  const stored = await User.countDocuments({ user_Email: 'race.user@example.com' });
  return { ok: statuses(results).join() === '200,409,409,409' && stored === 1, detail: `statuses=${statuses(results)} stored=${stored}` };
});

S('8 parallel requests against a limit of 5', async () => {
  const rules = [{ key: 'lead:10.9.9.9:homeloan', limit: 5, windowSeconds: 600 }, { key: 'lead:10.9.9.9', limit: 30, windowSeconds: 86400 }];
  const results = await Promise.all(Array.from({ length: 8 }, () => allow(rules)));
  return { ok: countOf(results, true) === 5 && countOf(results, false) === 3, detail: `allowed=${countOf(results, true)} refused=${countOf(results, false)}` };
});

S('2 parallel backfills create one envelope per record, with the original time', async () => {
  const gold = byType.gold;
  const recs = await Promise.all([0, 1, 2].map((i) => gold.model.create({ fullName: `Old ${i}`, dateOfBirth: '1990-01-01', permanentAddress: 'Indore', contactNumber: `900000010${i}` })));
  const [first, second] = await Promise.all([backfillLeads(), backfillLeads()]);
  let ok = first.created + second.created === 3;
  const details = [];
  for (const rec of recs) {
    const envelopes = await Lead.find({ type: 'gold', refIds: String(rec._id) }).lean();
    const sameTime = envelopes[0] && new Date(envelopes[0].createdAt).getTime() === new Date(rec.createdAt).getTime();
    ok = ok && envelopes.length === 1 && sameTime;
    details.push(`${envelopes.length}${sameTime ? '' : '(time differs)'}`);
  }
  return { ok, detail: `created=${first.created}+${second.created} envelopes=${details.join('/')}` };
});

S('employee removal returns open leads to the pool', async () => {
  const leaving = await employee('R');
  const id = String(leaving._id);
  const [open1, open2, won] = await Promise.all([
    newLead({ assignedTo: id, assignedName: leaving.name }),
    newLead({ assignedTo: id, assignedName: leaving.name, status: 'contacted' }),
    newLead({ assignedTo: id, assignedName: leaving.name, status: 'won' }),
  ]);
  const result = await call(panel.removeEmployee, { params: { id }, staff: ADMIN });
  const after = await Promise.all([open1, open2, won].map((l) => Lead.findById(l._id).lean()));
  const events = await LeadEvent.find({ type: 'lead.unassigned', leadId: { $in: [open1, open2, won].map((l) => String(l._id)) } }).lean();
  const ok = result.status === 200 && after[0].assignedTo === null && after[1].assignedTo === null && after[2].assignedTo === id && events.length === 2;
  return { ok, detail: `status=${result.status} unassignedEvents=${events.length}` };
});

S('health ping', async () => {
  await data.adapter().ping();
  return { ok: true };
});

async function runAll(backend) {
  data.useBackend(backend);
  const out = [];
  for (const s of scenarios) {
    if (backend === 'firestore') firestore.resetStats();
    let result;
    try {
      result = await s.run({ backend });
    } catch (err) {
      result = { ok: false, detail: `threw ${err.name}: ${err.message}` };
    }
    const meter = backend === 'firestore' ? firestore.stats() : null;
    const cost = meter ? ` | reads ${meter.reads}, writes ${meter.writes}, deletes ${meter.deletes}` : '';
    console.log(`${result.ok ? 'PASS' : 'FAIL'} [${backend}] ${s.name}${result.detail ? ` | ${result.detail}` : ''}${cost}`);
    out.push(result.ok);
  }
  return out;
}

async function main() {
  console.log(`PGlite test folder: ${pgliteDir}`);
  console.log(`Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST} (project ${project}); DATABASE_URL not set`);
  const results = [...(await runAll('postgres')), ...(await runAll('firestore'))];
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
