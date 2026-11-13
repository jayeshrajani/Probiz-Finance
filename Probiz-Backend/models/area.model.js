const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const areaSchema = new Schema({
  name: {
    type: String,
    required: [true, "Area name is required"],
    trim: true,
    unique: true
  },
  city: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  pinCode: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deleteFlag: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Area', areaSchema);

