const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../models/user.model');

// Customer tokens carry only `id`; staff tokens also carry a role and are rejected here.
async function requireCustomer(req, res, next) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  let payload = null;
  try {
    payload = token ? jwt.verify(token, config.secret) : null;
  } catch {
    payload = null;
  }
  const user = payload?.id && !payload.role ? await User.findOne({ _id: payload.id, deleteFlag: false }) : null;
  if (!user) return res.status(401).json({ message: 'Please sign in again.', status: 401 });
  req.customer = user;
  return next();
}

module.exports = { requireCustomer };
