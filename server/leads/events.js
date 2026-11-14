const LeadEvent = require('../models/leadEvent.model');

const listeners = new Map();
const HANDLER_TIMEOUT_MS = 6000;

function on(type, handler) {
  if (!listeners.has(type)) listeners.set(type, []);
  listeners.get(type).push(handler);
}

async function record(leadId, type, actor, data) {
  return LeadEvent.create({ leadId, type, at: new Date(), actor: actor || { kind: 'system' }, data: data || null });
}

const withTimeout = (promise) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), HANDLER_TIMEOUT_MS))]);

// Records the event, then runs listeners. A failing listener is logged as an event and never fails the caller.
async function emit(lead, type, actor, data) {
  const event = await record(lead._id, type, actor, data);
  for (const handler of listeners.get(type) || []) {
    try {
      await withTimeout(handler(lead, event));
    } catch (err) {
      await record(lead._id, 'notification.failed', { kind: 'system' }, { handler: handler.name || 'listener', error: String(err.message || err) }).catch(() => {});
    }
  }
  return event;
}

module.exports = { on, emit, record };
