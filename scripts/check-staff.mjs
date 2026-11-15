// API-level business rules for the staff panel. Needs `TRUST_PROXY=1 npm run dev` on :3000 and the demo accounts from setup.md.
const B = process.env.BASE || 'http://localhost:3000/api/';
let ipN = Math.floor(Math.random() * 200);
const call = async (method, path, { token, body, ip } = {}) => {
  const res = await fetch(B + path, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'x-forwarded-for': ip || `10.9.${ipN}.${Math.floor(Math.random() * 250)}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { s: res.status, d: await res.json().catch(() => ({})) };
};
let failed = 0;
const ok = (c, m, extra) => {
  if (!c) failed++;
  console.log(c ? 'PASS' : 'FAIL', m, c ? '' : JSON.stringify(extra ?? '').slice(0, 300));
};
const login = async (email, password) => (await call('POST', 'staffLogin', { body: { email, password } })).d.accessToken;
const meta = { channel: 'web_form', consent: { accepted: true, version: 'e2e', text: 'e2e' }, source: { page: '/contact', utm: { source: 'e2e', campaign: 'e2e-run' } } };
const n = Date.now().toString().slice(-7);
const newLead = async (suffix, token) => {
  const r = await call('POST', 'leads/contact', { token, body: { name: `E2E ${suffix}`, email: `e2e${n}${suffix}@example.com`, mobile_no: `98${n}${suffix}`.slice(0, 10), message: 'E2E check', _meta: meta } });
  return r.d.leadId;
};

const admin = await login('admin@probiz.com', 'Admin@12345');
const neha = await login('neha@probiz.com', 'Staff@1234');
const arjun = await login('arjun@probiz.com', 'Staff@1234');
ok(admin && neha && arjun, 'staff logins');
const nehaId = (await call('GET', 'admin/me', { token: neha })).d.data.id;
const arjunId = (await call('GET', 'admin/me', { token: arjun })).d.data.id;

const before = (await call('GET', 'admin/overview', { token: neha })).d.data.totals;
const id = await newLead('1');
ok(id, 'lead created');
const url = `admin/leads/contact/${id}`;
const after = (await call('GET', 'admin/overview', { token: neha })).d.data.totals;
ok(after.unassigned === before.unassigned + 1, 'new lead adds to the pick-up pool', { before, after });

let r = await call('GET', url, { token: arjun });
ok(r.s === 200 && !r.d.data.assignedTo, 'any employee can open an unassigned lead');
r = await call('PATCH', url, { token: neha, body: { claim: true } });
ok(r.s === 200 && r.d.data.assignedTo === nehaId, 'Neha picks it up');
ok((await call('GET', url, { token: arjun })).s === 403, 'Arjun can no longer open it');
ok((await call('PATCH', url, { token: arjun, body: { status: 'contacted' } })).s === 403, 'Arjun cannot change it');
r = await call('GET', 'admin/leads?type=all&limit=200&q=E2E', { token: arjun });
ok(!r.d.data.some((l) => l.id === id), "Arjun's list hides Neha's lead");

r = await call('PATCH', url, { token: neha, body: { status: 'contacted', note: 'Called, sending docs list' } });
ok(r.s === 200 && r.d.data.status === 'contacted' && r.d.data.notes.some((x) => x.text === 'Called, sending docs list'), 'status + note recorded');
ok((await call('PATCH', url, { token: neha, body: { status: 'bogus' } })).s === 400, 'unknown status rejected');
ok((await call('PATCH', url, { token: neha, body: { assignTo: arjunId } })).s === 403, 'employee cannot reassign');
ok((await call('DELETE', url, { token: neha })).s === 403, 'employee cannot delete');

r = await call('PATCH', url, { token: admin, body: { assignTo: arjunId } });
ok(r.s === 200 && r.d.data.assignedTo === arjunId, 'admin reassigns to Arjun');
ok((await call('GET', url, { token: neha })).s === 403 && (await call('GET', url, { token: arjun })).s === 200, 'access follows the new owner');
r = await call('PATCH', url, { token: admin, body: { assignTo: null } });
ok(r.s === 200 && !r.d.data.assignedTo, 'admin moves it back to the pool');

// Closed leads should not sit in anyone's pick-up pool.
await call('PATCH', url, { token: admin, body: { status: 'lost' } });
const pool = (await call('GET', 'admin/overview', { token: neha })).d.data;
ok(!pool.pool.some((l) => l.id === id), 'closed unassigned lead is not offered for pick-up', pool.pool.map((l) => l.id));
ok(pool.totals.unassigned === before.unassigned, 'pool count excludes closed leads', { before: before.unassigned, now: pool.totals.unassigned });

// Employee sidebar badges count new leads they can see (theirs + pool), per product.
const id2 = await newLead('2');
const ov = (await call('GET', 'admin/overview', { token: arjun })).d.data;
const contact = ov.byType.find((t) => t.type === 'contact');
ok(contact && contact.open >= 1, 'employee product badges include the pool', ov.byType);

// Customer link: a signed-in customer's lead shows their name and email to staff.
const cust = await call('POST', 'userLogin', { body: { user_Email: 'priya@example.com', password: 'Demo@1234' } });
if (cust.d.accessToken) {
  const id3 = await newLead('3', cust.d.accessToken);
  r = await call('GET', `admin/leads/contact/${id3}`, { token: admin });
  ok(Boolean(r.d.data.customer?.name) && r.d.data.customer?.email === 'priya@example.com', 'lead page shows the linked customer', r.d.data.customer);
  await call('DELETE', `admin/leads/contact/${id3}`, { token: admin });
} else console.log('SKIP customer link (priya not found)');

// Analytics: first response is credited to whoever acted first.
r = await call('GET', 'admin/overview?analytics=1&days=7', { token: admin });
const team = r.d.data.analytics.team;
ok(team.find((t) => t.id === nehaId)?.medianResponseMs !== null, 'Neha has a first-response time', team);
ok((await call('GET', 'admin/overview?analytics=1', { token: neha })).d.data.analytics === undefined, 'employees get no admin analytics');

// Leads list date filter (used by range-scoped dashboard links).
const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
r = await call('GET', `admin/leads?type=all&limit=200&from=${today}&to=${today}&q=E2E`, { token: admin });
ok(r.s === 200 && r.d.data.some((l) => l.id === id2), 'leads list filters by date range');
r = await call('GET', `admin/leads?type=all&limit=200&from=2001-01-01&to=2001-01-02&q=E2E`, { token: admin });
ok(r.d.total === 0, 'empty range returns nothing', r.d.total);

// Admin-only data stays admin-only, and never includes password hashes.
ok((await call('GET', 'getAllUsers', { token: neha })).s === 403, 'employee blocked from customer list');
r = await call('GET', 'getAllUsers', { token: admin });
ok(r.s === 200 && r.d.data.length && r.d.data.every((u) => !('password' in u)), 'customer list has no password hashes');
r = await call('GET', 'admin/employees', { token: admin });
ok(r.d.data.every((e) => !('password' in e)), 'employee list has no password hashes');
r = await call('GET', 'admin/admins', { token: admin });
ok(r.d.data.every((e) => !('password' in e)), 'admin list has no password hashes');
ok((await call('GET', 'admin/employees', { token: neha })).s === 403, 'employee blocked from team list');

// Removing an employee returns their open leads to the pool and revokes access.
const temp = await call('POST', 'admin/employees', { token: admin, body: { name: 'Temp E2E', email: `temp${n}@probiz.com`, mobile: '9000000000', employeeId: `TMP-${n}`, password: 'Temp@1234' } });
ok(temp.s === 201, 'admin adds an employee');
const tempToken = await login(`temp${n}@probiz.com`, 'Temp@1234');
await call('PATCH', `admin/leads/contact/${id2}`, { token: tempToken, body: { status: 'in_progress' } });
ok((await call('GET', `admin/leads/contact/${id2}`, { token: admin })).d.data.assignedTo === temp.d.data._id, 'temp employee owns the lead after acting on it');
ok((await call('DELETE', `admin/employees/${temp.d.data._id}`, { token: admin })).s === 200, 'admin removes the employee');
ok((await call('GET', 'admin/me', { token: tempToken })).s === 401, "removed employee's token stops working");
r = await call('GET', `admin/leads/contact/${id2}`, { token: admin });
ok(!r.d.data.assignedTo && r.d.data.notes.some((x) => /left/.test(x.text)), 'their open lead is back in the pool');

// Passwords.
ok((await call('PUT', 'admin/me/password', { token: neha, body: { current: 'wrong', next: 'Whatever@123' } })).s === 400, 'wrong current password rejected');
ok((await call('PUT', 'admin/employees/x/password', { token: neha, body: { password: 'Whatever@123' } })).s === 403, 'employee cannot reset passwords');

for (const lid of [id, id2]) await call('DELETE', `admin/leads/contact/${lid}`, { token: admin });
ok((await call('GET', url, { token: admin })).s === 404, 'deleted lead is gone');

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
