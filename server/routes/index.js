const { app, routes } = require('../http');
const { adapter } = require('../data');
const { requireAdmin, requireAdminUnlessFirst } = require('../middlewares/staffAuth');

app.get('/api/health', async (req, res) => {
    try {
        await adapter().ping();
        res.status(200).json({ status: 'ok' });
    } catch {
        res.status(503).json({ status: 'db_unavailable' });
    }
});

require('./admin.routes')(app);
require('./user.routes')(app);
require('./calculator.route')(app);
require('./adminPanel.routes')(app);
require('./account.routes')(app);
require('./siteSettings.routes')(app);
require('./files.routes')(app);
require('./jobs.routes')(app);

// Every lead form (old URLs and POST /api/leads/:formKey) goes through one intake pipeline.
require('../leads/intake').installLeadIntake(app, routes);
const { clientIp } = require('../leads/intake');
const { allow } = require('../leads/rateLimit');

// Customer data must never be readable without an admin token. Public reads and form submissions stay open.
const PUBLIC_READS = new Set([
    '/api/health',
    '/api/getFilterProperties',
    '/api/getPropertyById/:id',
    '/api/getAllProperty',
    '/api/getAllAreas',
    '/api/getAreaById/:id',
    '/api/site-settings',
    '/api/jobs',
    // Protected by its own short-lived signed link instead of a bearer token (browsers open it directly).
    '/api/files/:token',
]);
const ADMIN_WRITES = new Set(['/api/addInHouseProperty', '/api/addRoleByAdmin', '/api/addEmployee', '/api/bulkAddAreas']);

function adminOnly(route) {
    if (route.path.startsWith('/api/admin/')) return false;
    if (route.path === '/api/account' || route.path.startsWith('/api/account/')) return false;
    if (route.path.startsWith('/api/cashfree/')) return false;
    if (route.method === 'GET') return !PUBLIC_READS.has(route.path);
    if (route.method === 'PUT' || route.method === 'DELETE' || route.method === 'PATCH') {
        return route.path !== '/api/changeUserPassword/:usersRegId';
    }
    return ADMIN_WRITES.has(route.path);
}

// The public "add property" form stores uploads anonymously, so it gets the same IP limits as lead forms.
async function limitPropertyUploads(req, res, next) {
    const ip = clientIp(req);
    const ok = await allow([
        { key: `property:${ip}`, limit: 5, windowSeconds: 600 },
        { key: `property-day:${ip}`, limit: 30, windowSeconds: 86400 },
    ]);
    if (!ok) return res.status(429).json({ message: "You've sent a few requests already. Please try again in a few minutes, or call us.", status: 429 });
    return next();
}

// Password checks (sign-in and password change) get per-IP limits against guessing.
const PASSWORD_ROUTES = new Set(['/api/adminLogin', '/api/staffLogin', '/api/employeeLogin', '/api/userLogin',
    '/api/changeUserPassword/:usersRegId', '/api/admin/me/password']);
async function limitPasswordAttempts(req, res, next) {
    const ip = clientIp(req);
    const ok = await allow([
        { key: `login:${ip}`, limit: 20, windowSeconds: 600 },
        { key: `login-day:${ip}`, limit: 200, windowSeconds: 86400 },
    ]);
    if (!ok) return res.status(429).json({ message: 'Too many attempts. Please wait a few minutes and try again.', status: 429 });
    return next();
}

for (const route of routes) {
    if (PASSWORD_ROUTES.has(route.path)) route.handlers.unshift(limitPasswordAttempts);
    if (route.path === '/api/createAdmin') route.handlers.unshift(requireAdminUnlessFirst);
    else if (route.method === 'POST' && route.path === '/api/addProperty') route.handlers.unshift(limitPropertyUploads);
    else if (adminOnly(route)) route.handlers.unshift(requireAdmin);
}

module.exports = app;
