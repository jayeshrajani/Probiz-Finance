// Single intake pipeline for every lead form: gate (spam, rate limit, validation, consent) -> legacy controller
// saves the per-form record -> Lead envelope (with 7-day duplicate merge) -> LeadEvent + listeners.
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { saveTracker } = require('../odm');
const Lead = require('../models/lead.model');
const User = require('../models/user.model');
const { parseBody, runChain } = require('../http');
const { byType, byFormKey, summarize } = require('../admin/leads');
const { allow } = require('./rateLimit');
const { emit, on } = require('./events');
const { notifyNewLead } = require('./notify/whatsapp');
const { normalizePhone } = require('./backfill');

const HONEYPOT = 'company_website';
const DEDUPE_MS = 7 * 24 * 60 * 60 * 1000;
const OPEN = ['new', 'contacted', 'in_progress'];
const PUBLIC_CHANNELS = new Set(['web_form', 'assistant']);
const RESPONSE_TIMEOUT_MS = 30000;
const THANKS = "Thanks, we have your details. An advisor will call you soon.";

let schemaPromise = null;
const loadSchema = () => (schemaPromise ||= import('../../lib/lead-schema.js'));

const clip = (v, n = 300) => (v === undefined || v === null || v === '' ? null : String(v).slice(0, n));

// Forwarded headers are only trusted behind a proxy that sets them (Vercel always does); otherwise anyone could spoof them.
function clientIp(req) {
  const first = (v) => String(v || '').split(',')[0].trim();
  const socket = req.socket?.remoteAddress || 'unknown';
  if (process.env.VERCEL) return first(req.headers['x-real-ip']) || first(req.headers['x-forwarded-for']) || socket;
  if (process.env.TRUST_PROXY === '1') return first(req.headers['x-forwarded-for']) || socket;
  return socket;
}

// The browser sends source and consent as one `_meta` field (a JSON string in multipart forms).
function takeMeta(body) {
  let meta = body._meta;
  delete body._meta;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = null;
    }
  }
  if (!meta || typeof meta !== 'object') return {};
  const utm = meta.source?.utm && typeof meta.source.utm === 'object' ? meta.source.utm : {};
  return {
    channel: PUBLIC_CHANNELS.has(meta.channel) ? meta.channel : null,
    topic: clip(meta.topic, 200),
    source: {
      page: clip(meta.source?.page),
      referrer: clip(meta.source?.referrer),
      landingPage: clip(meta.source?.landingPage),
      device: clip(meta.source?.device, 20),
      utm: Object.fromEntries(['source', 'medium', 'campaign', 'term', 'content'].map((k) => [k, clip(utm[k], 120)]).filter(([, v]) => v)),
    },
    consent: meta.consent?.accepted === true ? { accepted: true, version: clip(meta.consent.version, 40), text: clip(meta.consent.text, 500) } : null,
  };
}

async function customerId(req) {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7).trim(), config.secret);
    if (payload.role || !payload.id) return null;
    const user = await User.findOne({ _id: payload.id, deleteFlag: false }).lean();
    return user ? String(user._id) : null;
  } catch {
    return null;
  }
}

const deny = (res, status, message, extra) => {
  res.status(status).json({ message, status, ...extra });
  return false;
};

function makeGate(ctx) {
  return async (req, res, files) => {
    const body = req.body || (req.body = {});
    const trap = body[HONEYPOT];
    delete body[HONEYPOT];
    ctx.meta = takeMeta(body);
    if (ctx.meta.channel && ctx.mode === 'new') ctx.channel = ctx.meta.channel;
    if (ctx.channel === 'staff') return true;

    if (trap && String(trap).trim()) {
      res.status(201).json({ message: THANKS });
      return false;
    }
    if (req.rejectedFiles?.length) {
      const names = req.rejectedFiles.map((f) => f.filename || f.field).join(', ');
      return deny(res, 400, `We couldn't accept ${names}. Upload PDF, JPG or PNG files of up to 5 MB each.`);
    }
    const ip = clientIp(req);
    const ok = await allow([
      { key: `lead:${ip}:${ctx.def.type}`, limit: 5, windowSeconds: 600 },
      { key: `lead:${ip}`, limit: 30, windowSeconds: 86400 },
    ]);
    if (!ok) return deny(res, 429, "You've sent a few requests already. Please try again in a few minutes, or call us.");

    if (ctx.def.formKey) {
      const { validateLead } = await loadSchema();
      const errors = validateLead(ctx.def.formKey, body);
      if (Object.keys(errors).length) return deny(res, 400, 'Please check the highlighted fields.', { fields: errors });
    }
    if (ctx.mode === 'new' && !ctx.meta.consent) return deny(res, 400, 'Please accept the privacy policy so we can contact you.');
    return true;
  };
}

function captureResponse() {
  let resolve;
  const done = new Promise((r) => (resolve = r));
  const out = { status: 200, body: undefined, sent: false, headers: {} };
  const finish = (body) => {
    out.body = body;
    out.sent = true;
    resolve();
    return shim;
  };
  const shim = {
    status(code) {
      out.status = code;
      return shim;
    },
    json: finish,
    send: finish,
    end: finish,
    sendStatus(code) {
      out.status = code;
      return finish();
    },
    setHeader(k, v) {
      out.headers[k] = v;
      return shim;
    },
    get headersSent() {
      return out.sent;
    },
  };
  return { shim, out, done };
}

async function upsertLead(ctx, refId, req) {
  const { def } = ctx;
  const doc = await def.model.findById(refId).lean();
  if (!doc) return null;
  const s = summarize(def, doc);
  const phone = normalizePhone(s.phone);
  const now = new Date();
  const actor =
    ctx.channel === 'staff'
      ? { kind: 'staff', id: req.staff?.id || null, name: req.staff?.name || null }
      : { kind: 'customer', id: ctx.userId, name: s.name };
  const source = { channel: ctx.channel, topic: ctx.meta?.topic || null, ...(ctx.meta?.source || {}) };
  const dedupeKey = phone ? `${def.type}:${phone}` : null;

  const existing = dedupeKey
    ? await Lead.findOne({ dedupeKey, status: { $in: OPEN }, lastActivityAt: { $gte: new Date(now - DEDUPE_MS) } }).sort({ lastActivityAt: -1 })
    : null;
  if (existing) {
    existing.refIds = [...(existing.refIds || []), refId];
    existing.refId = refId;
    existing.repeatCount = (existing.repeatCount || 0) + 1;
    existing.lastActivityAt = now;
    for (const k of ['name', 'email', 'amount', 'detail']) if (s[k]) existing[k] = String(s[k]);
    if (!existing.userId && ctx.userId) existing.userId = ctx.userId;
    if (ctx.meta?.consent) existing.consent = { ...ctx.meta.consent, at: now };
    await existing.save();
    await emit(existing, 'lead.repeat', actor, { refId, source });
    return { lead: existing, repeat: true };
  }

  const lead = await Lead.create({
    type: def.type,
    formKey: def.formKey,
    refId,
    refIds: [refId],
    name: s.name ? String(s.name) : null,
    phone: phone || (s.phone ? String(s.phone) : null),
    email: s.email ? String(s.email) : null,
    amount: s.amount ? String(s.amount) : null,
    detail: s.detail ? String(s.detail).slice(0, 300) : null,
    status: 'new',
    userId: ctx.userId,
    source,
    consent: ctx.meta?.consent ? { ...ctx.meta.consent, at: now } : null,
    dedupeKey,
    repeatCount: 0,
    lastActivityAt: now,
  });
  await emit(lead, 'lead.created', actor, { refId, source });
  return { lead, repeat: false };
}

function persist(controller) {
  return async (req, res) => {
    const ctx = req.leadCtx;
    const saves = [];
    const { shim, out, done } = captureResponse();
    await saveTracker.run(saves, async () => {
      await controller(req, shim, () => {});
      await Promise.race([done, new Promise((r) => setTimeout(r, RESPONSE_TIMEOUT_MS))]);
    });
    if (!out.sent) return res.status(500).json({ message: 'Internal server error', status: 500 });

    const ok = out.status >= 200 && out.status < 300;
    let result = null;
    if (ok) {
      const saved = saves.find((s) => s.model === ctx.def.model);
      try {
        if (saved) result = await upsertLead(ctx, saved.id, req);
      } catch (err) {
        // The application itself is saved; the envelope is rebuilt by the backfill if this fails.
        console.error('[leads] envelope failed', ctx.def.type, err);
      }
    }
    if (ok && ctx.mode === 'new') {
      return res.status(201).json({ message: THANKS, leadId: result?.lead?._id || null, repeat: Boolean(result?.repeat) });
    }
    for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
    if (out.body === undefined) return res.status(out.status).end();
    return res.status(out.status)[typeof out.body === 'object' ? 'json' : 'send'](out.body);
  };
}

const hasMultipart = (handlers) => handlers.some((h) => h.$body === 'multipart');

function buildChain(def, handlers, { mode, channel }) {
  const controller = handlers[handlers.length - 1];
  const middlewares = handlers.slice(0, -1);
  const multipartRoute = hasMultipart(middlewares);
  const setup = async (req, res, next) => {
    const ctx = (req.leadCtx = { def, mode, channel, meta: {}, userId: await customerId(req) });
    const gate = makeGate(ctx);
    if (multipartRoute) {
      req.leadGate = gate;
      return next();
    }
    if (await gate(req, res, [])) return next();
  };
  return [setup, ...middlewares, persist(controller)];
}

// Wraps every legacy lead endpoint and adds POST /api/leads/:formKey on top of the same handlers.
function installLeadIntake(app, routes) {
  const originals = new Map();
  for (const def of Object.values(byType)) {
    if (!def.endpoint) continue;
    const route = routes.find((r) => r.method === 'POST' && r.path === def.endpoint);
    if (!route) continue;
    originals.set(def.type, route.handlers.slice());
    route.handlers = buildChain(def, route.handlers, { mode: 'legacy', channel: def.type === 'inhouse' ? 'staff' : 'legacy_api' });
  }

  const intake = async (req, res) => {
    const def = byFormKey[req.params.formKey];
    const handlers = def && originals.get(def.type);
    if (!handlers) return res.status(404).json({ message: 'Unknown form.', status: 404 });
    if (!hasMultipart(handlers)) req.body = await parseBody(req);
    await runChain(buildChain(def, handlers, { mode: 'new', channel: 'web_form' }), req, res);
  };
  intake.$body = 'deferred';
  app.post('/api/leads/:formKey', intake);
}

on('lead.created', async function whatsappAlert(lead) {
  await notifyNewLead(lead, byType[lead.type]?.label || lead.type);
});

module.exports = { installLeadIntake, upsertLead, normalizePhone, HONEYPOT };
