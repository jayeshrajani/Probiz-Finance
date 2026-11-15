// File storage facade. FILE_STORAGE_BACKEND selects the provider:
// - legacy (default): the original behaviour, public URLs on Supabase Storage or public/uploads in development.
// - firebase: Cloud Storage for Firebase; private documents are stored as `pf:<path>` references and are only
//   readable through short-lived signed links from server/routes/files.routes.js. Emulator, or a confirmed real project.
const fs = require('fs/promises');
const path = require('path');
const { randomUUID, createHmac, hkdfSync, timingSafeEqual } = require('crypto');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

function objectKey(ext, mimetype) {
  const folder = mimetype && mimetype.startsWith('video/') ? 'video' : 'image';
  return `${folder}/media-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
}

// Original provider, unchanged apart from taking the extension from the detected content type.
const legacy = {
  name: 'legacy',
  async put(buffer, { mime, ext }) {
    const key = objectKey(ext, mime);
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const base = SUPABASE_URL.replace(/\/$/, '');
      const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': mime || 'application/octet-stream',
          'x-upsert': 'false',
        },
        body: buffer,
      });
      if (!res.ok) throw new Error(`File upload failed (${res.status}): ${await res.text()}`);
      return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('File storage is not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).');
    }
    // Dev fallback: next dev serves files written to public/ at runtime.
    const target = path.join(process.cwd(), 'public', 'uploads', key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    return `/uploads/${key}`;
  },
  open: async () => null,
  // Files stored before Stage 9 are preserved; their move is a separate, approved migration step.
  remove: async () => false,
};

function provider() {
  const name = String(process.env.FILE_STORAGE_BACKEND || 'legacy').trim().toLowerCase();
  if (name === 'legacy') return legacy;
  if (name !== 'firebase') throw new Error(`Unknown FILE_STORAGE_BACKEND "${name}" (expected "legacy" or "firebase").`);
  const { firebaseTarget } = require('./firebase/admin');
  if (firebaseTarget().mode === 'emulator' && !process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    throw new Error('FILE_STORAGE_BACKEND=firebase with the emulators needs FIREBASE_STORAGE_EMULATOR_HOST.');
  }
  return require('./storage/firebase');
}

// Stores one validated upload. visibility: 'public' (property media) or 'private' (customer documents).
const storeFile = (buffer, options) => provider().put(buffer, options);

// Deletes a file this application stored through the active provider; anything else is left untouched.
async function deleteStoredFile(value) {
  try {
    return await provider().remove(value);
  } catch (err) {
    console.error('[storage] delete failed', provider().pathOf?.(value) || 'unknown path', err.code || err.message);
    return false;
  }
}

// Every string value inside a record (nested objects and arrays included).
function storedValues(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => storedValues(v, out));
  else if (value && typeof value === 'object' && !(value instanceof Date)) Object.values(value).forEach((v) => storedValues(v, out));
  return out;
}

// ---------- Signed links for private files ----------

const LINK_RE = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})\.(png|jpg|pdf)$/;

function linkKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return Buffer.from(hkdfSync('sha256', secret, 'probiz-files', 'probiz-file-links-v1', 32));
}

const sign = (payload) => createHmac('sha256', linkKey()).update(payload).digest('base64url');

function linkTtlSeconds() {
  const n = Number(process.env.PRIVATE_FILE_URL_TTL_SECONDS) || 600;
  return Math.min(3600, Math.max(60, Math.floor(n)));
}

// `pf:<path>` -> `/api/files/<payload>.<signature>.<ext>` valid for PRIVATE_FILE_URL_TTL_SECONDS (default 10 min).
function fileLink(ref) {
  const objectPath = typeof ref === 'string' && ref.startsWith('pf:') ? ref.slice(3) : null;
  const ext = objectPath && objectPath.split('.').pop();
  if (!objectPath || !['png', 'jpg', 'pdf'].includes(ext)) return null;
  const payload = Buffer.from(JSON.stringify({ p: objectPath, e: Math.floor(Date.now() / 1000) + linkTtlSeconds() })).toString('base64url');
  return `/api/files/${payload}.${sign(payload)}.${ext}`;
}

// Returns the object path for a valid, unexpired link token, otherwise null.
function verifyFileLink(token) {
  const m = LINK_RE.exec(String(token || ''));
  if (!m) return null;
  const [, payload, signature, ext] = m;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!data || typeof data.p !== 'string' || !Number.isFinite(data.e) || data.e < Date.now() / 1000) return null;
  return data.p.endsWith(`.${ext}`) ? data.p : null;
}

// Replaces every `pf:` reference inside a record with a signed link (for responses to authorised staff).
function withFileLinks(value) {
  if (typeof value === 'string') return value.startsWith('pf:') ? fileLink(value) || value : value;
  if (Array.isArray(value)) return value.map(withFileLinks);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withFileLinks(v)]));
  }
  return value;
}

const openPrivateFile = (objectPath) => provider().open(objectPath);

module.exports = { storeFile, deleteStoredFile, storedValues, fileLink, verifyFileLink, withFileLinks, openPrivateFile, linkTtlSeconds };
