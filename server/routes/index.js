const { app } = require('../http');
const db = require('../db');

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

module.exports = app;
