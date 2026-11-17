const mongoose = require('../odm');

// The record behind a "Mobile sign-in" (NUL) lead: someone signed in with an OTP but has not applied yet.
const mobileSigninSchema = mongoose.Schema(
  {
    name: { type: String, default: null },
    mobile_no: { type: String, required: true },
    userId: { type: String, default: null },
    interest: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MobileSignin', mobileSigninSchema);
