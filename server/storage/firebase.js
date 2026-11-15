// Cloud Storage for Firebase through the Admin SDK (server credentials; storage.rules deny all client access).
// Private documents get no download token and are only streamed by /api/files after a signed link check.
const { randomUUID } = require('crypto');
const { getStorageBucket } = require('../firebase/admin');

const PRIVATE_PATH = /^private\/documents\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(png|jpg|pdf)$/;
const PUBLIC_PATH = /^public\/property\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(png|jpg|pdf|mp4)$/;

const cleanName = (name) => String(name || '').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 100);

function objectPath(visibility, ext) {
  const now = new Date();
  const folder = visibility === 'public' ? 'public/property' : 'private/documents';
  return `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${ext}`;
}

function downloadBase() {
  const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  return host ? `http://${host}` : 'https://firebasestorage.googleapis.com';
}

const publicUrl = (bucket, path, token) =>
  `${downloadBase()}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

// Returns `pf:<path>` for private documents, or a download-token URL for public property media.
async function put(buffer, { visibility, mime, ext, originalName }) {
  const bucket = getStorageBucket();
  const path = objectPath(visibility, ext);
  const custom = { originalName: cleanName(originalName) };
  const token = visibility === 'public' ? randomUUID() : null;
  if (token) custom.firebaseStorageDownloadTokens = token;
  await bucket.file(path).save(buffer, {
    resumable: false,
    metadata: {
      contentType: mime,
      cacheControl: token ? 'public, max-age=31536000, immutable' : 'private, no-store',
      metadata: custom,
    },
  });
  return token ? publicUrl(bucket.name, path, token) : `pf:${path}`;
}

// Object path for a value this provider created, or null (legacy URLs and anything else are never touched).
function pathOf(value) {
  if (typeof value !== 'string') return null;
  if (value.startsWith('pf:')) return PRIVATE_PATH.test(value.slice(3)) ? value.slice(3) : null;
  const prefix = `${downloadBase()}/v0/b/${getStorageBucket().name}/o/`;
  if (!value.startsWith(prefix)) return null;
  const path = decodeURIComponent(value.slice(prefix.length).split('?')[0]);
  return PUBLIC_PATH.test(path) ? path : null;
}

async function open(path) {
  if (!PRIVATE_PATH.test(path)) return null;
  const file = getStorageBucket().file(path);
  try {
    const [meta] = await file.getMetadata();
    return { stream: file.createReadStream(), contentType: meta.contentType, size: Number(meta.size) };
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

async function remove(value) {
  const path = pathOf(value);
  if (!path) return false;
  await getStorageBucket().file(path).delete({ ignoreNotFound: true });
  return true;
}

module.exports = { name: 'firebase', put, open, remove, pathOf, objectPath, PRIVATE_PATH };
