// Usage: npm run seed:site-settings (stop `next dev` first when using the local PGlite database).
// Creates the website settings record with the approved values from content/site-settings.json only if it
// does not exist yet. Never overwrites settings saved by an admin. Safe to run repeatedly.
require('@next/env').loadEnvConfig(process.cwd());
const { seedSiteSettings } = require('../server/controllers/siteSettings.controller');

seedSiteSettings()
  .then(({ created }) => {
    console.log(created ? 'Website settings created with the initial values.' : 'Website settings already exist; nothing changed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
