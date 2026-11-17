const mongoose = require('../odm');

// Named counters (document id = counter name), incremented inside a transaction.
const counterSchema = mongoose.Schema({ value: { type: Number, default: 0 } }, { timestamps: true });

module.exports = mongoose.model('Counter', counterSchema);
