const { app, routes } = require('../http');
const db = require('../db');
const { requireAdmin, requireAdminUnlessFirst } = require('../middlewares/staffAuth');

app.get('/api/health', async (req, res) => {
    try {
        await db.ping();
        res.status(200).json({ status: 'ok' });
    } catch {
        res.status(503).json({ status: 'db_unavailable' });
    }
});

require('./admin.routes')(app);
require('./user.routes')(app);
require('./calculator.route')(app);
require('./adminPanel.routes')(app);

// Every lead form (old URLs and POST /api/leads/:formKey) goes through one intake pipeline.
require('../leads/intake').installLeadIntake(app, routes);

// Customer data must never be readable without an admin token. Public reads and form submissions stay open.
const PUBLIC_READS = new Set([
    '/api/health',
    '/api/getFilterProperties',
    '/api/getPropertyById/:id',
    '/api/getAllProperty',
    '/api/getAllAreas',
    '/api/getAreaById/:id',
]);
const ADMIN_WRITES = new Set(['/api/addInHouseProperty', '/api/addRoleByAdmin', '/api/addEmployee', '/api/bulkAddAreas']);

function adminOnly(route) {
    if (route.path.startsWith('/api/admin/')) return false;
    if (route.path.startsWith('/api/cashfree/')) return false;
    if (route.method === 'GET') return !PUBLIC_READS.has(route.path);
    if (route.method === 'PUT' || route.method === 'DELETE' || route.method === 'PATCH') {
        return route.path !== '/api/changeUserPassword/:usersRegId';
    }
    return ADMIN_WRITES.has(route.path);
}

for (const route of routes) {
    if (route.path === '/api/createAdmin') route.handlers.unshift(requireAdminUnlessFirst);
    else if (adminOnly(route)) route.handlers.unshift(requireAdmin);
}

module.exports = app;
