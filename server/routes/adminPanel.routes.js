const panel = require('../controllers/adminPanel.controller');
const { requireAdmin, requireStaff } = require('../middlewares/staffAuth');
const { multipart } = require('../http');

const document = multipart(['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'], { visibility: 'private' }).fields([{ name: 'file', maxCount: 1 }]);

module.exports = (app) => {
    app.post('/api/staffLogin', panel.staffLogin);
    app.post('/api/employeeLogin', panel.employeeLogin);

    // Shared by admins and employees; the controller scopes what employees can see.
    app.get('/api/admin/me', requireStaff, panel.me);
    app.put('/api/admin/me/password', requireStaff, panel.changePassword);
    app.get('/api/admin/config', requireStaff, panel.config);
    app.get('/api/admin/overview', requireStaff, panel.overview);
    app.get('/api/admin/leads', requireStaff, panel.list);
    app.get('/api/admin/leads/:type/:id', requireStaff, panel.get);
    app.patch('/api/admin/leads/:type/:id', requireStaff, panel.update);
    // One document per request, attached to a lead on the add-lead page by the returned token.
    app.post('/api/admin/uploads', requireStaff, document, panel.upload);

    app.delete('/api/admin/leads/:type/:id', requireAdmin, panel.remove);
    app.get('/api/admin/admins', requireAdmin, panel.admins);
    app.delete('/api/admin/admins/:id', requireAdmin, panel.removeAdmin);
    app.get('/api/admin/employees', requireAdmin, panel.employees);
    app.post('/api/admin/employees', requireAdmin, panel.addEmployee);
    app.put('/api/admin/employees/:id', requireAdmin, panel.updateEmployee);
    app.delete('/api/admin/employees/:id', requireAdmin, panel.removeEmployee);
    app.put('/api/admin/employees/:id/password', requireAdmin, panel.resetEmployeePassword);
    app.put('/api/admin/employees/:id/target', requireAdmin, panel.setSalesTarget);
    // Admin-only: shows how the client address is resolved behind the hosting proxy (sets TRUST_PROXY_HOPS).
    app.get('/api/admin/client-ip', requireAdmin, panel.clientIp);
    app.get('/api/admin/document-access', requireAdmin, panel.documentAccess);
};
