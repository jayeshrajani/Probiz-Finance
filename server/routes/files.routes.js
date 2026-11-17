const { pipeline } = require('stream/promises');
const { readFileLink, openPrivateFile } = require('../storage');
const { clientIp } = require('../leads/intake');
const DocumentAccess = require('../models/documentAccess.model');

const notFound = (res) => res.status(404).json({ message: 'File not found.', status: 404 });
const text = (v, n = 120) => (typeof v === 'string' && v ? v.slice(0, n) : null);

module.exports = (app) => {
  // Private documents: the link is issued only to staff allowed to see the lead and expires after a few minutes.
  app.get('/api/files/:token', async (req, res) => {
    const link = readFileLink(req.params.token);
    if (!link) return notFound(res);
    const objectPath = link.path;
    // Errors are handled here because the router would log the request path, which contains the link token.
    let file = null;
    try {
      file = await openPrivateFile(objectPath);
      if (!file) return notFound(res);
      const by = link.by || {};
      // No log entry, no document.
      await DocumentAccess.create({
        at: new Date(),
        path: objectPath,
        staffId: text(by.staffId),
        staffName: text(by.staffName),
        role: text(by.role, 20),
        leadId: text(by.leadId),
        leadType: text(by.leadType, 60),
        ip: text(clientIp(req), 64),
      });
      const ext = objectPath.split('.').pop();
      res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
      if (Number.isFinite(file.size)) res.setHeader('Content-Length', String(file.size));
      res.setHeader('Content-Disposition', `inline; filename="document.${ext}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.statusCode = 200;
      await pipeline(file.stream, res);
    } catch (err) {
      file?.stream?.destroy?.();
      console.error('[files] read failed', objectPath, err.code || err.message);
      if (!res.headersSent) res.status(500).json({ message: 'Internal server error', status: 500 });
      else res.destroy();
    }
  });
};
