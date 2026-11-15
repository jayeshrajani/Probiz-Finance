// Chooses the persistence adapter for the ODM. Postgres/PGlite is the default.
// Firestore is limited to the local emulator until a cloud project is approved (no billing, no deployment).
const tx = require('./tx');

const BACKENDS = ['postgres', 'firestore'];
let active = null;

function load(name) {
  if (!BACKENDS.includes(name)) throw new Error(`Unknown DATA_BACKEND "${name}" (expected "postgres" or "firestore").`);
  if (name === 'postgres') return require('./postgres');
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('DATA_BACKEND=firestore is only available with the Firestore emulator (FIRESTORE_EMULATOR_HOST).');
  }
  return require('./firestore');
}

function adapter() {
  if (!active) active = load(String(process.env.DATA_BACKEND || 'postgres').trim().toLowerCase());
  return active;
}

// For tests that compare both backends in one process.
function useBackend(name) {
  active = load(name);
  return active;
}

// Runs fn(tx) in one native transaction of the active backend; joins the current one when nested.
// tx.lock(...keys) serialises transactions on the same keys; tx.afterCommit(fn) runs fn only after the commit.
// fn may run more than once, so side effects belong in afterCommit.
const transaction = (fn) => adapter().transaction(fn);

module.exports = { adapter, useBackend, transaction, currentTransaction: tx.current };
