const { pipeline } = require('stream/promises');
const { verifyFileLink, openPrivateFile } = require('../storage');

const notFound = (res) => res.status(404).json({ message: 'File not found.', status: 404 });

module.exports = (app) => {
  // Private documents: the link is issued only to staff allowed to see the lead and expires after a few minutes.
  app.get('/api/files/:token', async (req, res) => {
    const objectPath = verifyFileLink(req.params.token);
    if (!objectPath) return notFound(res);
    // Errors are handled here because the router would log the request path, which contains the link token.
    try {
      const file = await openPrivateFile(objectPath);
      if (!file) return notFound(res);
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
      console.error('[files] read failed', objectPath, err.code || err.message);
      if (!res.headersSent) res.status(500).json({ message: 'Internal server error', status: 500 });
      else res.destroy();
    }
  });
};
