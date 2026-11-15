// Stage 11 end-to-end role checks (admin, employee, customer, anonymous) against a running app.
// Usage: start the app with TRUST_PROXY=1 (each request uses its own test IP), then with ADMIN_PASSWORD set:
//   node scripts/check-e2e.mjs [baseUrl]
// Uses only test accounts on local data (emulators or isolated PGlite); creates one customer and one employee.
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const ADMIN = { email: process.env.ADMIN_EMAIL || "admin@probiz.com", password: process.env.ADMIN_PASSWORD };
if (!ADMIN.password) {
  console.error("Set ADMIN_PASSWORD (and ADMIN_EMAIL if different) for the local test admin account.");
  process.exit(1);
}

let failures = 0;
const check = (ok, label, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` | ${detail}` : ""}`);
};

const run = Date.now().toString().slice(-6);
let ipSeq = 0;
const ip = () => `10.92.${Number(run.slice(0, 2)) % 250}.${++ipSeq % 250}`;
const BCRYPT = /\$2[aby]\$\d\d\$/;

async function call(path, { method = "GET", body, raw, token, addr = ip() } = {}) {
  const headers = { "x-forwarded-for": addr };
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined || raw !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(`${BASE}/api/${path}`, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, data, text };
}

// ---------- Anonymous ----------
const health = await call("health");
const pub = await call("site-settings");
check(health.status === 200 && pub.status === 200 && pub.data?.data?.primaryPhone && !("updatedBy" in (pub.data?.data || {})),
  "anonymous: health and public site settings (no internal fields)");
const anon = await Promise.all(["admin/leads", "admin/overview", "admin/site-settings", "getAllUsers", "getAllEmployee", "getHomeLoan"].map((p) => call(p)));
check(anon.every((r) => r.status === 401), "anonymous: staff and customer-data endpoints return 401", anon.map((r) => r.status).join(","));
const bad = await call("userLogin", { method: "POST", raw: "{not json" });
const missing = await call("nope");
check(bad.status === 400 && missing.status === 404 && !/at .+\.js/.test(bad.text + missing.text), "malformed JSON 400, unknown route 404, no stack traces", `json=${bad.status} route=${missing.status}`);
const unsigned = [{ alg: "none" }, { id: "x", role: "admin" }].map((p) => Buffer.from(JSON.stringify(p)).toString("base64url")).join(".");
const forged = await call("admin/me", { token: `${unsigned}.` });
check(forged.status === 401, "unsigned (alg none) token is refused", `status=${forged.status}`);

// ---------- Customer ----------
const email = `e2e.${run}@example.com`;
const pw1 = `E2e!${run}a`;
const pw2 = `E2e!${run}b`;
const signup = await call("userSignUp", { method: "POST", body: { user_Email: email, user_Name: "E2E Customer", country_code: "+91", mobile_no: `98${run}77`, password: pw1, confirmPassword: pw1 } });
const login1 = await call("userLogin", { method: "POST", body: { user_Email: email, password: pw1 } });
const cust = login1.data?.accessToken;
const userId = login1.data?.data?._id;
check([200, 201].includes(signup.status) && login1.status === 200 && cust && !BCRYPT.test(signup.text + login1.text), "customer: sign-up and sign-in (no password hash in responses)", `signup=${signup.status} login=${login1.status}`);
const custAdmin = await Promise.all(["admin/overview", "admin/leads", "getAllUsers", "admin/site-settings"].map((p) => call(p, { token: cust })));
check(custAdmin.every((r) => r.status === 401 || r.status === 403), "customer token cannot reach staff endpoints", custAdmin.map((r) => r.status).join(","));
const wrongOld = await call(`changeUserPassword/${userId}`, { method: "PUT", body: { oldPassword: "Wrong!123a", newPassword: pw2, confirmPassword: pw2 } });
const changed = await call(`changeUserPassword/${userId}`, { method: "PUT", body: { oldPassword: pw1, newPassword: pw2, confirmPassword: pw2 } });
const oldLogin = await call("userLogin", { method: "POST", body: { user_Email: email, password: pw1 } });
const newLogin = await call("userLogin", { method: "POST", body: { user_Email: email, password: pw2 } });
check(wrongOld.status === 401 && changed.status === 200 && oldLogin.status === 401 && newLogin.status === 200, "customer: password change needs the old password; old one stops working",
  `wrong=${wrongOld.status} change=${changed.status} old=${oldLogin.status} new=${newLogin.status}`);

// ---------- Admin ----------
const adminLogin = await call("staffLogin", { method: "POST", body: ADMIN });
const admin = adminLogin.data?.accessToken;
const me = await call("admin/me", { token: admin });
const overview = await call("admin/overview", { token: admin });
const leads = await call("admin/leads?limit=200", { token: admin });
check(adminLogin.data?.role === "admin" && me.data?.data?.role === "admin" && overview.status === 200 && leads.status === 200 && leads.data.total > 0,
  "admin: sign-in, profile, overview and lead list", `leads=${leads.data?.total}`);
const lists = await Promise.all(["getAllUsers", "admin/employees", "admin/admins", "getAllEmployee"].map((p) => call(p, { token: admin })));
check(lists.every((r) => r.status === 200 && !BCRYPT.test(r.text) && !/"password"/.test(r.text)), "admin lists of users, employees and admins contain no password hashes",
  lists.map((r) => `${r.status}${BCRYPT.test(r.text) ? "+hash" : ""}`).join(","));
const empEmail = `e2e.emp.${run}@example.com`;
const created = await call("admin/employees", { method: "POST", token: admin, body: { name: "E2E Employee", email: empEmail, mobile: "9000000000", employeeId: `E2E-${run}`, password: "Employee1" } });
const dupEmp = await call("admin/employees", { method: "POST", token: admin, body: { name: "E2E Dup", email: empEmail.toUpperCase(), mobile: "9000000000", employeeId: `E2E-${run}-b`, password: "Employee1" } });
const empId = created.data?.data?._id;
check(created.status === 201 && empId && !BCRYPT.test(created.text) && dupEmp.status === 409, "admin: create employee (no hash returned); duplicate email in another case refused", `create=${created.status} dup=${dupEmp.status}`);
const settings = await call("admin/site-settings", { token: admin });
const invalid = await call("admin/site-settings", { method: "PUT", token: admin, body: { primaryPhone: "12" } });
const current = settings.data?.data || {};
const saved = await call("admin/site-settings", { method: "PUT", token: admin, body: { primaryPhone: current.primaryPhone, secondaryPhone: current.secondaryPhone, whatsappPhone: current.whatsappPhone, contactEmail: current.contactEmail, social: current.social } });
check(settings.status === 200 && invalid.status === 400 && invalid.data?.fields?.primaryPhone && saved.status === 200, "admin: site settings validated and saved", `get=${settings.status} invalid=${invalid.status} save=${saved.status}`);
const unknownLead = await call("admin/leads/homeloan/does-not-exist", { token: admin });
const unknownType = await call("admin/leads/nope/x", { token: admin });
const pool = (await call("admin/leads?scope=unassigned&limit=200", { token: admin })).data?.data || [];
check(unknownLead.status === 404 && unknownType.status === 404 && pool.length >= 2, "admin: unknown lead or type returns 404", `pool=${pool.length}`);
const badStatus = await call(`admin/leads/${pool[0]?.type}/${pool[0]?.id}`, { method: "PATCH", token: admin, body: { status: "nonsense" } });
const assign = await call(`admin/leads/${pool[0]?.type}/${pool[0]?.id}`, { method: "PATCH", token: admin, body: { assignTo: empId, note: "E2E assignment" } });
check(badStatus.status === 400 && assign.status === 200 && assign.data?.data?.assignedTo === empId, "admin: invalid status refused; lead assigned to the employee");

// ---------- Employee ----------
const empLogin = await call("staffLogin", { method: "POST", body: { email: empEmail, password: "Employee1" } });
const emp = empLogin.data?.accessToken;
const empMe = await call("admin/me", { token: emp });
const empLeads = (await call("admin/leads?limit=200", { token: emp })).data;
const mine = (await call("admin/leads?scope=mine&limit=200", { token: emp })).data?.data || [];
check(empLogin.data?.role === "employee" && empMe.data?.data?.id === empId && empLeads?.data.every((l) => !l.assignedTo || l.assignedTo === empId) && mine.some((l) => l.id === pool[0]?.id),
  "employee: sees own and unassigned leads only, including the assigned one", `visible=${empLeads?.total} mine=${mine.length}`);
const claim = await call(`admin/leads/${pool[1]?.type}/${pool[1]?.id}`, { method: "PATCH", token: emp, body: { status: "contacted" } });
const reassign = await call(`admin/leads/${pool[1]?.type}/${pool[1]?.id}`, { method: "PATCH", token: emp, body: { assignTo: null } });
check(claim.status === 200 && claim.data?.data?.assignedTo === empId && reassign.status === 403, "employee: working an unassigned lead claims it; reassigning is admin-only", `claim=${claim.status} reassign=${reassign.status}`);
const empForbidden = await Promise.all([
  call("admin/employees", { token: emp }), call("admin/site-settings", { token: emp }), call("admin/site-settings", { method: "PUT", token: emp, body: { primaryPhone: "9999999999" } }),
  call(`admin/leads/${pool[0]?.type}/${pool[0]?.id}`, { method: "DELETE", token: emp }), call("getAllUsers", { token: emp }), call("getHomeLoan", { token: emp }),
]);
check(empForbidden.every((r) => r.status === 403 || r.status === 401), "employee: admin-only endpoints refused", empForbidden.map((r) => r.status).join(","));
const empPw = await call("admin/me/password", { method: "PUT", token: emp, body: { current: "Employee1", next: "Employee2" } });
const empRelogin = await call("staffLogin", { method: "POST", body: { email: empEmail, password: "Employee2" } });
check(empPw.status === 200 && empRelogin.data?.role === "employee", "employee: changes own password");
const removed = await call(`admin/employees/${empId}`, { method: "DELETE", token: admin });
const afterRemoval = await call("admin/me", { token: emp });
const backToPool = await call(`admin/leads/${pool[0]?.type}/${pool[0]?.id}`, { token: admin });
check(removed.status === 200 && afterRemoval.status === 401 && backToPool.data?.data?.assignedTo === null, "removed employee's token stops working; their open leads return to the pool",
  `remove=${removed.status} token=${afterRemoval.status}`);

// ---------- Sign-in rate limit ----------
const attacker = `10.93.${Number(run.slice(0, 2)) % 250}.7`;
const codes = [];
for (let i = 0; i < 21; i += 1) codes.push((await call("userLogin", { method: "POST", addr: attacker, body: { user_Email: email, password: `Wrong!${i}aA` } })).status);
const otherIp = await call("userLogin", { method: "POST", body: { user_Email: email, password: pw2 } });
check(codes.slice(0, 20).every((s) => s === 401) && codes[20] === 429 && otherIp.status === 200, "21st password attempt from one IP within 10 minutes gets 429; other IPs unaffected", `last=${codes[20]}`);

console.log(failures ? `${failures} check(s) failed` : "All end-to-end checks passed");
process.exitCode = failures ? 1 : 0;
