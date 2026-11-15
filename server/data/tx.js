// Shared transaction context for the adapters. Each adapter supplies a native transaction (`begin`) and a
// key lock; this module tracks the active transaction for the ODM, undoes in-memory document state when an
// attempt is retried, and runs side effects only after the commit.
const { AsyncLocalStorage } = require('async_hooks');

const als = new AsyncLocalStorage();
const MAX_ATTEMPTS = 5;

function makeTx(state) {
  return {
    // Keys are de-duplicated and sorted so concurrent transactions always lock in the same order.
    lock: (...keys) => state.lock(state, [...new Set(keys.flat().filter((k) => k != null).map(String))].sort()),
    afterCommit: (fn) => { state.after.push(fn); },
    onRetry: (fn) => { state.undo.push(fn); },
  };
}

const currentState = () => als.getStore() || null;

function current() {
  const state = currentState();
  return state ? makeTx(state) : null;
}

// `begin(attempt)` must call `attempt(handle)` inside one native transaction (once per try) and resolve after
// the commit with its result.
async function run(begin, lock, fn) {
  const active = currentState();
  if (active) return fn(makeTx(active));
  let state = null;
  const undo = () => {
    if (state) for (const restore of state.undo.splice(0).reverse()) restore();
  };
  let result;
  try {
    result = await begin(async (handle) => {
      undo();
      state = { handle, lock, undo: [], after: [] };
      return als.run(state, () => fn(makeTx(state)));
    });
  } catch (err) {
    undo();
    throw err;
  }
  for (const cb of state.after) await cb();
  return result;
}

module.exports = { run, current, currentState, MAX_ATTEMPTS };
