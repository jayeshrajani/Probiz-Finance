const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const Admin = require('../models/admin.model');
const Employee = require('../models/employee.model');

const TOKEN_TTL = '7d';

const signStaffToken = (id, role) => jwt.sign({ id, role }, config.secret, { expiresIn: TOKEN_TTL });
const signAdminToken = (id) => signStaffToken(id, 'admin');

// Resolves the Bearer token to a live admin or employee; removed accounts lose access immediately.
async function staffFromRequest(req) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.secret);
  } catch {
    return null;
  }
  if (!payload.id) return null;
  if (payload.role === 'admin') {
    const found = await Admin.findOne({ _id: payload.id, deleteFlag: false }).lean();
    if (!found) return null;
    const { password, ...admin } = found;
    return { id: String(found._id), role: 'admin', name: found.admin_Name, email: found.admin_Email, admin };
  }
  if (payload.role === 'employee') {
    const found = await Employee.findOne({ _id: payload.id, deleteFlag: false }).lean();
    if (!found) return null;
    return { id: String(found._id), role: 'employee', name: found.name, email: found.email, employeeId: found.employeeId, title: found.roll };
  }
  return null;
}

const deny = (res, message) => res.status(401).json({ message, status: 401 });

async function requireAdmin(req, res, next) {
  const staff = await staffFromRequest(req);
  if (!staff) return deny(res, 'Admin sign-in required.');
  if (staff.role !== 'admin') return res.status(403).json({ message: 'Only admins can do this.', status: 403 });
  req.staff = staff;
  req.admin = staff.admin;
  return next();
}

async function requireStaff(req, res, next) {
  const staff = await staffFromRequest(req);
  if (!staff) return deny(res, 'Staff sign-in required.');
  req.staff = staff;
  if (staff.role === 'admin') req.admin = staff.admin;
  return next();
}

// Lets the very first admin be created without a token; after that only admins can add admins.
async function requireAdminUnlessFirst(req, res, next) {
  const count = await Admin.countDocuments({ deleteFlag: false });
  if (count === 0) return next();
  return requireAdmin(req, res, next);
}

module.exports = { requireAdmin, requireStaff, requireAdminUnlessFirst, signAdminToken, signStaffToken };
