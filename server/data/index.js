// Chooses the persistence adapter for the ODM. Postgres/PGlite is the default.
// Firestore runs against the emulator, or a real project only when explicitly confirmed (server/firebase/admin.js).
const tx = require('./tx');

const BACKENDS = ['postgres', 'firestore'];
let active = null;

function load(name) {
  if (!BACKENDS.includes(name)) throw new Error(`Unknown DATA_BACKEND "${name}" (expected "postgres" or "firestore").`);
  if (name === 'postgres') return require('./postgres');
  const { firebaseTarget } = require('../firebase/admin');
  if (firebaseTarget().mode === 'emulator' && !process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('DATA_BACKEND=firestore with the emulators needs FIRESTORE_EMULATOR_HOST.');
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
