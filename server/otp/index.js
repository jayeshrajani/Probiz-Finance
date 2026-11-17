// One-time codes: 6 digits, valid 5 minutes, at most 5 tries, single use. Only an HMAC of the code is stored.
const { createHash, createHmac, hkdfSync, randomInt, timingSafeEqual } = require('crypto');
const { transaction } = require('../odm');
const OtpChallenge = require('../models/otpChallenge.model');
const { deliver } = require('./deliver');

const TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function hmacKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return Buffer.from(hkdfSync('sha256', secret, 'probiz-otp', 'probiz-otp-v1', 32));
}

// `scope` separates codes for the same number, e.g. verifying one particular lead.
const challengeId = (purpose, phone, scope = '') => createHash('sha256').update(`${purpose}:${phone}:${scope}`).digest('hex');
const hashCode = (id, code) => createHmac('sha256', hmacKey()).update(`${id}:${code}`).digest('hex');

// Creates (or replaces) the pending code and sends it. Returns { channel, expiresIn, devCode? }.
async function issue({ purpose, phone, scope = '', prefer, leadId = null, userId = null }) {
  const id = challengeId(purpose, phone, scope);
  const code = String(randomInt(0, 1000000)).padStart(6, '0');
  const doc = (await OtpChallenge.findById(id)) || new OtpChallenge({ _id: id });
  Object.assign(doc, {
    purpose,
    phone,
    codeHash: hashCode(id, code),
    expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
    attempts: 0,
    leadId,
    userId,
  });
  await doc.save();
  let channel;
  try {
    channel = await deliver(phone, code, TTL_MINUTES, prefer);
  } catch (err) {
    await doc.deleteOne().catch(() => {});
    throw err;
  }
  doc.channel = channel;
  await doc.save();
  return { channel, expiresIn: TTL_MINUTES * 60, ...(channel === 'dev' ? { devCode: code } : {}) };
}

// { ok: true, challenge } or { ok: false, reason: 'expired' | 'wrong' | 'locked', left }.
function check({ purpose, phone, scope = '', code }) {
  const id = challengeId(purpose, phone, scope);
  return transaction(async (tx) => {
    await tx.lock(`otp:${id}`);
    const doc = await OtpChallenge.findById(id);
    if (!doc || new Date(doc.expiresAt) < new Date()) return { ok: false, reason: 'expired' };
    if (doc.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'locked' };
    const given = Buffer.from(hashCode(id, String(code || '').trim()));
    const expected = Buffer.from(String(doc.codeHash));
    if (!/^\d{6}$/.test(String(code || '').trim()) || given.length !== expected.length || !timingSafeEqual(given, expected)) {
      doc.attempts += 1;
      await doc.save();
      return { ok: false, reason: doc.attempts >= MAX_ATTEMPTS ? 'locked' : 'wrong', left: MAX_ATTEMPTS - doc.attempts };
    }
    const challenge = doc.toObject();
    await doc.deleteOne();
    return { ok: true, challenge };
  });
}

// Expired codes are removed by the daily cleanup.
async function purgeExpired(now = new Date()) {
  const old = await OtpChallenge.find({ expiresAt: { $lt: new Date(now.getTime() - 60 * 60 * 1000) } }).lean();
  for (const doc of old) await OtpChallenge.findByIdAndDelete(doc._id);
  return old.length;
}

module.exports = { issue, check, purgeExpired, TTL_MINUTES, MAX_ATTEMPTS };
