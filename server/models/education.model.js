const mongoose = require('../odm');

const EducationLoanApplicationSchema = new mongoose.Schema({
  // Applicant Details
  fullName: { type: String },
  fatherOrHusbandName: { type: String },
  dateOfBirth: { type: String },
  permanentAddress: { type: String },
  contactNumber: { type: String },
  email: { type: String },

  // Course & Institution Details
  courseName: { type: String },
  institutionName: { type: String },
  institutionAddress: { type: String },
  admissionDate: { type: String },
  courseDuration: { type: String },

  // Expense Details
  totalFees: { type: String },
  loanAmountRequired: { type: String },

  // Source of Income
  occupationOrBusiness: { type: String },
  monthlyOrAnnualIncome: { type: String },

  // Co-Applicant Details
  coApplicantName: { type: String },
  coApplicantFatherOrHusbandName: { type: String },
  coApplicantDateOfBirth: { type: String },
  coApplicantRelationship: { type: String },
  coApplicantAddress: { type: String },
  coApplicantContact: { type: String },
  coApplicantIncome: { type: String },

  // Collateral Details
  collateralType: { type: String },
  collateralLocation: { type: String },
  collateralMarketValue: { type: String },

  // Uploaded Documents
  uploadedDocuments: {
    admissionLetter: { type: String },
    previousMarkSheets: { type: String },
    feeStructure: { type: String }
  }

}, { timestamps: true });

module.exports = mongoose.model("EducationLoanApplication", EducationLoanApplicationSchema);
