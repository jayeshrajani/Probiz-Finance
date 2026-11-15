// Identifies uploads by their first bytes, so the stored type never depends on what the browser claims.
const SIGNATURES = [
  { mime: 'image/png', ext: 'png', test: (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'application/pdf', ext: 'pdf', test: (b) => b.length >= 5 && b.subarray(0, 5).toString('latin1') === '%PDF-' },
  { mime: 'video/mp4', ext: 'mp4', test: (b) => b.length >= 12 && b.subarray(4, 8).toString('latin1') === 'ftyp' },
];

const canonical = (mime) => (String(mime).toLowerCase() === 'image/jpg' ? 'image/jpeg' : String(mime).toLowerCase());

// Returns { mime, ext } when the content is one of the allowed types and matches the declared type; otherwise null.
function detectFileType(buffer, declaredMime, allowedTypes) {
  const found = SIGNATURES.find((s) => s.test(buffer));
  if (!found) return null;
  const allowed = new Set(allowedTypes.map(canonical));
  if (!allowed.has(found.mime) || canonical(declaredMime) !== found.mime) return null;
  return { mime: found.mime, ext: found.ext };
}

module.exports = { detectFileType };
