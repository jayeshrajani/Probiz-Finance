const mongoose = require('../odm');

// Append-only history of a lead: created, repeat, assigned, status_changed, note_added, notification.*.
const leadEventSchema = mongoose.Schema(
  {
    leadId: { type: String, required: true },
    type: { type: String, required: true },
    at: { type: Date, required: true },
    actor: { type: mongoose.Schema.Types.Mixed, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadEvent', leadEventSchema);
