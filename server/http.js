// Express-style router for Next.js API routes, so the existing route files and controllers run unchanged.
const Busboy = require('busboy');
const { uploadFile } = require('./storage');

const routes = [];

function register(method) {
  return (path, ...handlers) => {
    const keys = [];
    const pattern = path
      .split('/')
      .map((seg) => {
        if (seg.startsWith(':')) {
          keys.push(seg.slice(1));
          return '([^/]+)';
        }
        return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    routes.push({ method, path, re: new RegExp(`^${pattern}/?$`), keys, handlers });
  };
}

const app = {
  get: register('GET'),
  post: register('POST'),
  put: register('PUT'),
  patch: register('PATCH'),
  delete: register('DELETE'),
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function addField(target, name, value) {
  if (name in target) target[name] = [].concat(target[name], value);
  else target[name] = value;
}

const contentType = (req) => String(req.headers['content-type'] || '').toLowerCase();

async function parseBody(req) {
  const type = contentType(req);
  if (req.method === 'GET' || req.method === 'HEAD') return {};
  const raw = await readBody(req);
  if (!raw.length) return {};
  if (type.includes('application/json')) {
    try {
      return JSON.parse(raw.toString('utf8'));
    } catch {
      const err = new Error('Invalid JSON body');
      err.status = 400;
      throw err;
    }
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    const body = {};
    for (const [k, v] of new URLSearchParams(raw.toString('utf8'))) addField(body, k, v);
    return body;
  }
  return {};
}

// Replacement for express.raw(): exposes the untouched request body as a Buffer.
function raw() {
  const handler = async (req, res, next) => {
    req.body = await readBody(req);
    next();
  };
  handler.$body = 'raw';
  return handler;
}

// Replacement for multer().fields(): parses multipart forms and uploads accepted files.
function multipart(allowedTypes) {
  return {
    fields(spec = []) {
      const limits = Object.fromEntries(spec.map((f) => [f.name, f.maxCount || Infinity]));
      const handler = async (req, res, next) => {
        if (!contentType(req).includes('multipart/form-data')) {
          req.body = await parseBody(req);
          req.files = {};
          if (req.leadGate && !(await req.leadGate(req, res, []))) return;
          return next();
        }
        const { body, files, rejected } = await parseMultipart(req, limits, allowedTypes);
        req.body = body;
        req.files = {};
        req.rejectedFiles = rejected;
        if (req.leadGate && !(await req.leadGate(req, res, files))) return;
        await Promise.all(files.map(async (file) => {
          file.location = await uploadFile(file.buffer, { originalName: file.originalname, mimetype: file.mimetype });
          delete file.buffer;
        }));
        for (const file of files) (req.files[file.fieldname] ||= []).push(file);
        next();
      };
      handler.$body = 'multipart';
      return handler;
    },
  };
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function parseMultipart(req, limits, allowedTypes) {
  return new Promise((resolve, reject) => {
    const body = {};
    const files = [];
    const rejected = [];
    const counts = {};
    const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_BYTES, files: 30 } });
    bb.on('field', (name, value) => addField(body, name, value));
    bb.on('file', (name, stream, info) => {
      counts[name] = (counts[name] || 0) + 1;
      const known = name in limits && counts[name] <= limits[name];
      if (!known || !allowedTypes.includes(info.mimeType)) {
        if (known) rejected.push({ field: name, filename: info.filename, reason: 'type' });
        stream.resume();
        return;
      }
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => {
        if (stream.truncated) {
          rejected.push({ field: name, filename: info.filename, reason: 'size' });
          return;
        }
        const buffer = Buffer.concat(chunks);
        files.push({ fieldname: name, originalname: info.filename, mimetype: info.mimeType, size: buffer.length, buffer });
      });
    });
    bb.on('close', () => resolve({ body, files, rejected }));
    bb.on('error', reject);
    req.pipe(bb);
  });
}

async function runChain(handlers, req, res) {
  for (const handler of handlers) {
    let calledNext = false;
    let nextError;
    await new Promise((resolve, reject) => {
      const next = (err) => {
        calledNext = true;
        nextError = err;
        resolve();
      };
      Promise.resolve()
        .then(() => handler(req, res, next))
        .then(() => !calledNext && resolve(), reject);
    });
    if (nextError) throw nextError;
    if (!calledNext) return;
  }
}

async function dispatch(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const route = routes.find((r) => r.method === req.method && r.re.test(pathname));
  if (!route) {
    res.status(404).json({ message: `Cannot ${req.method} ${pathname}`, status: 404 });
    return;
  }
  const match = pathname.match(route.re);
  req.params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
  req.query = {};
  for (const [k, v] of url.searchParams) addField(req.query, k, v);
  req.files = {};

  try {
    if (!route.handlers.some((h) => h.$body)) req.body = await parseBody(req);
    await runChain(route.handlers, req, res);
  } catch (err) {
    console.error(`[api] ${req.method} ${pathname}`, err);
    if (!res.headersSent) {
      const status = err.status || 500;
      res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message, status });
    }
  }
}

module.exports = { app, routes, dispatch, raw, multipart, parseBody, runChain };
