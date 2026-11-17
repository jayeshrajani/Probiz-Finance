const mongoose = require('../odm');

// One pending code per purpose and number (document id = hash of both); only an HMAC of the code is stored.
const otpChallengeSchema = mongoose.Schema(
  {
    purpose: { type: String, required: true },
    phone: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    channel: { type: String, default: null },
    leadId: { type: String, default: null },
    userId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);
