// Mobile OTP outcomes: sign-in (account + "Mobile sign-in" NUL lead) and phone verification on leads and accounts.
const { transaction } = require('../odm');
const User = require('../models/user.model');
const Lead = require('../models/lead.model');
const MobileSignin = require('../models/mobileSignin.model');
const { emit } = require('./events');
const { formatRef, nextSeq } = require('./refs');

const OPEN = ['new', 'contacted', 'in_progress'];
const SIGNIN_LEAD_DAYS = 7;
const byActivity = (a, b) => new Date(b.lastActivityAt || b.createdAt) - new Date(a.lastActivityAt || a.createdAt);
const digits10 = (v) => {
  const d = String(v || '').replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : null;
};

// Older accounts store the number as typed.
const phoneVariants = (phone) => [phone, `0${phone}`, `91${phone}`, `+91${phone}`, `+91 ${phone}`];

// Finds the customer for this number or creates an OTP-only account. The number is proven by the OTP.
async function customerForPhone(phone) {
  const now = new Date();
  return transaction(async (tx) => {
    await tx.lock(`unique:user:mobile_no:${phone}`);
    const user = (await User.find({ mobile_no: { $in: phoneVariants(phone) } })).find((u) => !u.deleteFlag);
    if (user) {
      if (!user.mobileVerified) Object.assign(user, { mobileVerified: true, mobileVerifiedAt: now });
      await user.save();
      return { user, created: false };
    }
    const created = await User.create({ mobile_no: phone, country_code: '+91', signupMethod: 'otp', mobileVerified: true, mobileVerifiedAt: now });
    return { user: created, created: true };
  });
}

// An open lead for this number gets a "signed in" entry; otherwise a NUL lead is created (alerted on WhatsApp).
async function recordSignin(user, phone, meta = {}) {
  const now = new Date();
  const userId = String(user._id);
  const actor = { kind: 'customer', id: userId, name: user.user_Name || null };
  return transaction(async (tx) => {
    await tx.lock(`lead:dedupe:signin:${phone}`);
    const open = (await Lead.find({ phone })).filter((l) => !l.archived && OPEN.includes(l.status));
    const target = open.filter((l) => l.type !== 'signin').sort(byActivity)[0] || open.find((l) => l.type === 'signin');
    if (target) {
      target.lastActivityAt = now;
      if (!target.userId) target.userId = userId;
      if (!target.phoneVerified) Object.assign(target, { phoneVerified: true, phoneVerifiedAt: now });
      await target.save();
      tx.afterCommit(() => emit(target, 'lead.signed_in', actor, null));
      return { lead: target, created: false };
    }
    const seq = await nextSeq(tx, 'signin');
    const record = await MobileSignin.create({ name: user.user_Name || null, mobile_no: phone, userId });
    const source = { channel: 'otp_signin', ...(meta.source || {}) };
    const lead = await Lead.create({
      type: 'signin',
      formKey: null,
      refId: record._id,
      refIds: [record._id],
      ref: formatRef('signin', seq),
      seq,
      name: user.user_Name || null,
      phone,
      email: user.user_Email || null,
      status: 'new',
      stage: 'l1',
      handledBy: [],
      userId,
      source,
      consent: meta.consent ? { ...meta.consent, at: now } : null,
      dedupeKey: `signin:${phone}`,
      repeatCount: 0,
      lastActivityAt: now,
      phoneVerified: true,
      phoneVerifiedAt: now,
    });
    tx.afterCommit(() => emit(lead, 'lead.created', actor, { refId: record._id, source }));
    return { lead, created: true };
  });
}

// Every lead with this number (and the account, if given) is marked verified.
async function markPhoneVerified({ phone, userId = null, actor, via }) {
  const now = new Date();
  const [byPhone, byUser] = await Promise.all([Lead.find({ phone }), userId ? Lead.find({ userId }) : []]);
  const seen = new Set();
  let count = 0;
  for (const lead of [...byPhone, ...byUser]) {
    if (seen.has(String(lead._id)) || digits10(lead.phone) !== phone) continue;
    seen.add(String(lead._id));
    if (lead.phoneVerified) continue;
    Object.assign(lead, { phoneVerified: true, phoneVerifiedAt: now });
    await lead.save();
    await emit(lead, 'lead.phone_verified', actor, { via });
    count += 1;
  }
  if (userId) {
    const user = await User.findById(userId);
    if (user && digits10(user.mobile_no) === phone && !user.mobileVerified) {
      Object.assign(user, { mobileVerified: true, mobileVerifiedAt: now });
      await user.save();
    }
  }
  return count;
}

// NUL leads that never turned into an application are removed 7 days after the sign-in (the account stays).
async function purgeSigninLeads(now = new Date()) {
  const LeadEvent = require('../models/leadEvent.model');
  const cutoff = new Date(now.getTime() - SIGNIN_LEAD_DAYS * 24 * 60 * 60 * 1000);
  const stale = (await Lead.find({ type: 'signin' }).lean()).filter((l) => new Date(l.createdAt) < cutoff);
  let removed = 0;
  for (const row of stale) {
    const done = await transaction(async (tx) => {
      await tx.lock(`lead:dedupe:signin:${row.phone}`);
      const lead = await Lead.findById(row._id);
      // Converted in the meantime: it is a product lead now and stays.
      if (!lead || lead.type !== 'signin') return false;
      await LeadEvent.deleteMany({ leadId: String(lead._id) });
      for (const id of lead.refIds || []) await MobileSignin.findByIdAndDelete(id);
      await Lead.findByIdAndDelete(lead._id);
      return true;
    });
    if (done) removed += 1;
  }
  return removed;
}

module.exports = { customerForPhone, recordSignin, markPhoneVerified, purgeSigninLeads, digits10, SIGNIN_LEAD_DAYS };
