const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Lead = require('../models/lead.model');
const MobileSignin = require('../models/mobileSignin.model');
const { byType } = require('../admin/leads');
const { allow } = require('../leads/rateLimit');
const { emit } = require('../leads/events');

const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;
const MOBILE = /^[6-9]\d{9}$/;
const CUSTOMER_LABELS = { contact: 'Message to Probiz' };
const OPEN = ['new', 'contacted', 'in_progress'];
// Offered after a mobile sign-in: "What can we help you with?"
const INTEREST_TYPES = ['homeloan', 'lap', 'personal', 'business', 'car', 'gold', 'creditcard', 'health', 'motor', 'investment', 'ca', 'gstreg', 'itrfiling'];

const fail = (res, status, message) => res.status(status).json({ message, status });

const profile = (u) => ({
  _id: String(u._id),
  user_Name: u.user_Name,
  user_Email: u.user_Email,
  mobile_no: u.mobile_no,
  country_code: u.country_code,
  mobileVerified: Boolean(u.mobileVerified),
  hasPassword: Boolean(u.password),
  signupMethod: u.signupMethod || 'password',
  createdAt: u.createdAt,
});

const openSignin = (leads) => leads.find((l) => l.type === 'signin' && !l.archived && OPEN.includes(l.status)) || null;

// Only leads submitted while signed in are linked; matching by phone would expose other people's applications.
exports.get = async (req, res) => {
  const leads = await Lead.find({ userId: String(req.customer._id) }).sort({ createdAt: -1 }).lean();
  const signin = openSignin(leads);
  res.json({
    user: profile(req.customer),
    // A mobile sign-in without an application yet: the account page asks what they need.
    interest: signin
      ? {
          chosen: signin.detail || null,
          options: INTEREST_TYPES.map((t) => ({ type: t, label: byType[t].label, page: byType[t].page })),
        }
      : null,
    applications: leads.filter((l) => l.type !== 'signin').map((l) => ({
      id: String(l._id),
      product: CUSTOMER_LABELS[l.type] || byType[l.type]?.label || l.type,
      page: byType[l.type]?.page || null,
      status: l.status,
      amount: l.amount,
      advisor: l.assignedName || null,
      createdAt: l.createdAt,
      updatedAt: l.lastActivityAt || l.updatedAt,
    })),
  });
};

exports.update = async (req, res) => {
  const me = req.customer;
  const name = String(req.body?.user_Name ?? '').trim();
  const mobile = String(req.body?.mobile_no ?? '').trim();
  if (!name || name.length > 100) return fail(res, 400, 'Enter your full name.');
  if (!MOBILE.test(mobile)) return fail(res, 400, 'Enter a 10-digit mobile number.');
  if (mobile !== me.mobile_no) {
    const taken = await User.findOne({ mobile_no: mobile }).lean();
    if (taken && String(taken._id) !== String(me._id)) return fail(res, 409, 'That mobile number is already registered.');
    // A new number has to be proven again.
    me.mobileVerified = false;
    me.mobileVerifiedAt = null;
  }
  me.user_Name = name;
  me.mobile_no = mobile;
  await me.save();
  // The name also goes on an open mobile sign-in lead, so staff see who signed in.
  const signin = openSignin(await Lead.find({ userId: String(me._id) }));
  if (signin && signin.name !== name) {
    signin.name = name;
    await signin.save();
  }
  res.json({ message: 'Details saved.', user: profile(me) });
};

// "What can we help you with?" after a mobile sign-in: noted on the NUL lead; the application converts it.
exports.interest = async (req, res) => {
  const type = String(req.body?.type || '');
  if (!INTEREST_TYPES.includes(type)) return fail(res, 400, 'Pick one of the options.');
  const signin = openSignin(await Lead.find({ userId: String(req.customer._id) }));
  if (signin) {
    const label = byType[type].label;
    signin.detail = label;
    signin.lastActivityAt = new Date();
    await signin.save();
    for (const id of signin.refIds || []) await MobileSignin.findByIdAndUpdate(id, { interest: label });
    await emit(signin, 'lead.interest', { kind: 'customer', id: String(req.customer._id), name: req.customer.user_Name || null }, { type, label });
  }
  res.json({ page: byType[type].page });
};

exports.changePassword = async (req, res) => {
  const me = req.customer;
  const current = String(req.body?.current || '');
  const next = String(req.body?.next || '');
  if (!PASSWORD_RULE.test(next)) return fail(res, 400, 'Use 8+ characters with upper and lower case, a number and a symbol.');
  if (!(await allow([{ key: `account-password:${me._id}`, limit: 10, windowSeconds: 900 }]))) {
    return fail(res, 429, 'Too many attempts. Try again in 15 minutes.');
  }
  // Mobile-only accounts have no password yet; signing in proved the number.
  if (me.password && !bcrypt.compareSync(current, me.password)) return fail(res, 400, 'Current password is wrong.');
  me.password = bcrypt.hashSync(next, 10);
  await me.save();
  res.json({ message: 'Password updated.' });
};
