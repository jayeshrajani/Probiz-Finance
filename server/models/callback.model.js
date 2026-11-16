const mongoose = require('../odm');
const Schema = mongoose.Schema;

// Short "call me back" requests from the quick form and the website assistant.
const callbackSchema = new Schema(
  {
    name: { type: String, required: [true, 'please enter name'] },
    mobile_no: { type: String, required: [true, 'please enter mobile_no'] },
    interest: { type: String },
    city: { type: String },
    message: { type: String },
    language: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Callback', callbackSchema);
