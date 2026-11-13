const mongoose = require('../odm');

// Staff-side workflow for any lead: status, owner and an append-only note log.
const leadMetaSchema = mongoose.Schema(
  {
    type: { type: String, required: true },
    leadId: { type: String, required: true },
    status: { type: String, default: 'new' },
    assignedTo: { type: String, default: null },
    assignedName: { type: String, default: null },
    notes: [{ text: String, by: String, at: Date }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadMeta', leadMetaSchema);
