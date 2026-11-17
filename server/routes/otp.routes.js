const otp = require('../controllers/otp.controller');

module.exports = (app) => {
  app.get('/api/otp/status', otp.status);
  app.post('/api/otp/send', otp.send);
  app.post('/api/otp/verify', otp.verify);
  app.get('/api/cron/purge', otp.cron);
};
