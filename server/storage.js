const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

function objectKey(originalName, mimetype) {
  const folder = mimetype && mimetype.startsWith('video/') ? 'video' : 'image';
  const ext = path.extname(originalName || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
  return `${folder}/media-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
}

// Uploads a file and returns its public URL (stored on documents like multer-s3's `location`).
async function uploadFile(buffer, { originalName, mimetype }) {
  const key = objectKey(originalName, mimetype);
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const base = SUPABASE_URL.replace(/\/$/, '');
    const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': mimetype || 'application/octet-stream',
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
}

module.exports = { uploadFile };
