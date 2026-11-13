const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const gumastaLicenseSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: false
  },
  applicantAuthorizedPersonName: { type: String, required: true },
  fatherSpouseName: { type: String, required: true },
  designation: { type: String, required: true },
  mobileNo: { type: String, required: true },
  emailId: { type: String, required: true },
  aadhaarNo: { type: String, required: true },
  panNo: { type: String, required: true },
  firmName: { type: String, required: true },
  buildingShopNo: { type: String, required: true },
  streetRoad: { type: String, required: true },
  areaLocality: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  pinCode: { type: String, required: true },
  natureOfBusinessActivity: { type: String, required: true },
  category: {
    shop: { type: Boolean, default: false },
    commercialEstablishment: { type: Boolean, default: false }
  },
  premisesStatus: { type: String, required: true },
  dateOfEstablishment: { type: Date, required: true },
  totalEmployeesMale: { type: Number, default: 0 },
  totalEmployeesFemale: { type: Number, default: 0 },
  totalEmployeesDifferently: { type: Number, default: 0 },
  documentChecklist: {
    panCopy: { type: Boolean, default: false },
    aadhaarCopy: { type: Boolean, default: false },
    addressProof: { type: Boolean, default: false },
    photographOfSignboard: { type: Boolean, default: false },
    rentLeaseAgreement: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  remarks: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('GumastaLicense', gumastaLicenseSchema);
