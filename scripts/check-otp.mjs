// End-to-end check of mobile OTP sign-in, NUL leads, conversion on application, number verification and cleanup.
// Usage: start the app with OTP_DEV_MODE=1 (codes come back in the response), TRUST_PROXY=1 and CRON_SECRET set, then
//   ADMIN_PASSWORD=... CUSTOMER_PASSWORD=... CRON_SECRET=... node scripts/check-otp.mjs [baseUrl]
// Optional: OTP_PURGE_DB=<separate PGlite copy> also checks the 7-day removal in-process with a back-dated lead.
import { createRequire } from "node:module";
import { forms } from "../lib/forms.js";

const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN = { email: process.env.ADMIN_EMAIL || "admin@probiz.com", password: process.env.ADMIN_PASSWORD };
const CUSTOMER = { user_Email: process.env.CUSTOMER_EMAIL || "priya@example.com", password: process.env.CUSTOMER_PASSWORD };
if (!ADMIN.password || !CUSTOMER.password || !process.env.CRON_SECRET) {
  console.error("Set ADMIN_PASSWORD, CUSTOMER_PASSWORD and CRON_SECRET (the same value as the app).");
  process.exit(1);
}

let failures = 0;
const ok = (cond, label, extra) => {
  if (cond) console.log(`  ok  ${label}`);
  else {
    failures += 1;
    console.log(`  FAIL ${label}`, extra === undefined ? "" : JSON.stringify(extra).slice(0, 400));
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = Date.now().toString().slice(-6);
let ipSeq = 0;
const freshIp = () => `10.${(Number(run.slice(0, 2)) % 250) + 1}.${Math.floor(++ipSeq / 250)}.${ipSeq % 250}`;
const freshPhone = (n) => `9${run}${String(n).padStart(3, "0")}`;

async function call(path, { method = "POST", body, form, token, ip = freshIp(), headers: extra = {} } = {}) {
  const headers = { "x-forwarded-for": ip, ...extra };
  if (token) headers.authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}/api/${path}`, { method: body === undefined && !form ? (method === "POST" ? "GET" : method) : method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
const get = (path, opts = {}) => call(path, { ...opts, method: "GET" });
const meta = { channel: "web_form", consent: { accepted: true, version: "test" }, source: { page: "/check-otp" } };

function homeLoan(phone, token) {
  const values = {};
  for (const step of forms.homeloan.steps) {
    for (const f of step.fields) {
      if (!f.required || (f.showIf && !f.showIf(values))) continue;
      values[f.name] = f.type === "tel" ? phone : f.type === "number" ? "500000" : f.type === "date" ? "1990-01-15" : f.type === "select" ? String(f.options[0]?.value ?? f.options[0]) : "Otp Check";
    }
  }
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  fd.append("_meta", JSON.stringify(meta));
  return call("leads/homeloan", { form: fd, token });
}

const admin = (await call("staffLogin", { body: ADMIN })).data.accessToken;
ok(Boolean(admin), "admin sign-in");
const findLead = async (q) => (await get(`admin/leads?type=all&q=${encodeURIComponent(q)}&limit=50`, { token: admin })).data?.data || [];
const detail = async (lead) => (await get(`admin/leads/${lead.type}/${lead.id}`, { token: admin })).data?.data;

console.log("Status and input checks");
const status = await get("otp/status");
ok(status.status === 200 && status.data.available === true, "otp/status reports available (dev mode)", status.data);
const phoneA = freshPhone(1);
ok((await call("otp/send", { body: { purpose: "signin", mobile: phoneA } })).status === 400, "sign-in code needs consent");
ok((await call("otp/send", { body: { purpose: "signin", mobile: "12345", consent: true } })).status === 400, "invalid number refused");
ok((await call("otp/send", { body: { purpose: "nonsense", mobile: phoneA, consent: true } })).status === 400, "unknown purpose refused");

console.log("First sign-in creates an account and a NUL lead");
const sent = await call("otp/send", { body: { purpose: "signin", mobile: phoneA, consent: true } });
ok(sent.status === 200 && sent.data.channel === "dev" && /^\d{6}$/.test(sent.data.devCode) && sent.data.to.endsWith(phoneA.slice(-4)), "code sent (dev channel), masked number", sent.data);
ok((await call("otp/send", { body: { purpose: "signin", mobile: phoneA, consent: true } })).status === 429, "second send within 30 s is refused");
const wrong = sent.data.devCode === "000000" ? "111111" : "000000";
const bad = await call("otp/verify", { body: { purpose: "signin", mobile: phoneA, code: wrong } });
ok(bad.status === 400 && bad.data.left === 4, "wrong code refused, 4 tries left", bad.data);
const good = await call("otp/verify", { body: { purpose: "signin", mobile: phoneA, code: sent.data.devCode, _meta: meta } });
ok(good.status === 200 && good.data.accessToken && good.data.isNew === true && /^NUL-\d{6}$/.test(good.data.leadRef || ""), "right code signs in a new customer with a NUL lead", good.data);
ok(!JSON.stringify(good.data).includes("password\""), "no password field in the response");
ok((await call("otp/verify", { body: { purpose: "signin", mobile: phoneA, code: sent.data.devCode } })).status === 400, "a code works only once");
const tokenA = good.data.accessToken;
const nulRef = good.data.leadRef;
const [nulRow] = await findLead(nulRef);
ok(nulRow?.type === "signin" && nulRow.phoneVerified === true && nulRow.ref === nulRef && nulRow.channel === "otp_signin", "admin list: Mobile sign-in lead, verified, with reference", nulRow);
const nulDetail = nulRow && (await detail(nulRow));
ok(nulDetail?.notes?.some((n) => /mobile sign-in/.test(n.text)), "activity shows it came in through mobile sign-in", nulDetail?.notes);

console.log("Signing in again does not create a second lead");
await sleep(31000);
const again = await call("otp/send", { body: { purpose: "signin", mobile: phoneA, consent: true } });
const again2 = await call("otp/verify", { body: { purpose: "signin", mobile: phoneA, code: again.data.devCode, _meta: meta } });
ok(again2.status === 200 && again2.data.isNew === false && again2.data.leadRef === nulRef, "same account and same NUL lead", again2.data);
ok((await findLead(phoneA)).length === 1, "still one lead for the number");

console.log("Account: interest, then application converts NUL to HL with the same number");
const acct = await get("account", { token: tokenA });
ok(acct.status === 200 && acct.data.user.mobileVerified === true && acct.data.user.hasPassword === false && acct.data.interest?.options?.length > 5 && acct.data.applications.length === 0,
  "account shows verified number, no password, interest options, no applications", acct.data);
const pick = await call("account/interest", { body: { type: "homeloan" }, token: tokenA });
ok(pick.status === 200 && pick.data.page === "/homeloan", "interest returns the product page", pick.data);
ok((await findLead(nulRef))[0]?.detail === "Home loan", "NUL lead notes the interest");
const applied = await homeLoan(phoneA, tokenA);
const hlRef = nulRef.replace(/^NUL/, "HL");
ok(applied.status === 201 && applied.data.leadRef === hlRef && applied.data.phoneVerified === true, `application converts ${nulRef} to ${hlRef}, verified`, applied.data);
const [hlRow] = await findLead(hlRef);
ok(hlRow?.type === "homeloan" && hlRow.id === nulRow?.id && hlRow.convertedFrom === nulRef, "same lead, now a home loan, remembers the NUL reference", hlRow);
const hlDetail = hlRow && (await detail(hlRow));
ok(hlDetail?.notes?.some((n) => n.text.includes(`${nulRef} became ${hlRef}`)), "activity records the conversion", hlDetail?.notes);
ok((await get(`admin/leads/signin/${nulRow?.id}`, { token: admin })).data?.data?.lead?.type === "homeloan", "old sign-in link still opens the converted lead");
const acct2 = await get("account", { token: tokenA });
ok(acct2.data.interest === null && acct2.data.applications.length === 1, "account: interest prompt gone, one application");

console.log("Anonymous application, verified afterwards");
const phoneB = freshPhone(2);
const anon = await homeLoan(phoneB);
ok(anon.status === 201 && anon.data.phoneVerified === false && /^HL-\d{6}$/.test(anon.data.leadRef || "") && anon.data.leadId, "new lead gets a reference, not verified", anon.data);
const leadSend = await call("otp/send", { body: { purpose: "lead", leadId: anon.data.leadId } });
ok(leadSend.status === 200 && leadSend.data.to.endsWith(phoneB.slice(-4)), "code goes to the number on the lead", leadSend.data);
const leadOk = await call("otp/verify", { body: { purpose: "lead", leadId: anon.data.leadId, code: leadSend.data.devCode } });
ok(leadOk.status === 200 && leadOk.data.verified === true, "lead number verified");
const [anonRow] = await findLead(anon.data.leadRef);
ok(anonRow?.phoneVerified === true, "admin list shows it verified");
ok((await call("otp/send", { body: { purpose: "lead", leadId: "not-a-lead" } })).status === 404, "unknown lead refused");

console.log("Email customer verifies their number from the account page");
const login = await call("userLogin", { body: CUSTOMER });
const tokenC = login.data.accessToken;
const before = await get("account", { token: tokenC });
if (before.data?.user?.mobileVerified) console.log("  (customer already verified in this database; skipping)");
else {
  const s = await call("otp/send", { body: { purpose: "account" }, token: tokenC });
  ok(s.status === 200, "account code sent", s.data);
  const v = await call("otp/verify", { body: { purpose: "account", code: s.data.devCode }, token: tokenC });
  ok(v.status === 200 && (await get("account", { token: tokenC })).data.user.mobileVerified === true, "account number verified");
}
ok((await call("otp/send", { body: { purpose: "account" } })).status === 401, "account codes need a signed-in customer");

console.log("Cleanup endpoint");
ok((await get("cron/purge", { headers: { authorization: "Bearer wrong" } })).status === 401, "wrong cron secret refused");
const cron = await get("cron/purge", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
ok(cron.status === 200 && Number.isInteger(cron.data.removedSigninLeads), "cron runs with the secret", cron.data);
ok((await findLead(hlRef)).length === 1, "converted lead is kept");

if (process.env.OTP_PURGE_DB) {
  console.log("7-day removal (in-process, separate database copy)");
  process.env.PGLITE_DIR = process.env.OTP_PURGE_DB;
  process.env.ALLOW_LOCAL_DB = "1";
  const require = createRequire(import.meta.url);
  const Lead = require("../server/models/lead.model");
  const LeadEvent = require("../server/models/leadEvent.model");
  const User = require("../server/models/user.model");
  const { customerForPhone, recordSignin, purgeSigninLeads } = require("../server/leads/mobile");
  const phone = freshPhone(9);
  const { user } = await customerForPhone(phone);
  const fresh = (await recordSignin(user, phone)).lead;
  const oldPhone = freshPhone(8);
  const { user: oldUser } = await customerForPhone(oldPhone);
  const old = (await recordSignin(oldUser, oldPhone)).lead;
  await Lead.findByIdAndUpdate(old._id, { createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) });
  const stored = await Lead.findById(old._id).lean();
  const backdated = Date.now() - new Date(stored.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000;
  if (!backdated) {
    // createdAt is managed by the store; rebuild the record with an old creation time instead.
    const data = { ...stored };
    delete data._id;
    await Lead.findByIdAndDelete(old._id);
    await new Lead({ ...data, _id: old._id }).save({ createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) });
  }
  const removed = await purgeSigninLeads();
  ok(removed >= 1 && !(await Lead.findById(old._id).lean()), "NUL lead older than 7 days removed");
  ok((await LeadEvent.find({ leadId: String(old._id) }).lean()).length === 0, "its activity removed");
  ok(Boolean(await Lead.findById(fresh._id).lean()), "a recent NUL lead stays");
  ok(Boolean(await User.findById(oldUser._id).lean()), "the customer account stays");
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll OTP checks passed.");
process.exit(failures ? 1 : 0);
