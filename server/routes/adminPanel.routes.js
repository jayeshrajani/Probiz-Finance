const panel = require('../controllers/adminPanel.controller');
const { requireAdmin } = require('../middlewares/requireAdmin');

module.exports = (app) => {
    app.get('/api/admin/me', requireAdmin, panel.me);
    app.put('/api/admin/me/password', requireAdmin, panel.changePassword);
    app.get('/api/admin/config', requireAdmin, panel.config);
    app.get('/api/admin/overview', requireAdmin, panel.overview);
    app.get('/api/admin/leads', requireAdmin, panel.list);
    app.get('/api/admin/leads/:type/:id', requireAdmin, panel.get);
    app.patch('/api/admin/leads/:type/:id', requireAdmin, panel.update);
    app.delete('/api/admin/leads/:type/:id', requireAdmin, panel.remove);
    app.get('/api/admin/admins', requireAdmin, panel.admins);
    app.delete('/api/admin/admins/:id', requireAdmin, panel.removeAdmin);
};
