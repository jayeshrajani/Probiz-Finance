const jobs = require('../controllers/jobs.controller');
const { requireAdmin } = require('../middlewares/staffAuth');

module.exports = (app) => {
    // Public, read-only; must also be listed in PUBLIC_READS (server/routes/index.js).
    app.get('/api/jobs', jobs.listPublic);
    app.get('/api/admin/jobs', requireAdmin, jobs.listAdmin);
    app.post('/api/admin/jobs', requireAdmin, jobs.create);
    app.put('/api/admin/jobs/:id', requireAdmin, jobs.update);
    app.delete('/api/admin/jobs/:id', requireAdmin, jobs.remove);
};
