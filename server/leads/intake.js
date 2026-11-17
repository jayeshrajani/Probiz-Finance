// Single intake pipeline for every lead form: gate (spam, rate limit, validation, consent) -> legacy controller
// saves the per-form record -> Lead envelope (with 7-day duplicate merge) -> LeadEvent + listeners.
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { saveTracker, transaction } = require('../odm');
const { deleteStoredFile } = require('../storage');
const Lead = require('../models/lead.model');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const { requireStaff } = require('../middlewares/staffAuth');
const { parseBody, runChain } = require('../http');
const { byType, byFormKey, summarize } = require('../admin/leads');
const { allow } = require('./rateLimit');
const { emit, on } = require('./events');
const { notifyNewLead } = require('./notify/whatsapp');
const { normalizePhone } = require('./backfill');
const { personaOf, levelOf, stageOf } = require('../admin/personas');
const MobileSignin = require('../models/mobileSignin.model');
const { formatRef, nextSeq } = require('./refs');

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
// TRUST_PROXY_HOPS=n (Google App Hosting / Cloud Run): use the n-th X-Forwarded-For entry from the right, i.e. the
// address our own proxies recorded; entries further left are whatever the caller sent.
function clientIp(req) {
  const first = (v) => String(v || '').split(',')[0].trim();
  const socket = req.socket?.remoteAddress || 'unknown';
  const hops = Number(process.env.TRUST_PROXY_HOPS);
  if (Number.isInteger(hops) && hops > 0) {
    const entries = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
    return entries.length >= hops ? entries[entries.length - hops] : socket;
  }
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
      location: clip(meta.source?.location, 120),
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
    const staffEntry = ctx.mode === 'staff';
    const assignTo = String(body._assignTo || '');
    delete body._assignTo;
    // The legacy admin-only in-house endpoint keeps its old unchecked behaviour.
    if (ctx.channel === 'staff' && !staffEntry) return true;

    if (!staffEntry && trap && String(trap).trim()) {
      res.status(201).json({ message: THANKS });
      return false;
    }
    if (req.rejectedFiles?.length) {
      const names = req.rejectedFiles.map((f) => f.filename || f.field).join(', ');
      return deny(res, 400, `We couldn't accept ${names}. Upload PDF, JPG or PNG files of up to 5 MB each.`);
    }
    if (!staffEntry) {
      const ip = clientIp(req);
      const ok = await allow([
        { key: `lead:${ip}:${ctx.def.type}`, limit: 5, windowSeconds: 600 },
        { key: `lead:${ip}`, limit: 30, windowSeconds: 86400 },
      ]);
      if (!ok) return deny(res, 429, "You've sent a few requests already. Please try again in a few minutes, or call us.");
    }

    if (staffEntry) {
      // Operations own what they enter, at their level. Sales entries go to the L1 pool as a new lead of their
      // own (never merged into someone else's). Admins may hand it to an operations employee or leave it in the pool.
      if (req.staff.role !== 'admin') {
        const level = levelOf(req.staff.persona);
        if (level) {
          ctx.assignee = { id: req.staff.id, name: req.staff.name };
          ctx.stage = level;
        } else ctx.noMerge = true;
      } else if (assignTo) {
        const employee = await Employee.findOne({ _id: assignTo, deleteFlag: false }).lean();
        if (!employee) return deny(res, 400, 'That employee no longer exists.');
        const level = levelOf(personaOf(employee));
        if (!level) return deny(res, 400, "Sales executives can't be assigned leads.");
        ctx.assignee = { id: String(employee._id), name: employee.name };
        ctx.stage = level;
      }
    }

    if (ctx.def.formKey) {
      const { validateLead } = await loadSchema();
      const errors = validateLead(ctx.def.formKey, body);
      if (Object.keys(errors).length) return deny(res, 400, 'Please check the highlighted fields.', { fields: errors });
    }
    if (ctx.mode !== 'legacy' && !ctx.meta.consent) {
      return deny(res, 400, staffEntry ? 'Confirm the customer agreed to be contacted.' : 'Please accept the privacy policy so we can contact you.');
    }
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
  if (ctx.mode === 'staff' && req.staff) source.addedBy = { id: req.staff.id, name: req.staff.name || req.staff.email || null, role: req.staff.role, persona: req.staff.persona || null };
  const dedupeKey = phone ? `${def.type}:${phone}` : null;
  const signinKey = phone ? `signin:${phone}` : null;
  // A signed-in customer who proved this number with an OTP makes the lead verified.
  const customer = ctx.userId ? await User.findById(ctx.userId).lean() : null;
  const verified = Boolean(phone && customer?.mobileVerified && normalizePhone(customer.mobile_no) === phone);

  // One transaction, locked on the duplicate key and the record: concurrent submissions from the same phone
  // produce one lead plus repeats, and the backfill cannot create a second envelope for the same record.
  return transaction(async (tx) => {
    await tx.lock(dedupeKey && `lead:dedupe:${dedupeKey}`, signinKey && `lead:dedupe:${signinKey}`, `lead:ref:${def.type}:${refId}`);
    const owner = await Lead.findOne({ type: def.type, refIds: refId });
    if (owner) return { lead: owner, repeat: false };

    const match =
      dedupeKey && !ctx.noMerge
        ? await Lead.findOne({ dedupeKey, status: { $in: OPEN }, lastActivityAt: { $gte: new Date(now - DEDUPE_MS) } }).sort({ lastActivityAt: -1 })
        : null;
    // An archived lead stays archived; a new submission starts a fresh one.
    const existing = match && !match.archived ? match : null;
    if (existing) {
      existing.refIds = [...(existing.refIds || []), refId];
      existing.refId = refId;
      existing.repeatCount = (existing.repeatCount || 0) + 1;
      existing.lastActivityAt = now;
      for (const k of ['name', 'email', 'amount', 'detail']) if (s[k]) existing[k] = String(s[k]);
      if (!existing.userId && ctx.userId) existing.userId = ctx.userId;
      if (ctx.meta?.consent) existing.consent = { ...ctx.meta.consent, at: now };
      if (verified && !existing.phoneVerified) Object.assign(existing, { phoneVerified: true, phoneVerifiedAt: now });
      // Only an owner working at the lead's current level can take it over.
      const assign = !existing.assignedTo && ctx.assignee && stageOf(existing) === (ctx.stage || 'l1');
      if (assign) {
        existing.assignedTo = ctx.assignee.id;
        existing.assignedName = ctx.assignee.name;
        if (!(existing.handledBy || []).includes(ctx.assignee.id)) existing.handledBy = [...(existing.handledBy || []), ctx.assignee.id];
      }
      await existing.save();
      tx.afterCommit(async () => {
        await emit(existing, 'lead.repeat', actor, { refId, source });
        if (assign) await emit(existing, 'lead.assigned', actor, assignedData(ctx, actor));
      });
      return { lead: existing, repeat: true };
    }

    // Signed in with an OTP earlier and now applying: the NUL lead becomes this product's lead, with the next
    // number for that product (NUL0007 becomes, say, HL0042; convertedFrom keeps NUL0007).
    const signin = signinKey && !ctx.noMerge ? await Lead.findOne({ dedupeKey: signinKey }) : null;
    if (signin && signin.type === 'signin' && !signin.archived && OPEN.includes(signin.status)) {
      const from = signin.ref;
      const placeholders = signin.refIds || [];
      signin.seq = await nextSeq(tx, def.type);
      Object.assign(signin, {
        type: def.type,
        formKey: def.formKey,
        refId,
        refIds: [refId],
        ref: formatRef(def.type, signin.seq),
        convertedFrom: from,
        dedupeKey,
        source: { ...source, previous: signin.source || null },
        lastActivityAt: now,
      });
      for (const k of ['name', 'email', 'amount', 'detail']) if (s[k]) signin[k] = String(s[k]).slice(0, k === 'detail' ? 300 : 200);
      if (!signin.userId && ctx.userId) signin.userId = ctx.userId;
      if (ctx.meta?.consent) signin.consent = { ...ctx.meta.consent, at: now };
      if (verified && !signin.phoneVerified) Object.assign(signin, { phoneVerified: true, phoneVerifiedAt: now });
      await signin.save();
      tx.afterCommit(async () => {
        await emit(signin, 'lead.converted', actor, { from, to: signin.ref, label: def.label, refId, source });
        for (const id of placeholders) await MobileSignin.findByIdAndDelete(id).catch(() => {});
      });
      return { lead: signin, repeat: false, converted: true };
    }

    const seq = await nextSeq(tx, def.type);
    const lead = await Lead.create({
      type: def.type,
      formKey: def.formKey,
      refId,
      refIds: [refId],
      ref: formatRef(def.type, seq),
      seq,
      phoneVerified: verified,
      phoneVerifiedAt: verified ? now : null,
      name: s.name ? String(s.name) : null,
      phone: phone || (s.phone ? String(s.phone) : null),
      email: s.email ? String(s.email) : null,
      amount: s.amount ? String(s.amount) : null,
      detail: s.detail ? String(s.detail).slice(0, 300) : null,
      status: 'new',
      assignedTo: ctx.assignee?.id || null,
      assignedName: ctx.assignee?.name || null,
      stage: ctx.stage || 'l1',
      handledBy: ctx.assignee ? [ctx.assignee.id] : [],
      userId: ctx.userId,
      source,
      consent: ctx.meta?.consent ? { ...ctx.meta.consent, at: now } : null,
      dedupeKey,
      repeatCount: 0,
      lastActivityAt: now,
    });
    tx.afterCommit(async () => {
      await emit(lead, 'lead.created', actor, { refId, source });
      if (ctx.assignee) await emit(lead, 'lead.assigned', actor, assignedData(ctx, actor));
    });
    return { lead, repeat: false };
  });
}

const assignedData = (ctx, actor) => ({ to: ctx.assignee.id, name: ctx.assignee.name, claimed: ctx.assignee.id === actor.id });

function persist(controller) {
  return async (req, res) => {
    const ctx = req.leadCtx;
    const saves = [];
    const { shim, out, done } = captureResponse();
    await saveTracker.run(saves, async () => {
      await controller(req, shim, () => {});
      await Promise.race([done, new Promise((r) => setTimeout(r, RESPONSE_TIMEOUT_MS))]);
    });
    if (!out.sent || out.status < 200 || out.status >= 300) {
      // The record was not saved, so files stored for it would be unreachable.
      for (const value of req.storedFiles || []) deleteStoredFile(value);
    }
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
      const lead = result?.lead;
      return res.status(201).json({
        message: THANKS,
        leadId: lead?._id || null,
        leadRef: lead?.ref || null,
        phoneVerified: Boolean(lead?.phoneVerified),
        repeat: Boolean(result?.repeat),
      });
    }
    if (ok && ctx.mode === 'staff') {
      const lead = result?.lead;
      return res.status(201).json({
        message: 'Lead added.',
        leadId: lead ? String(lead._id) : null,
        leadRef: lead?.ref || null,
        type: ctx.def.type,
        repeat: Boolean(result?.repeat),
        assignedTo: lead?.assignedTo || null,
        assignedName: lead?.assignedName || null,
        stage: lead ? stageOf(lead) : null,
      });
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

  const intake = (mode, channel) => {
    const handler = async (req, res) => {
      const def = byFormKey[req.params.formKey];
      const handlers = def && originals.get(def.type);
      if (!handlers) return res.status(404).json({ message: 'Unknown form.', status: 404 });
      if (!hasMultipart(handlers)) req.body = await parseBody(req);
      await runChain(buildChain(def, handlers, { mode, channel }), req, res);
    };
    handler.$body = 'deferred';
    return handler;
  };
  app.post('/api/leads/:formKey', intake('new', 'web_form'));
  // Admins and employees entering a lead by hand (phone call, walk-in) through the same form and checks.
  app.post('/api/admin/leads/:formKey', requireStaff, intake('staff', 'staff'));
}

const alertLabel = (lead) => {
  const label = byType[lead.type]?.label || lead.type;
  return lead.ref ? `${label} (${lead.ref})` : label;
};

on('lead.created', async function whatsappAlert(lead) {
  await notifyNewLead(lead, alertLabel(lead));
});

// A mobile sign-in that turns into an application is news for the team as well.
on('lead.converted', async function whatsappAlert(lead) {
  await notifyNewLead(lead, alertLabel(lead));
});

module.exports = { installLeadIntake, upsertLead, normalizePhone, HONEYPOT, clientIp, takeMeta };
