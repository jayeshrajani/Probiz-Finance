const mongoose = require('../odm')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const CreditScoreSchema = new Schema({
  name: {
    type: String,
    required: [true, "please enter user name"]
  },
  email: {
    type: String,
    required: [true, "please enter email"]
  },
  mobile_no: {
    type: String,
    required: [true, "please enter mobile_no"]
  },
  message: {
    type: String,
    required: false
  },

  // Surepass credit report pull
  status: {
    type: String,
    enum: ["initiated", "success", "failed"],
    default: "initiated"
  },
  provider: {
    type: String,
    default: "surepass"
  },
  providerRefId: {
    type: String,
    required: false
  },
  bureau: {
    type: String,
    required: false
  },
  score: {
    type: Number,
    required: false
  },
  reportRaw: {
    type: Schema.Types.Mixed,
    required: false
  },
  reportPdfRaw: {
    type: Schema.Types.Mixed,
    required: false
  },
  errorMessage: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model("CreditScore", CreditScoreSchema)

