// End-to-end check of the lead intake pipeline against a running server.
// Usage: start the app with TRUST_PROXY=1 (so each check can use its own IP), then
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/check-intake.mjs [baseUrl]
import { forms } from "../lib/forms.js";

const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN = { email: process.env.ADMIN_EMAIL || "admin@probiz.com", password: process.env.ADMIN_PASSWORD || "Admin@12345" };
const CUSTOMER = { user_Email: process.env.CUSTOMER_EMAIL || "priya@example.com", password: process.env.CUSTOMER_PASSWORD || "Demo@1234" };

let failures = 0;
const ok = (cond, label, extra) => {
  if (cond) console.log(`  ok  ${label}`);
  else {
    failures += 1;
    console.log(`  FAIL ${label}`, extra === undefined ? "" : JSON.stringify(extra).slice(0, 400));
  }
};

const run = Date.now().toString().slice(-6);
let ipSeq = 0;
const freshIp = () => `10.${run.slice(0, 2) % 250}.${Math.floor(++ipSeq / 250)}.${ipSeq % 250}`;
let phoneSeq = 0;
const freshPhone = () => `9${run}${String(++phoneSeq).padStart(3, "0")}`;

async function call(path, { method = "POST", body, form, token, ip = freshIp() } = {}) {
  const headers = { "x-forwarded-for": ip };
  if (token) headers.authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}/api/${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const meta = (extra = {}) => ({ channel: "web_form", consent: { accepted: true, version: "test" }, source: { page: "/check", utm: { source: "check" } }, ...extra });

function sampleValues(formKey, phone) {
  const values = {};
  for (const step of forms[formKey].steps) {
    for (const f of step.fields) {
      if (!f.required || (f.showIf && !f.showIf(values))) continue;
      if (f.type === "tel") values[f.name] = phone;
      else if (f.type === "email") values[f.name] = `check+${phone}@example.com`;
      else if (f.type === "number") values[f.name] = "500000";
      else if (f.type === "date") values[f.name] = "1990-01-15";
      else if (f.type === "select") values[f.name] = String(f.options[0]?.value ?? f.options[0]);
      else values[f.name] = f.name.toLowerCase().includes("name") ? "Check Person" : "Checking the intake pipeline";
    }
  }
  return values;
}

function submit(formKey, values, { metaBlock = meta(), token, ip, trap = "" } = {}) {
  const cfg = forms[formKey];
  if (cfg.json) return call(`leads/${formKey}`, { body: { ...values, _meta: metaBlock, company_website: trap }, token, ip });
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  if (metaBlock) fd.append("_meta", JSON.stringify(metaBlock));
  fd.append("company_website", trap);
  return call(`leads/${formKey}`, { form: fd, token, ip });
}

const admin = await call("staffLogin", { body: ADMIN });
if (!admin.data.accessToken) {
  console.error("Admin sign-in failed", admin);
  process.exit(1);
}
const staff = admin.data.accessToken;
const get = (path) => call(path, { method: "GET", token: staff });
const leadsTotal = async () => (await get("admin/leads?limit=1")).data.total;

console.log(`Intake checks against ${BASE}`);

console.log("\nEvery form creates a lead");
for (const formKey of Object.keys(forms)) {
  const phone = freshPhone();
  const res = await submit(formKey, sampleValues(formKey, phone));
  ok(res.status === 201 && res.data.leadId && res.data.repeat === false, `${formKey} -> 201`, res);
  if (res.data.leadId) {
    const { data } = await get(`admin/leads?q=${phone}&limit=5`);
    const row = data.data?.find((r) => r.id === res.data.leadId);
    ok(row && row.channel === "web_form" && row.status === "new", `${formKey} visible to admin`, data);
  }
}

console.log("\nValidation and consent");
{
  const bad = await submit("personalloan", { fullName: "No Phone" });
  ok(bad.status === 400 && bad.data.fields, "missing required fields -> 400 with field errors", bad);
  const badPhone = await submit("contact", { ...sampleValues("contact", "12345"), mobile_no: "12345" });
  ok(badPhone.status === 400 && badPhone.data.fields?.mobile_no, "bad mobile -> 400", badPhone);
  const noConsent = await submit("contact", sampleValues("contact", freshPhone()), { metaBlock: { channel: "web_form" } });
  ok(noConsent.status === 400, "no consent -> 400", noConsent);
  const unknown = await call("leads/not-a-form", { body: {} });
  ok(unknown.status === 404, "unknown form -> 404", unknown);
}

console.log("\nSpam trap");
{
  const before = await leadsTotal();
  const res = await submit("contact", sampleValues("contact", freshPhone()), { trap: "http://spam.example" });
  ok(res.status === 201 && !res.data.leadId, "honeypot gets a fake 201", res);
  ok((await leadsTotal()) === before, "honeypot saves nothing");
}

console.log("\nRate limit");
{
  const ip = freshIp();
  const phone = freshPhone();
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await submit("contact", sampleValues("contact", phone), { ip })).status);
  ok(codes.slice(0, 5).every((c) => c === 201) && codes[5] === 429, "6th request from one IP in 10 minutes -> 429", codes);
}

console.log("\nDuplicate merge");
{
  const phone = freshPhone();
  const first = await submit("homeloan", sampleValues("homeloan", phone));
  const second = await submit("homeloan", sampleValues("homeloan", phone));
  ok(second.data.repeat === true && second.data.leadId === first.data.leadId, "same product + phone within 7 days merges", [first.data, second.data]);
  const other = await submit("carloan", sampleValues("carloan", phone));
  ok(other.data.repeat === false && other.data.leadId !== first.data.leadId, "different product stays a separate lead", other.data);
  const detail = await get(`admin/leads/homeloan/${first.data.leadId}`);
  ok(detail.data.data?.submissions?.length === 2 && detail.data.data.lead.repeatCount === 1, "lead keeps both submissions", detail.data.data?.lead);
  ok(detail.data.data?.notes?.some((n) => n.text === "Submitted the form again"), "repeat shows in activity");
}

console.log("\nLegacy URL still works and lands in the same table");
{
  const phone = freshPhone();
  const res = await call("addContactUs", { body: { ...sampleValues("contact", phone) } });
  ok(res.status >= 200 && res.status < 300 && !res.data.leadId, "POST /api/addContactUs keeps its old response", res);
  const { data } = await get(`admin/leads?q=${phone}`);
  ok(data.data?.[0]?.channel === "legacy_api", "legacy submission becomes a lead", data.data?.[0]);
}

console.log("\nAssistant channel and customer link");
{
  const login = await call("userLogin", { body: CUSTOMER });
  const token = login.data.accessToken;
  ok(Boolean(token), "customer sign-in returns a token", login.status);
  const phone = freshPhone();
  const res = await call("leads/contact", {
    body: { ...sampleValues("contact", phone), _meta: meta({ channel: "assistant", topic: "Home loan" }) },
    token,
  });
  ok(res.status === 201, "assistant callback -> 201", res);
  const detail = await get(`admin/leads/contact/${res.data.leadId}`);
  const d = detail.data.data;
  ok(d?.lead.source?.channel === "assistant" && d.lead.source.topic === "Home loan", "channel and topic recorded", d?.lead.source);
  ok(d?.lead.consent?.accepted === true, "consent recorded", d?.lead.consent);
  ok(Boolean(d?.customer?.id), "lead linked to the signed-in customer", d?.customer);

  const patched = await call(`admin/leads/contact/${res.data.leadId}`, { method: "PATCH", body: { status: "contacted", note: "Called back" }, token: staff });
  ok(patched.data.data?.status === "contacted" && patched.data.data.notes.some((n) => n.kind === "note" && n.text === "Called back"), "status change and note become events", patched.data);
  const staffOnly = await call(`admin/leads/contact/${res.data.leadId}`, { method: "GET", token });
  ok(staffOnly.status === 401 || staffOnly.status === 403, "customer token can't read admin leads", staffOnly.status);
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll intake checks passed");
process.exit(failures ? 1 : 0);
