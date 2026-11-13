const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const Admin = require('../models/admin.model');

const TOKEN_TTL = '7d';

function signAdminToken(adminId) {
  return jwt.sign({ id: adminId, role: 'admin' }, config.secret, { expiresIn: TOKEN_TTL });
}

async function adminFromRequest(req) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.secret);
  } catch {
    return null;
  }
  if (payload.role !== 'admin' || !payload.id) return null;
  const found = await Admin.findOne({ _id: payload.id, deleteFlag: false }).lean();
  return found || null;
}

async function requireAdmin(req, res, next) {
  const admin = await adminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ message: 'Admin sign-in required.', status: 401 });
  }
  const { password, ...safe } = admin;
  req.admin = safe;
  return next();
}

// Lets the very first admin be created without a token; after that only admins can add admins.
async function requireAdminUnlessFirst(req, res, next) {
  const count = await Admin.countDocuments({ deleteFlag: false });
  if (count === 0) return next();
  return requireAdmin(req, res, next);
}

module.exports = { requireAdmin, requireAdminUnlessFirst, signAdminToken };
