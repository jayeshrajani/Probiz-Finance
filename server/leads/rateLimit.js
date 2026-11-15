const { adapter } = require('../data');

// Fixed-window counters in the active database, so they hold across serverless instances.
// Each rule is { key, limit, windowSeconds }; rules are checked in order and the first exceeded one stops.
const allow = (rules) => adapter().rateLimit(rules);

module.exports = { allow };
