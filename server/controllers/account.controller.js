const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Lead = require('../models/lead.model');
const { byType } = require('../admin/leads');
const { allow } = require('../leads/rateLimit');

const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;
const MOBILE = /^[6-9]\d{9}$/;
const CUSTOMER_LABELS = { contact: 'Message to Probiz' };

const fail = (res, status, message) => res.status(status).json({ message, status });

const profile = (u) => ({
  _id: String(u._id),
  user_Name: u.user_Name,
  user_Email: u.user_Email,
  mobile_no: u.mobile_no,
  country_code: u.country_code,
  createdAt: u.createdAt,
});

// Only leads submitted while signed in are linked; matching by phone would expose other people's applications.
exports.get = async (req, res) => {
  const leads = await Lead.find({ userId: String(req.customer._id) }).sort({ createdAt: -1 }).lean();
  res.json({
    user: profile(req.customer),
    applications: leads.map((l) => ({
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
  }
  me.user_Name = name;
  me.mobile_no = mobile;
  await me.save();
  res.json({ message: 'Details saved.', user: profile(me) });
};

exports.changePassword = async (req, res) => {
  const me = req.customer;
  const current = String(req.body?.current || '');
  const next = String(req.body?.next || '');
  if (!PASSWORD_RULE.test(next)) return fail(res, 400, 'Use 8+ characters with upper and lower case, a number and a symbol.');
  if (!(await allow([{ key: `account-password:${me._id}`, limit: 10, windowSeconds: 900 }]))) {
    return fail(res, 429, 'Too many attempts. Try again in 15 minutes.');
  }
  if (!bcrypt.compareSync(current, me.password)) return fail(res, 400, 'Current password is wrong.');
  me.password = bcrypt.hashSync(next, 10);
  await me.save();
  res.json({ message: 'Password updated.' });
};
