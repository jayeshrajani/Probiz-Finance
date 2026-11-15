// Stage 13B: shows how a deployed app resolves the client IP behind its hosting proxy (TRUST_PROXY_HOPS) and checks
// that a caller cannot change it with its own X-Forwarded-For header. Read-only apart from one admin sign-in.
// Usage: ADMIN_PASSWORD=... node scripts/check-proxy.mjs https://<backend-url>
// Locally there is no proxy, so the result is only meaningful against a deployed backend.
const BASE = (process.argv[2] || "").replace(/\/$/, "");
const ADMIN = { email: process.env.ADMIN_EMAIL || "admin@probiz.com", password: process.env.ADMIN_PASSWORD };
if (!BASE || !ADMIN.password) {
  console.error("Usage: ADMIN_PASSWORD=... node scripts/check-proxy.mjs https://<backend-url>");
  process.exit(1);
}

async function call(path, { method = "GET", body, token, forwarded } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (forwarded) headers["x-forwarded-for"] = forwarded;
  if (body) headers["content-type"] = "application/json";
  const res = await fetch(`${BASE}/api/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const token = (await call("staffLogin", { method: "POST", body: ADMIN })).data.accessToken;
if (!token) {
  console.error("Admin sign-in failed.");
  process.exit(1);
}
const plain = (await call("admin/client-ip", { token })).data.data;
const spoofOne = (await call("admin/client-ip", { token, forwarded: "203.0.113.7" })).data.data;
const spoofTwo = (await call("admin/client-ip", { token, forwarded: "198.51.100.9, 203.0.113.7" })).data.data;
const anonymous = await call("admin/client-ip");

// With one spoofed entry, the entries after it were added by the hosting proxies; the first of them is the caller.
const suggestedHops = spoofOne ? spoofOne.forwardedFor.length - 1 : null;
const stable = plain && spoofOne && spoofTwo && plain.resolved === spoofOne.resolved && plain.resolved === spoofTwo.resolved;
const notSpoofed = spoofOne && !["203.0.113.7", "198.51.100.9"].includes(spoofOne.resolved) && !["203.0.113.7", "198.51.100.9"].includes(spoofTwo?.resolved);
console.log(JSON.stringify({
  trustProxyHops: plain?.trustProxyHops,
  forwardedEntries: { none: plain?.forwardedFor.length, oneSpoofed: spoofOne?.forwardedFor.length, twoSpoofed: spoofTwo?.forwardedFor.length },
  suggestedHops,
}, null, 1));
const results = [
  [anonymous.status === 401, `diagnostic endpoint is admin-only | anonymous=${anonymous.status}`],
  [stable && notSpoofed, "the resolved client address ignores caller-supplied X-Forwarded-For entries"],
  [String(plain?.trustProxyHops) === String(suggestedHops), `TRUST_PROXY_HOPS matches the proxy chain (suggested ${suggestedHops})`],
];
for (const [ok, label] of results) console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
process.exitCode = results.every(([ok]) => ok) ? 0 : 1;
