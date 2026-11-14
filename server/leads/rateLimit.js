const db = require('../db');

let ready = null;
const ensure = () =>
  (ready ||= db
    .query(`CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL, count integer NOT NULL)`)
    .catch((err) => {
      ready = null;
      throw err;
    }));

// Fixed-window counter stored in Postgres, so it holds across serverless instances.
async function hit(key, windowSeconds) {
  await ensure();
  const rows = await db.query(
    `INSERT INTO rate_limits (key, window_start, count) VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start < now() - $2::interval THEN 1 ELSE rate_limits.count + 1 END,
       window_start = CASE WHEN rate_limits.window_start < now() - $2::interval THEN now() ELSE rate_limits.window_start END
     RETURNING count`,
    [key, `${windowSeconds} seconds`]
  );
  return Number(rows[0]?.count || 0);
}

async function allow(rules) {
  for (const { key, limit, windowSeconds } of rules) {
    if ((await hit(key, windowSeconds)) > limit) return false;
  }
  return true;
}

module.exports = { allow };
