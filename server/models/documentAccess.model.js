const mongoose = require('../odm');

// Who opened which private customer document, and when. Kept when the lead is deleted (access logs: at least one year).
const documentAccessSchema = mongoose.Schema(
  {
    at: { type: Date, required: true },
    path: { type: String, required: true },
    staffId: { type: String, default: null },
    staffName: { type: String, default: null },
    role: { type: String, default: null },
    leadId: { type: String, default: null },
    leadType: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentAccess', documentAccessSchema);
