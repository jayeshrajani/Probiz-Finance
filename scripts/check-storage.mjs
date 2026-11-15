// Usage (Stage 9): with the Firestore + Storage emulators running and the app started with FILE_STORAGE_BACKEND=firebase
// and PRIVATE_FILE_URL_TTL_SECONDS=60, run (same emulator env vars as the app):
//   node scripts/check-storage.mjs http://localhost:3000
// Checks private uploads, signed links, access control, content validation, deletion safeguards and public media.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || "").trim();
if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST || !project.startsWith("demo-")) {
  console.error("Set FIREBASE_STORAGE_EMULATOR_HOST and a demo- GCLOUD_PROJECT (Storage emulator only).");
  process.exit(1);
}
process.env.FILE_STORAGE_BACKEND = "firebase";
const { getStorageBucket, closeFirebase } = require("../server/firebase/admin");
const { detectFileType } = require("../server/storage/sniff");
const { deleteStoredFile } = require("../server/storage");

const ADMIN = { email: process.env.ADMIN_EMAIL || "admin@probiz.com", password: process.env.ADMIN_PASSWORD };
const CUSTOMER = { user_Email: process.env.CUSTOMER_EMAIL || "priya@example.com", password: process.env.CUSTOMER_PASSWORD };
if (!ADMIN.password || !CUSTOMER.password) {
  console.error("Set ADMIN_PASSWORD and CUSTOMER_PASSWORD for the local test accounts.");
  process.exit(1);
}
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
const DOCS = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];

let failures = 0;
const check = (ok, label, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` | ${detail}` : ""}`);
};

const run = Date.now().toString().slice(-6);
let ipSeq = 0;
const ip = () => `10.90.${run.slice(0, 2) % 250}.${++ipSeq % 250}`;

async function call(path, { method = "GET", body, form, token, addr = ip() } = {}) {
  const headers = { "x-forwarded-for": addr };
  if (token) headers.authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}/api/${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

function homeLoanForm(phone, files) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ fullName: "Storage Check", dateOfBirth: "1990-01-01", address: "Indore", contactNumber: phone, loanAmount: "500000" })) fd.append(k, v);
  for (const [field, { bytes, type, name }] of Object.entries(files)) fd.append(field, new Blob([bytes], { type }), name);
  return fd;
}

const exists = async (path) => (await getStorageBucket().file(path).exists())[0];
const objectCount = async () => (await getStorageBucket().getFiles({ prefix: "private/" }))[0].length;

// ---------- Content checks (unit) ----------
check(detectFileType(PNG, "image/png", DOCS)?.ext === "png" && detectFileType(PDF, "application/pdf", DOCS)?.ext === "pdf" &&
  detectFileType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]), "image/jpg", DOCS)?.ext === "jpg", "real PNG, PDF and JPEG are recognised");
check(detectFileType(Buffer.from("MZ\x90\x00 fake"), "application/pdf", DOCS) === null && detectFileType(Buffer.from("<html><script>"), "image/png", DOCS) === null &&
  detectFileType(PNG, "application/pdf", DOCS) === null && detectFileType(Buffer.alloc(0), "image/png", DOCS) === null, "executable, HTML, mismatched and empty files are refused");

// ---------- Sign-ins ----------
const admin = (await call("staffLogin", { method: "POST", body: ADMIN })).data.accessToken;
const customer = (await call("userLogin", { method: "POST", body: CUSTOMER })).data.accessToken;
const makeEmployee = async (n) => {
  const email = `storage.${n}.${run}@example.com`;
  const created = await call("admin/employees", { method: "POST", token: admin, body: { name: `Storage ${n}`, email, mobile: "9000000000", employeeId: `STO-${n}-${run}`, password: "Password1" } });
  const token = (await call("employeeLogin", { method: "POST", body: { email, password: "Password1" } })).data.accessToken;
  return { id: created.data?.data?._id, token };
};
const empA = await makeEmployee("a");
const empB = await makeEmployee("b");
check(Boolean(admin && customer && empA.token && empB.token), "test sign-ins (admin, customer, 2 employees)");

// ---------- Private upload ----------
const before = await objectCount();
const phone = `98${run}01`;
const up = await call("loanOfferDetail", { method: "POST", form: homeLoanForm(phone, { panCard: { bytes: PDF, type: "application/pdf", name: "../../My PAN?.pdf" }, aadharFront: { bytes: PNG, type: "image/png", name: "aadhaar.png" } }) });
const docs = up.data?.data?.uploadedDocuments || {};
const panPath = String(docs.panCard || "").slice(3);
const aadhaarPath = String(docs.aadharFront || "").slice(3);
check(up.status === 201 && /^pf:private\/documents\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.pdf$/.test(docs.panCard || "") && /\.png$/.test(aadhaarPath),
  "customer documents are stored privately as pf: references", `status=${up.status} pan=${docs.panCard}`);
check(!JSON.stringify(up.data).includes("http"), "the submission response contains no file URL");
const [meta] = panPath ? await getStorageBucket().file(panPath).getMetadata() : [{}];
// Busboy keeps only the base name ("../../My PAN?.pdf" arrives as "My PAN?.pdf"); the app then sanitises it.
check(meta.contentType === "application/pdf" && !meta.metadata?.firebaseStorageDownloadTokens && meta.metadata?.originalName === "My_PAN_.pdf" && meta.cacheControl === "private, no-store",
  "private object: detected type, no download token, sanitised original name", `type=${meta.contentType} name=${meta.metadata?.originalName} cache=${meta.cacheControl} token=${Boolean(meta.metadata?.firebaseStorageDownloadTokens)}`);
const direct = await fetch(`http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${getStorageBucket().name}/o/${encodeURIComponent(panPath)}?alt=media`);
check(direct.status === 403, "direct anonymous read from the bucket is denied by storage.rules", `status=${direct.status}`);

// ---------- Rejected uploads ----------
const spoof = await call("loanOfferDetail", { method: "POST", form: homeLoanForm(`98${run}02`, { panCard: { bytes: Buffer.from("MZ\x90\x00 not a pdf"), type: "application/pdf", name: "pan.pdf" } }) });
const html = await call("loanOfferDetail", { method: "POST", form: homeLoanForm(`98${run}03`, { aadharFront: { bytes: Buffer.from("<html><script>alert(1)</script>"), type: "image/png", name: "a.png" } }) });
const big = await call("loanOfferDetail", { method: "POST", form: homeLoanForm(`98${run}04`, { panCard: { bytes: Buffer.concat([PDF, Buffer.alloc(5 * 1024 * 1024)]), type: "application/pdf", name: "big.pdf" } }) });
const after = await objectCount();
check(spoof.status === 400 && html.status === 400 && big.status === 400 && after === before + 2,
  "renamed executable, HTML-as-image and a file over 5 MB are refused; nothing extra stored", `spoof=${spoof.status} html=${html.status} big=${big.status} stored=${after - before}`);

// ---------- Staff links ----------
const refId = String(up.data?.data?._id || "");
const detail = await call(`admin/leads/homeloan/${refId}`, { token: admin });
const leadId = detail.data?.data?.lead?.id;
const link = detail.data?.data?.fields?.uploadedDocuments?.panCard || "";
check(detail.status === 200 && /^\/api\/files\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}\.pdf$/.test(link) && detail.headers.get("cache-control") === "no-store",
  "admin lead detail returns a signed link and is not cached", `status=${detail.status} cache=${detail.headers.get("cache-control")}`);
const file = await fetch(`${BASE}${link}`);
const bytes = Buffer.from(await file.arrayBuffer());
check(file.status === 200 && bytes.equals(PDF) && file.headers.get("content-type") === "application/pdf" && file.headers.get("x-content-type-options") === "nosniff" &&
  file.headers.get("cache-control") === "private, no-store" && /^inline; filename="document\.pdf"$/.test(file.headers.get("content-disposition") || ""),
  "the signed link returns the exact file with safe headers", `status=${file.status} type=${file.headers.get("content-type")}`);

const [payload, sig] = link.slice("/api/files/".length).split(".");
const flipped = `${sig.slice(0, -1)}${sig.endsWith("A") ? "B" : "A"}`;
const otherLink = detail.data?.data?.fields?.uploadedDocuments?.aadharFront || "";
const [otherPayload] = otherLink.slice("/api/files/".length).split(".");
const probes = [`/api/files/${payload}.${flipped}.pdf`, `/api/files/${otherPayload}.${sig}.png`, `/api/files/${payload}.${sig}.png`, "/api/files/..%2F..%2Fserver%2Fdb.js", "/api/files/abc.def.pdf", `/api/files/${payload}`];
const probeStatus = [];
for (const p of probes) probeStatus.push((await fetch(`${BASE}${p}`)).status);
check(probeStatus.every((s) => s === 404), "tampered, swapped, wrong-extension and traversal links return 404", probeStatus.join(","));

// ---------- Access control ----------
await call(`admin/leads/homeloan/${leadId}`, { method: "PATCH", token: admin, body: { assignTo: empA.id } });
const asA = await call(`admin/leads/homeloan/${leadId}`, { token: empA.token });
const asB = await call(`admin/leads/homeloan/${leadId}`, { token: empB.token });
const asCustomer = await call(`admin/leads/homeloan/${leadId}`, { token: customer });
const asNobody = await call(`admin/leads/homeloan/${leadId}`);
check(asA.status === 200 && String(asA.data?.data?.fields?.uploadedDocuments?.panCard || "").startsWith("/api/files/") &&
  asB.status === 403 && !JSON.stringify(asB.data).includes("/api/files/") && asCustomer.status === 401 && asNobody.status === 401,
  "assigned employee gets links; other employee 403; customer and anonymous 401", `A=${asA.status} B=${asB.status} customer=${asCustomer.status} anonymous=${asNobody.status}`);
const legacyList = await call("getHomeLoan", { token: admin });
const listed = (legacyList.data?.data || []).find((d) => String(d._id) === refId);
check(legacyList.status === 200 && String(listed?.uploadedDocuments?.panCard || "").startsWith("pf:"), "legacy admin list returns the pf: reference, not a link (D11)");

// ---------- Expiry ----------
await new Promise((r) => setTimeout(r, 62000));
const expired = await fetch(`${BASE}${link}`);
check(expired.status === 404, "the link expires after PRIVATE_FILE_URL_TTL_SECONDS (60 s in this run)", `status=${expired.status}`);

// ---------- Deletion safeguards ----------
const bucket = getStorageBucket();
const legacyPath = `image/media-${run}-legacy.pdf`;
await bucket.file(legacyPath).save(PDF, { resumable: false, metadata: { contentType: "application/pdf", metadata: { firebaseStorageDownloadTokens: "legacy-token" } } });
const legacyUrl = `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket.name}/o/${encodeURIComponent(legacyPath)}?alt=media&token=legacy-token`;
const skipped = [await deleteStoredFile(legacyUrl), await deleteStoredFile("/uploads/image/media-old.pdf"), await deleteStoredFile("https://x.supabase.co/storage/v1/object/public/uploads/image/a.pdf"), await deleteStoredFile("pf:../../etc/passwd")];
check(skipped.every((v) => v === false) && (await exists(legacyPath)), "files from before Stage 9 and malformed references are never deleted");
const byEmployee = await call(`admin/leads/homeloan/${leadId}`, { method: "DELETE", token: empA.token });
check(byEmployee.status === 403 && (await exists(panPath)), "an employee cannot delete the lead or its documents", `status=${byEmployee.status}`);
const removed = await call(`admin/leads/homeloan/${leadId}`, { method: "DELETE", token: admin });
check(removed.status === 200 && !(await exists(panPath)) && !(await exists(aadhaarPath)), "admin lead deletion removes its private documents", `status=${removed.status}`);
await bucket.file(legacyPath).delete({ ignoreNotFound: true });

// ---------- Public property media and the D12 limit ----------
const addr = ip();
const property = () => {
  const fd = new FormData();
  fd.append("propertyName", "Storage check");
  fd.append("price", "100");
  fd.append("propertyImage", new Blob([PNG], { type: "image/png" }), "photo.png");
  return call("addProperty", { method: "POST", form: fd, addr });
};
const first = await property();
const imageUrl = first.data?.data?.propertyImage?.[0] || "";
const image = imageUrl ? await fetch(imageUrl) : { status: 0 };
check(first.status === 200 && /\/v0\/b\/[^/]+\/o\/public%2Fproperty%2F.+\?alt=media&token=[0-9a-f-]{36}$/.test(imageUrl) && image.status === 200,
  "public property images get a download-token URL that works without sign-in (emulator)", `status=${first.status} image=${image.status}`);
const statuses = [];
for (let i = 0; i < 5; i += 1) statuses.push((await property()).status);
check(statuses.slice(0, 4).every((s) => s === 200) && statuses[4] === 429, "public property uploads are limited to 5 per 10 minutes per IP (D12)", statuses.join(","));
const propertyId = first.data?.data?._id;
const propertyPath = decodeURIComponent(imageUrl.split("/o/")[1]?.split("?")[0] || "");
const delProperty = await call(`deleteProperty/${propertyId}`, { method: "DELETE", token: admin });
check(delProperty.status === 200 && !(await exists(propertyPath)), "deleting a listing removes its stored media", `status=${delProperty.status}`);

for (const e of [empA, empB]) await call(`admin/employees/${e.id}`, { method: "DELETE", token: admin });
await closeFirebase();
console.log(failures ? `${failures} storage checks failed.` : "All storage checks passed.");
process.exit(failures ? 1 : 0);
