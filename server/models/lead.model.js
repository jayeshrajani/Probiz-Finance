const mongoose = require('../odm');

// One row per lead, whatever form it came from. The full application stays in the per-form table (refIds).
const leadSchema = mongoose.Schema(
  {
    type: { type: String, required: true },
    formKey: { type: String, default: null },
    refId: { type: String, required: true },
    refIds: [String],
    name: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    amount: { type: String, default: null },
    detail: { type: String, default: null },
    status: { type: String, default: 'new' },
    assignedTo: { type: String, default: null },
    assignedName: { type: String, default: null },
    userId: { type: String, default: null },
    source: { type: mongoose.Schema.Types.Mixed, default: null },
    consent: { type: mongoose.Schema.Types.Mixed, default: null },
    dedupeKey: { type: String, default: null },
    repeatCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
