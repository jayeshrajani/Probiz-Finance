// Usage: npm run seed:jobs (stop `next dev` first when using the local PGlite database).
// Adds the careers roles from content/company.json only while there are no jobs yet. Safe to run repeatedly.
require('@next/env').loadEnvConfig(process.cwd());
const { seedJobs } = require('../server/controllers/jobs.controller');

seedJobs()
  .then(({ created }) => {
    console.log(created ? `Added ${created} jobs.` : 'Jobs already exist; nothing changed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
