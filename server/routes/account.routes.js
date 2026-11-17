const account = require('../controllers/account.controller');
const { requireCustomer } = require('../middlewares/customerAuth');

module.exports = (app) => {
    app.get('/api/account', requireCustomer, account.get);
    app.patch('/api/account', requireCustomer, account.update);
    app.put('/api/account/password', requireCustomer, account.changePassword);
    app.post('/api/account/interest', requireCustomer, account.interest);
};
