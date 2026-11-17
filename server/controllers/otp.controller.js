// Mobile OTP: sign in with a mobile number, verify the number on an account, or verify the number on an application.
const jwt = require('jsonwebtoken');
const { timingSafeEqual } = require('crypto');
const config = require('../config/auth.config');
const User = require('../models/user.model');
const Lead = require('../models/lead.model');
const { allow } = require('../leads/rateLimit');
const { clientIp, takeMeta } = require('../leads/intake');
const { issue, check, purgeExpired } = require('../otp');
const { channels } = require('../otp/deliver');
const { customerForPhone, recordSignin, markPhoneVerified, purgeSigninLeads, digits10 } = require('../leads/mobile');

const MOBILE = /^[6-9]\d{9}$/;
const LEAD_VERIFY_DAYS = 7;
const fail = (res, status, message, extra) => res.status(status).json({ message, status, ...extra });
const masked = (phone) => `******${phone.slice(-4)}`;
const signToken = (id) => jwt.sign({ id }, config.secret, { expiresIn: 15552000 });

function publicUser(user) {
  const { password, ...rest } = user.toObject ? user.toObject() : user;
  return { ...rest, hasPassword: Boolean(password) };
}

async function signedInCustomer(req) {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7).trim(), config.secret);
    if (payload.role || !payload.id) return null;
    return await User.findOne({ _id: payload.id, deleteFlag: false });
  } catch {
    return null;
  }
}

// Who the code is for. Only sign-in takes a typed number; the others use the number already on the account or lead.
async function target(req, res) {
  const body = req.body || {};
  const purpose = String(body.purpose || '');
  if (purpose === 'signin') {
    const phone = digits10(body.mobile);
    if (!phone || !MOBILE.test(phone) || String(body.mobile).replace(/\D/g, '').length > 12) {
      fail(res, 400, 'Enter a 10-digit mobile number.');
      return null;
    }
    return { purpose, phone, scope: '' };
  }
  if (purpose === 'account') {
    const user = await signedInCustomer(req);
    if (!user) {
      fail(res, 401, 'Please sign in again.');
      return null;
    }
    const phone = digits10(user.mobile_no);
    if (!phone || !MOBILE.test(phone)) {
      fail(res, 400, 'Add a 10-digit mobile number to your details first.');
      return null;
    }
    return { purpose, phone, scope: String(user._id), user };
  }
  if (purpose === 'lead') {
    const leadId = String(body.leadId || '');
    const lead = leadId ? await Lead.findById(leadId).lean() : null;
    const phone = lead && digits10(lead.phone);
    const fresh = lead && Date.now() - new Date(lead.createdAt).getTime() < LEAD_VERIFY_DAYS * 24 * 60 * 60 * 1000;
    if (!lead || lead.archived || !phone || !fresh) {
      fail(res, 404, 'This request can no longer be verified here. Sign in with your mobile number instead.');
      return null;
    }
    return { purpose, phone, scope: leadId, lead };
  }
  fail(res, 400, 'Unknown request.');
  return null;
}

exports.send = async (req, res) => {
  const t = await target(req, res);
  if (!t) return;
  if (t.purpose === 'signin' && req.body?.consent !== true) return fail(res, 400, 'Please accept the privacy policy so we can contact you.');
  const ip = clientIp(req);
  // Codes cost money per message: per-number and per-address limits stop SMS pumping.
  const ok = await allow([
    { key: `otp:cool:${t.phone}`, limit: 1, windowSeconds: 30 },
    { key: `otp:phone:${t.phone}`, limit: 3, windowSeconds: 600 },
    { key: `otp:phone-day:${t.phone}`, limit: 10, windowSeconds: 86400 },
    { key: `otp:ip:${ip}`, limit: 10, windowSeconds: 600 },
    { key: `otp:ip-day:${ip}`, limit: 40, windowSeconds: 86400 },
  ]);
  if (!ok) return fail(res, 429, 'Please wait a little before asking for another code.');
  try {
    const sent = await issue({
      purpose: t.purpose,
      phone: t.phone,
      scope: t.scope,
      prefer: req.body?.channel === 'sms' ? 'sms' : 'whatsapp',
      leadId: t.lead ? String(t.lead._id) : null,
      userId: t.user ? String(t.user._id) : null,
    });
    res.json({ sent: true, to: masked(t.phone), smsAvailable: channels().sms, ...sent });
  } catch (err) {
    if (err.code === 'OTP_NOT_CONFIGURED') return fail(res, 503, "Mobile codes aren't available right now. Please use email or call us.");
    if (err.code === 'OTP_SEND_FAILED') return fail(res, 502, "We couldn't send the code. Please try again in a moment.");
    console.error('[otp] send failed', err.message);
    return fail(res, 500, 'Internal server error');
  }
};

exports.verify = async (req, res) => {
  const t = await target(req, res);
  if (!t) return;
  const ip = clientIp(req);
  if (!(await allow([{ key: `otp:verify-ip:${ip}`, limit: 30, windowSeconds: 600 }]))) return fail(res, 429, 'Too many tries. Please wait a few minutes.');
  const result = await check({ purpose: t.purpose, phone: t.phone, scope: t.scope, code: req.body?.code });
  if (!result.ok) {
    if (result.reason === 'locked') return fail(res, 429, 'Too many wrong tries. Ask for a new code.');
    if (result.reason === 'expired') return fail(res, 400, 'That code has expired. Ask for a new one.');
    return fail(res, 400, "That code isn't right. Check the message and try again.", { left: result.left });
  }

  if (t.purpose === 'signin') {
    const meta = takeMeta({ _meta: req.body?._meta });
    const { user, created } = await customerForPhone(t.phone);
    const actor = { kind: 'customer', id: String(user._id), name: user.user_Name || null };
    const { lead } = await recordSignin(user, t.phone, meta);
    await markPhoneVerified({ phone: t.phone, userId: String(user._id), actor, via: 'signin' });
    return res.json({ accessToken: signToken(String(user._id)), data: publicUser(user), isNew: created, leadRef: lead?.ref || null, message: 'Signed in.' });
  }
  if (t.purpose === 'account') {
    const actor = { kind: 'customer', id: String(t.user._id), name: t.user.user_Name || null };
    await markPhoneVerified({ phone: t.phone, userId: String(t.user._id), actor, via: 'account' });
    return res.json({ verified: true, message: 'Mobile number verified.' });
  }
  await markPhoneVerified({ phone: t.phone, userId: t.lead.userId || null, actor: { kind: 'customer', id: t.lead.userId || null, name: t.lead.name || null }, via: 'application' });
  return res.json({ verified: true, message: 'Mobile number verified.' });
};

// Daily cleanup (Vercel Cron sends "Authorization: Bearer $CRON_SECRET"): NUL leads older than 7 days, expired codes.
exports.cron = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return fail(res, 503, 'CRON_SECRET is not set.');
  const given = Buffer.from(String(req.headers.authorization || ''));
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return fail(res, 401, 'Unauthorized');
  const removedSigninLeads = await purgeSigninLeads();
  const removedCodes = await purgeExpired();
  res.setHeader('Cache-Control', 'no-store');
  res.json({ removedSigninLeads, removedCodes });
};

exports.status = (req, res) => {
  const c = channels();
  res.json({ available: c.whatsapp || c.sms || c.dev, whatsapp: c.whatsapp, sms: c.sms });
};
