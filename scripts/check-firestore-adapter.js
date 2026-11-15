// Usage: npm run check:firestore-adapter (starts the Firestore emulator, runs this file, stops the emulator).
// Runs identical ODM operations on PGlite (a fresh folder under %USERPROFILE%\probiz-baseline) and on the Firestore
// emulator, compares the results, and estimates the Firestore reads of each operation.
const fs = require('fs');
const os = require('os');
const path = require('path');

const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '').trim();
if (!process.env.FIRESTORE_EMULATOR_HOST || !project.startsWith('demo-')) {
  console.error('Run this through `npm run check:firestore-adapter` (Firestore emulator with a demo- project only).');
  process.exit(1);
}
if ((process.env.DATABASE_URL || '').trim()) {
  console.error('Refusing to run: DATABASE_URL is set. These tests only use a fresh local PGlite folder.');
  process.exit(1);
}

const repoData = path.resolve(__dirname, '..', '.data').toLowerCase();
const runDir = path.join(os.homedir(), 'probiz-baseline', 'stage7-adapter', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const pgliteDir = path.join(runDir, 'pglite');
if (pgliteDir.toLowerCase().startsWith(repoData)) {
  console.error('Refusing to run: the test database must not be inside the repository .data folder.');
  process.exit(1);
}
fs.mkdirSync(runDir, { recursive: true });
process.env.PGLITE_DIR = pgliteDir;
process.env.FIRESTORE_PROVIDER_PREVIEW = '1';
process.env.FIRESTORE_SCAN_LIMIT = '200';

const data = require('../server/data');
const firestore = require('../server/data/firestore');
const { closeFirebase } = require('../server/firebase/admin');
const { ci } = require('../server/odm');

const modelsDir = path.join(__dirname, '..', 'server', 'models');
const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js')).sort();
const all = modelFiles.map((file) => ({ file, M: require(path.join(modelsDir, file)) }));
const m = {
  Lead: require('../server/models/lead.model'),
  LeadEvent: require('../server/models/leadEvent.model'),
  Area: require('../server/models/area.model'),
  Property: require('../server/models/property.model'),
  User: require('../server/models/user.model'),
  Employee: require('../server/models/employee.model'),
  Admin: require('../server/models/admin.model'),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 10, 0, 0));
const ids = (rows) => rows.map((r) => r._id);
const OPEN = ['new', 'contacted', 'in_progress'];

// ---------- Sample documents for the 47-model round trip ----------

const optionValue = (opt) => (Array.isArray(opt) ? opt[0] : opt);
const MATCH_SAMPLES = ['ABCDE1234F', 'SBIN0001234', '123456789012', '9876543210', '452001', '27ABCDE1234F1Z5', '62', 'sample.user@example.com'];

function sampleValue(field, p) {
  switch (field.kind) {
    case 'string': {
      if (field.enum) {
        const values = Array.isArray(field.enum) ? field.enum : field.enum.values;
        return values[values.length - 1];
      }
      const re = optionValue(field.match);
      if (re) return MATCH_SAMPLES.find((s) => re.test(s)) || `${p} sample`;
      return `${p} sample`;
    }
    case 'number': return 42;
    case 'boolean': return true;
    case 'date': return new Date('2025-03-04T05:06:07.089Z');
    case 'objectid': return '11111111-2222-4333-8444-555555555555';
    case 'mixed': return { note: p, when: new Date('2025-01-02T03:04:05.006Z'), list: [1, 'two', null], nested: { ok: true } };
    case 'array': return [sampleValue(field.of, `${p}.0`)];
    case 'nested': return Object.fromEntries(Object.entries(field.fields).map(([k, f]) => [k, sampleValue(f, `${p}.${k}`)]));
    default: return null;
  }
}

function dateTypes(fields, obj, prefix = '') {
  const out = {};
  for (const [k, f] of Object.entries(fields)) {
    const v = obj ? obj[k] : undefined;
    const p = prefix ? `${prefix}.${k}` : k;
    if (f.kind === 'date') out[p] = v instanceof Date ? 'Date' : typeof v;
    else if (f.kind === 'mixed') out[p] = v && v.when !== undefined ? `mixed.when:${v.when instanceof Date ? 'Date' : typeof v.when}` : 'mixed';
    else if (f.kind === 'nested') Object.assign(out, dateTypes(f.fields, v, p));
    else if (f.kind === 'array' && f.of.kind === 'nested' && Array.isArray(v)) Object.assign(out, dateTypes(f.of.fields, v[0], `${p}.0`));
  }
  return out;
}

function simpleUpdate(fields) {
  for (const [k, f] of Object.entries(fields)) if (f.kind === 'string' && !f.enum && !f.match && !f.unique) return { [k]: 'updated value' };
  for (const [k, f] of Object.entries(fields)) if (f.kind === 'number') return { [k]: 7 };
  return {};
}

// ---------- Scenarios (each runs once per backend) ----------

const scenarios = [];
const S = (name, run, opts = {}) => scenarios.push({ name, run, ...opts });

for (const { file, M } of all) {
  S(`model ${file}`, async () => {
    const doc = new M({ _id: `sample-${M.tableName}`, ...sampleValue({ kind: 'nested', fields: M.$fields }, '') });
    const invalid = doc.validateSync();
    await doc.save(invalid ? { validateBeforeSave: false } : undefined);
    const byId = await M.findById(doc._id).lean();
    const list = await M.find({}).lean();
    const count = await M.countDocuments({});
    const types = dateTypes(M.$fields, byId);
    const updated = await M.findByIdAndUpdate(doc._id, simpleUpdate(M.$fields), { new: true }).lean();
    const removed = await M.findByIdAndDelete(doc._id).lean();
    const after = await M.countDocuments({});
    return { invalid: invalid ? Object.keys(invalid.errors) : [], saved: doc.toJSON(), byId, list, count, types, updated, removed, after };
  });
}

S('seed dataset', async () => {
  const areaNames = ['Vijay Nagar', 'ab road', 'Bhawarkua', 'Palasia', 'Rau', 'Sudama Nagar', 'Zebra Colony', 'aerodrome'];
  for (let i = 1; i <= 40; i += 1) {
    await m.Area.create({
      _id: `area-${String(i).padStart(4, '0')}`,
      name: areaNames[i - 1] || `Area ${String(i).padStart(2, '0')}`,
      city: i % 3 ? 'Indore' : 'Dewas',
      state: 'MP',
      pinCode: i % 4 ? `4520${String(i).padStart(2, '0')}` : '',
      isActive: i % 5 !== 0,
      deleteFlag: i % 7 === 0,
    });
    await sleep(3);
  }
  const leads = [
    { type: 'homeloan', status: 'new', assignedTo: null, channel: 'website', day: 1, refs: ['ref-1'], amount: '500000' },
    { type: 'homeloan', status: 'contacted', assignedTo: 'emp-0001', channel: 'assistant', day: 2, refs: ['ref-2', 'ref-3'] },
    { type: 'personal', status: 'new', assignedTo: null, channel: 'website', day: 3, refs: ['ref-4'] },
    { type: 'homeloan', status: 'won', assignedTo: 'emp-0002', channel: 'staff', day: 4, refs: ['ref-5'] },
    { type: 'personal', status: 'in_progress', assignedTo: 'emp-0001', channel: 'assistant', day: null, refs: ['ref-6', 'ref-7'] },
    { type: 'homeloan', status: 'lost', assignedTo: null, channel: 'website', day: 6, refs: [] },
    { type: 'business', status: 'new', assignedTo: 'emp-0002', channel: 'website', day: 7, refs: ['ref-8'] },
    { type: 'homeloan', status: 'new', assignedTo: null, channel: 'whatsapp', day: null, refs: ['ref-9'] },
    { type: 'business', status: 'contacted', assignedTo: null, channel: 'website', day: 9, refs: ['ref-10'] },
    { type: 'personal', status: 'won', assignedTo: 'emp-0003', channel: 'assistant', day: 10, refs: ['ref-11'] },
  ];
  for (const [i, l] of leads.entries()) {
    const n = i + 1;
    await m.Lead.create({
      _id: `lead-${String(n).padStart(4, '0')}`,
      type: l.type,
      refId: l.refs[l.refs.length - 1] || `ref-none-${n}`,
      refIds: l.refs,
      name: `Lead ${n}`,
      phone: `90000000${String(n).padStart(2, '0')}`,
      amount: l.amount || null,
      status: l.status,
      assignedTo: l.assignedTo,
      source: n === 1 ? { channel: 'website' } : { channel: l.channel, utm: { campaign: `c${n}` } },
      consent: { accepted: true, version: 'v1', at: D(n) },
      dedupeKey: `${l.type}:90000000${String(n).padStart(2, '0')}`,
      repeatCount: n % 3,
      ...(l.day === null ? {} : { lastActivityAt: D(l.day) }),
    });
    await sleep(3);
  }
  for (let i = 1; i <= 30; i += 1) {
    await m.User.create({
      _id: `user-${String(i).padStart(4, '0')}`,
      user_Name: `User ${i}`,
      user_Email: i === 1 ? 'Priya.Sharma@Example.com' : `user${i}@example.com`,
      ...(i % 3 === 0 ? {} : { country_code: i % 2 ? '+91' : '+1' }),
      mobile_no: `98000000${String(i).padStart(2, '0')}`,
      password: `hash-${i}`,
      deleteFlag: false,
    });
    await sleep(3);
  }
  for (let i = 1; i <= 3; i += 1) {
    await m.Employee.create({ _id: `emp-${String(i).padStart(4, '0')}`, name: `Emp ${i}`, mobile: `97000000${i}0`, email: `e${i}@probiz.test`, roll: 'advisor', password: 'hash', employeeId: `E${i}` });
    await sleep(3);
  }
  for (let i = 1; i <= 2; i += 1) {
    await m.Admin.create({ _id: `admin-${i}`, admin_Name: `Admin ${i}`, admin_Email: `admin${i}@probiz.test`, password: 'hash' });
    await sleep(3);
  }
  const props = [
    { price: 150000, city: 'Indore', propertyType: 'plot', areaName: 'Vijay Nagar' },
    { price: 2500000, city: 'Indore', propertyType: 'flat', areaName: 'Sudama Nagar' },
    { price: 5500000, city: 'Dewas', propertyType: 'house', areaName: 'Rau' },
    { price: 900000, city: 'Indore', propertyType: 'flat', areaName: 'Palasia' },
    { price: 7500000, city: 'indore', propertyType: 'house', areaName: 'nagar heights' },
    { price: 0, city: 'Dewas', propertyType: 'plot', areaName: '' },
  ];
  for (const [i, p] of props.entries()) {
    await m.Property.create({ _id: `prop-${i + 1}`, ownerName: `Owner ${i + 1}`, propertyName: `Prop ${i + 1}`, ...p });
    await sleep(3);
  }
  for (let i = 1; i <= 6; i += 1) {
    await m.LeadEvent.create({ _id: `event-${i}`, leadId: i <= 4 ? 'lead-0001' : 'lead-0002', type: 'lead.note_added', at: D(i), actor: { kind: 'staff', name: 'Admin 1' }, data: { text: `note ${i}` } });
    await sleep(3);
  }
  return { areas: await m.Area.countDocuments({}), leads: await m.Lead.countDocuments({}), users: await m.User.countDocuments({}) };
});

S('findById existing', () => m.Lead.findById('lead-0003').lean());
S('findById missing', () => m.Lead.findById('lead-9999').lean());
S('findById invalid id', () => m.Lead.findById('a/b').lean());
S('equality', async () => ids(await m.Lead.find({ type: 'homeloan' }).lean()));
S('two equalities', async () => ids(await m.Lead.find({ type: 'homeloan', status: 'new' }).lean()));
S('no filter, default order', async () => ids(await m.Area.find({}).lean()));
S('sort createdAt desc', async () => ids(await m.Area.find({ deleteFlag: false }).sort({ createdAt: -1 }).lean()));
S('sort name asc', async () => ids(await m.Area.find({ deleteFlag: false }).sort({ name: 1 }).lean()));
S('sort _id desc', async () => ids(await m.Area.find({ deleteFlag: false }).sort({ _id: -1 }).lean()));
S('sort string spec', async () => ids(await m.Area.find({}).sort('-isActive name').lean()));
S('sort missing values asc', async () => ids(await m.User.find({}).sort({ country_code: 1 }).lean()));
S('sort missing values desc', async () => ids(await m.User.find({}).sort({ country_code: -1 }).lean()));
S('sort null values desc', async () => ids(await m.Lead.find({}).sort({ lastActivityAt: -1 }).lean()));
S('page by name (pushdown)', async () => ids(await m.Area.find({ deleteFlag: false }).sort({ name: 1 }).skip(5).limit(5).lean()));
S('page by createdAt desc', async () => ids(await m.Area.find({ deleteFlag: false }).sort({ createdAt: -1 }).skip(3).limit(4).lean()));
S('page, sort field missing on some docs', async () => ids(await m.User.find({ deleteFlag: false }).sort({ country_code: -1 }).skip(0).limit(5).lean()));
S('page with regex filter', async () => ids(await m.Area.find({ city: /indore/i }).sort({ name: 1 }).skip(2).limit(3).lean()));
S('limit only', async () => ids(await m.Area.find({}).limit(3).lean()));
S('count equality', () => m.Lead.countDocuments({ status: 'new' }));
S('count all', () => m.Area.countDocuments({}));
S('count with regex', () => m.Area.countDocuments({ name: /nagar/i }));
S('$in', async () => ids(await m.Lead.find({ status: { $in: OPEN } }).lean()));
S('$in with null', async () => ids(await m.Lead.find({ assignedTo: { $in: [null, 'emp-0001'] } }).lean()));
S('$in empty', async () => ids(await m.Lead.find({ status: { $in: [] } }).lean()));
S('number range', async () => ids(await m.Property.find({ price: { $gte: 200000, $lte: 6000000 } }).lean()));
S('date range', async () => ids(await m.Lead.find({ lastActivityAt: { $gte: D(3) } }).lean()));
S('createdAt range', async () => {
  const rows = await m.Area.find({}).sort({ createdAt: 1 }).lean();
  return ids(await m.Area.find({ createdAt: { $gte: rows[10].createdAt } }).lean());
});
S('$ne on _id', async () => ids(await m.Area.find({ _id: { $ne: 'area-0002' }, deleteFlag: false }).lean()));
S('$ne null', async () => ids(await m.Lead.find({ assignedTo: { $ne: null } }).lean()));
S('$ne value', async () => ids(await m.Lead.find({ status: { $ne: 'won' } }).lean()));
S('$nin', async () => ids(await m.Lead.find({ status: { $nin: ['won', 'lost'] } }).lean()));
S('$exists true', async () => ids(await m.User.find({ country_code: { $exists: true } }).lean()));
S('$exists false', async () => ids(await m.User.find({ country_code: { $exists: false } }).lean()));
S('$or (native)', async () => ids(await m.Employee.find({ $or: [{ email: 'e2@probiz.test' }, { employeeId: 'E3' }] }).lean()));
S('$or with regex', async () => ids(await m.Area.find({ $or: [{ name: /palasia/i }, { city: /dewas/i }] }).lean()));
S('$and', async () => ids(await m.Lead.find({ $and: [{ type: 'homeloan' }, { status: 'new' }] }).lean()));
S('$nor', async () => ids(await m.Lead.find({ $nor: [{ status: 'won' }, { type: 'personal' }] }).lean()));
S('regex exact, case-insensitive', () => m.Area.findOne({ name: { $regex: new RegExp('^vijay nagar$', 'i') }, deleteFlag: false }).lean());
S('regex contains', async () => ids(await m.Property.find({ areaName: { $regex: new RegExp('nagar', 'i') } }).lean()));
S('RegExp value', async () => ids(await m.Area.find({ city: new RegExp('dew', 'i') }).lean()));
S('$regex string with $options', async () => ids(await m.Area.find({ name: { $regex: 'ROAD', $options: 'i' } }).lean()));
S('array contains', async () => ids(await m.Lead.find({ refIds: 'ref-3' }).lean()));
S('array $in', async () => ids(await m.Lead.find({ refIds: { $in: ['ref-3', 'ref-7'] } }).lean()));
S('array equality', async () => ids(await m.Lead.find({ refIds: ['ref-1'] }).lean()));
S('null, field with default null', async () => ids(await m.Lead.find({ assignedTo: null }).lean()));
S('null, field without default', async () => ids(await m.User.find({ country_code: null }).lean()));
S('nested path', async () => ids(await m.Lead.find({ 'source.channel': 'assistant' }).lean()));
S('nested path $in', async () => ids(await m.Lead.find({ 'source.channel': { $in: ['assistant', 'whatsapp'] } }).lean()));
S('Mixed object equality', async () => ids(await m.Lead.find({ source: { channel: 'website' } }).lean()));
S('date equality', async () => ids(await m.Lead.find({ lastActivityAt: D(2) }).lean()));
S('ci (lower-case copy)', () => m.Area.findOne({ name: ci('PALASIA') }).lean());
S('ci email', () => m.User.findOne({ user_Email: ci('PRIYA.SHARMA@EXAMPLE.COM') }).lean());
S('ci without copy (in memory)', async () => ids(await m.Property.find({ city: ci('INDORE') }).lean()));
S('unsupported operator', () => m.Lead.find({ status: { $foo: 1 } }).lean());
S('invalid field path', () => m.Lead.find({ 'bad path': 1 }).lean());
S('unique violation', () => m.Area.create({ _id: 'area-dup', name: 'Palasia' }));
S('validation error', () => m.Lead.create({ _id: 'lead-bad' }));
S('findOne without sort (earliest)', () => m.Lead.findOne({ type: 'homeloan' }).lean());
S('dedupe-style findOne', () => m.Lead.findOne({ dedupeKey: 'homeloan:9000000002', status: { $in: OPEN }, lastActivityAt: { $gte: D(0) } }).sort({ lastActivityAt: -1 }).lean());
S('findByIdAndUpdate new', () => m.Lead.findByIdAndUpdate('lead-0002', { status: 'contacted', assignedTo: 'emp-0002' }, { new: true }).lean());
S('findByIdAndUpdate returns old', () => m.Lead.findByIdAndUpdate('lead-0003', { amount: '750000' }).lean());
S('update with runValidators', () => m.Area.findByIdAndUpdate('area-0003', { name: '' }, { new: true, runValidators: true }).lean());
S('$set update', () => m.User.findByIdAndUpdate('user-0001', { $set: { password: 'new-hash' } }, { new: true }).lean());
S('save after modify', async () => {
  const doc = await m.Lead.findById('lead-0004');
  doc.status = 'won';
  doc.refIds.push('ref-x');
  await doc.save();
  return m.Lead.findById('lead-0004').lean();
});
S('partial save after select', async () => {
  const doc = await m.User.findById('user-0002').select('-country_code');
  doc.user_Name = 'Renamed';
  await doc.save();
  return m.User.findById('user-0002').lean();
});
S('unset a default-null field', async () => {
  await m.Lead.findByIdAndUpdate('lead-0005', { assignedTo: undefined });
  return { doc: await m.Lead.findById('lead-0005').lean(), nullMatches: ids(await m.Lead.find({ assignedTo: null }).lean()) };
});
S('deleteMany', async () => ({ result: await m.LeadEvent.deleteMany({ leadId: 'lead-0001' }), left: ids(await m.LeadEvent.find({}).lean()) }));
S('findByIdAndDelete', async () => ({ removed: await m.Lead.findByIdAndDelete('lead-0010').lean(), count: await m.Lead.countDocuments({}) }));
S('other ODM methods', async () => ({
  exists: await m.Area.exists({ name: 'Rau' }),
  estimated: await m.Area.estimatedDocumentCount(),
  inserted: ids((await m.Admin.insertMany([{ _id: 'admin-3', admin_Name: 'A3', admin_Email: 'a3@probiz.test', password: 'h' }])).map((d) => d.toObject())),
  updateOne: await m.Admin.updateOne({ admin_Email: 'a3@probiz.test' }, { admin_Name: 'A3b' }),
  updateMany: await m.Admin.updateMany({ deleteFlag: false }, { deleteFlag: false }),
  findOneAndDelete: (await m.Admin.findOneAndDelete({ _id: 'admin-3' }).lean())?._id,
  deleteOne: await m.Admin.deleteOne({ _id: 'admin-404' }),
}));
S('JSON serialisation', async () => JSON.parse(JSON.stringify(await m.Lead.findById('lead-0001'))));
S('value types', async () => {
  const doc = await m.Lead.findById('lead-0001').lean();
  return { lastActivityAt: doc.lastActivityAt instanceof Date, consentAt: typeof doc.consent.at, createdAt: doc.createdAt instanceof Date };
});
S('defaults', () => m.Lead.create({ _id: 'lead-def', type: 'personal', refId: 'r-def' }).then((d) => d.toObject()));
S('scan limit guard', async () => {
  process.env.FIRESTORE_SCAN_LIMIT = '10';
  try {
    return ids(await m.Area.find({ city: /i/i }).lean());
  } finally {
    process.env.FIRESTORE_SCAN_LIMIT = '200';
  }
}, { expected: (pg, fsr) => Array.isArray(pg.ok) && fsr.error && fsr.error.name === 'FirestoreScanLimitError' });

// ---------- Runner ----------

function canon(value) {
  const norm = (v, key) => {
    if ((key === 'createdAt' || key === 'updatedAt') && v) return '<timestamp>';
    if (Array.isArray(v)) return v.map((x) => norm(x));
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k], k)]));
    return v;
  };
  return JSON.stringify(norm(JSON.parse(JSON.stringify(value === undefined ? null : value))));
}

async function attempt(fn) {
  try {
    return { ok: await fn() };
  } catch (err) {
    return { error: { name: err.name, code: err.code ?? null, message: err.message } };
  }
}

async function runAll(backend) {
  data.useBackend(backend);
  const out = {};
  for (const s of scenarios) {
    if (backend === 'firestore') firestore.resetStats();
    out[s.name] = { result: await attempt(s.run), meter: backend === 'firestore' ? firestore.stats() : null };
  }
  return out;
}

async function main() {
  console.log(`PGlite test folder: ${pgliteDir}`);
  console.log(`Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST} (project ${project}); DATABASE_URL not set`);
  console.log(`Models loaded: ${all.length}`);

  const pg = await runAll('postgres');
  const [coll] = await require('../server/db').query('SELECT datcollate FROM pg_database WHERE datname = current_database()');
  console.log(`PGlite collation: ${coll.datcollate}`);
  const fsr = await runAll('firestore');

  let failed = 0;
  const rows = [];
  for (const s of scenarios) {
    const a = pg[s.name].result;
    const b = fsr[s.name].result;
    const same = canon(a) === canon(b);
    const ok = s.expected ? s.expected(a, b) : same;
    if (!ok) failed += 1;
    const label = s.expected ? 'EXPECTED-DIFF' : ok ? 'PASS' : 'FAIL';
    const meter = fsr[s.name].meter;
    rows.push(`${ok ? label : 'FAIL'} ${s.name} | reads ${meter.reads}, writes ${meter.writes}, deletes ${meter.deletes}, queries ${meter.queries}`);
    if (!ok) {
      console.log(`  postgres:  ${canon(a).slice(0, 600)}`);
      console.log(`  firestore: ${canon(b).slice(0, 600)}`);
    }
  }
  rows.forEach((r) => console.log(r));
  const errored = scenarios.filter((s) => pg[s.name].result.error || fsr[s.name].result.error)
    .map((s) => `${s.name} (postgres: ${pg[s.name].result.error?.name || 'ok'}, firestore: ${fsr[s.name].result.error?.name || 'ok'})`);
  console.log(`Scenarios ending in an error: ${errored.length ? errored.join('; ') : 'none'}`);
  const modelRows = scenarios.filter((s) => s.name.startsWith('model '));
  const modelOk = modelRows.filter((s) => canon(pg[s.name].result) === canon(fsr[s.name].result)).length;
  const invalidSamples = modelRows.filter((s) => pg[s.name].result.ok && pg[s.name].result.ok.invalid.length);
  console.log(`Model compatibility: ${modelOk}/${modelRows.length} models identical on both backends`);
  if (invalidSamples.length) console.log(`Samples saved without validation: ${invalidSamples.map((s) => s.name).join(', ')}`);
  console.log(failed ? `${failed} scenario(s) failed.` : `All ${scenarios.length} scenarios passed.`);
  return failed;
}

main()
  .then((failed) => { process.exitCode = failed ? 1 : 0; })
  .catch((err) => { console.error(`FAIL ${err.stack || err.message}`); process.exitCode = 1; })
  .finally(async () => {
    await closeFirebase();
    setTimeout(() => process.exit(process.exitCode), 2000).unref();
  });
