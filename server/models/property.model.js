const mongoose = require('../odm');

const PropertySchema = new mongoose.Schema({
  ownerName:{ type: String, default: ''},
  contactNo:{ type: String, default: ''},
  propertyName: { type: String, default: '' },
  bhk_of_house: { type: String, default: '' },
  buildUpArea: { type: String, default: 0 },
  buildUp_type: { type: String, default: '' },
  propertyType: { type: String, default: '' },
  price: { type: Number, default: 0 },
  construction_year: { type: String, default: 0 },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  address: { type: String, default: '' },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: false
  },
  areaName: {
    type: String,
    default: '',
    trim: true
  },
  description: { type: String, default: '' },
  bathrooms: { type: String, default: 0 },
  carpetArea: { type: String, default: '' },
  propertyImage: { type: [String], default: [] },
  propertyVideo: { type: String, default: '' },
  houseFacing: {
    type: String,
    default: ''
  },
  plotArea: { type: String, default: 0 }, // In Sq feet
  numberOfBalconies: { type: String, default: 0 },
  furnishingStatus: {
    type: String,
    default: ''
  }
}, {
   timestamps: true   
});

module.exports = mongoose.model('Property', PropertySchema);
