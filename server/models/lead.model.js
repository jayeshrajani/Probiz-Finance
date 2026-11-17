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
    // Operations level working the lead (l1 | l2); missing on older records means l1.
    stage: { type: String, default: 'l1' },
    // The L1 owner at the time it went to L2, so L2 can send it back to them.
    l1Owner: { type: mongoose.Schema.Types.Mixed, default: null },
    // Everyone who has owned the lead; they keep a read-only view after it moves on.
    handledBy: [String],
    userId: { type: String, default: null },
    source: { type: mongoose.Schema.Types.Mixed, default: null },
    consent: { type: mongoose.Schema.Types.Mixed, default: null },
    dedupeKey: { type: String, default: null },
    repeatCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: null },
    // Archived leads are kept but hidden from every list and count except the admin Archived view.
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    archivedBy: { type: String, default: null },
    // Reference shown to staff: product code + sequence (NUL-000042 becomes HL-000042 when the customer applies).
    ref: { type: String, default: null },
    seq: { type: Number, default: null },
    convertedFrom: { type: String, default: null },
    // The customer proved the phone number with an OTP.
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
