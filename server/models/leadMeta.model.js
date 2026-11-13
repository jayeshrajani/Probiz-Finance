const mongoose = require('../odm');

// Admin-side workflow for any lead: its status and an append-only note log.
const leadMetaSchema = mongoose.Schema(
  {
    type: { type: String, required: true },
    leadId: { type: String, required: true },
    status: { type: String, default: 'new' },
    notes: [{ text: String, by: String, at: Date }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadMeta', leadMetaSchema);
