const settings = require('../controllers/siteSettings.controller');
const { requireAdmin } = require('../middlewares/staffAuth');

module.exports = (app) => {
    // Public, read-only; must also be listed in PUBLIC_READS (server/routes/index.js).
    app.get('/api/site-settings', settings.getPublic);
    // Admins only: employees get 403, customers and anonymous callers 401.
    app.get('/api/admin/site-settings', requireAdmin, settings.getAdmin);
    app.put('/api/admin/site-settings', requireAdmin, settings.update);
};
