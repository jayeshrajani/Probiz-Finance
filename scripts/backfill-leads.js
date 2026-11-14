// Usage: npm run backfill:leads (stop `next dev` first when using the local PGlite database).
// Creates Lead envelopes for any form submissions that don't have one. Safe to run repeatedly.
require('@next/env').loadEnvConfig(process.cwd());
const { backfillLeads } = require('../server/leads/backfill');

backfillLeads()
  .then(({ created }) => {
    console.log(`Created ${created} lead envelope(s).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
