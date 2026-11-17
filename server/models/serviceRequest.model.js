const mongoose = require('../odm');

// Registration and filing requests (GST, Gumasta, ITR, rent agreement, Udyam). Field names match lib/forms.js.
const SERVICE_FIELDS = {
  gst: ['name', 'mobile_no', 'email', 'businessName', 'tradeName', 'constitution', 'pan', 'businessAddress', 'state', 'district', 'premises', 'commencementDate', 'activity', 'turnoverEstimate', 'hsnCodes', 'sacCodes', 'partners', 'bankName', 'ifscCode', 'accountNumber'],
  gumasta: ['name', 'mobile_no', 'email', 'applicantType', 'designation', 'fatherSpouseName', 'aadhaarNo', 'pan', 'firmName', 'category', 'firmAddress', 'city', 'district', 'pinCode', 'natureOfBusiness', 'commencementDate', 'premises', 'employeesMale', 'employeesFemale', 'employeesDisabled'],
  itr: ['formType', 'name', 'mobile_no', 'email', 'pan', 'dateOfBirth', 'grossSalary', 'tdsForm16', 'turnover', 'expenses', 'netProfit', 'otherIncome', 'deductions', 'tds26as', 'advanceTax', 'bankName', 'ifscCode', 'accountNumber', 'accountType'],
  rent: ['name', 'mobile_no', 'email', 'role', 'landlordName', 'landlordMobile', 'landlordAddress', 'tenantName', 'tenantMobile', 'tenantAddress', 'propertyAddress', 'propertyType', 'usage', 'furnishing', 'startDate', 'durationMonths', 'monthlyRent', 'deposit', 'noticeMonths'],
  udyam: ['name', 'mobile_no', 'email', 'aadhaarNo', 'pan', 'enterpriseName', 'organisationType', 'gstin', 'address', 'city', 'pinCode', 'startDate', 'majorActivity', 'nicCode', 'employees', 'investment', 'turnover', 'bankName', 'ifscCode', 'accountNumber'],
};

const SERVICE_FILES = {
  gst: ['panCard', 'aadharCard', 'photo', 'addressProof', 'rentAgreement', 'bankProof'],
  gumasta: ['panCard', 'aadharCard', 'addressProof', 'signboardPhoto', 'rentAgreement'],
  itr: ['panCard', 'aadharCard', 'form16', 'form26as', 'bankStatement', 'investmentProofs', 'businessAccounts'],
  rent: ['landlordId', 'tenantId', 'ownershipProof', 'societyNoc', 'meterPhotos'],
  udyam: ['aadharCard', 'panCard', 'gstCertificate', 'bankProof'],
};

const MODEL_NAMES = {
  gst: 'GstRegistrationRequest',
  gumasta: 'GumastaLicenseRequest',
  itr: 'ItrFilingRequest',
  rent: 'RentAgreementRequest',
  udyam: 'UdyamRegistrationRequest',
};

const models = Object.fromEntries(
  Object.entries(SERVICE_FIELDS).map(([key, fields]) => {
    const shape = Object.fromEntries(fields.map((f) => [f, { type: String, default: null }]));
    shape.uploadedDocuments = { type: mongoose.Schema.Types.Mixed, default: null };
    return [key, mongoose.model(MODEL_NAMES[key], mongoose.Schema(shape, { timestamps: true }))];
  })
);

module.exports = { models, SERVICE_FIELDS, SERVICE_FILES };
