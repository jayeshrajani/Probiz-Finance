const mongoose = require('../odm');

const PropertyInHouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  contactNumber: {
    type: String,
    required: false,
    match: /^[0-9]{10}$/
  },
  alternateContactNumber: {
    type: String,
    match: /^[0-9]{10}$/,
    default: ''
  },
  budget: {
    type: Number,
    required: false,
    min: 0
  },
  location: {
    type: String,
    required: false
  },
  size: {
    type: String 
  },
  bhk: {
    type: String,
    min: 0
  },
  propertyType: {
    type: String,
    required: false,
  },
  width: {
    type: Number,
    min: 0
  },
  length: {
    type: Number,
    min: 0
  },
  houseFacing: {
    type: String,
  },
  loanAmountRequired: {
    type: Number,
    min: 0
  },
  cashInHand: {
    type: Number,
    min: 0
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('Property InHouse', PropertyInHouseSchema);
