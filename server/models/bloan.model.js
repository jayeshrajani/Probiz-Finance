const mongoose = require('../odm');

const BusinessLoanApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true }, // Full Name (As per Aadhar)
    dateOfBirth: { type: String, required: true }, // Date of Birth (As per Aadhar)
    address: { type: String, required: true }, // Address (As per Aadhar)
    contactNumber: { type: String, required: true }, // Contact Number (Joint with Aadhar)
    alternateContactNumber: { type: String, required: false }, // Alternate Contact Number
    businessName: { type: String, required: false }, // Business Name
    loanAmountRequired: { type: Number, required: false }, // Loan Amount Required
    incomeType: { type: String, required: false }, // Income Type – Cash, Account, or Both
    totalMonthlyIncome: { type: Number, required: false }, // Total Monthly Income
    incomeTaxReturn: { type: String, required: false }, // Income Tax Return – Yes or No
    businessCertificate: { type: String, required: false }, // Business Certificate
    cibilScore: { type: Number, required: false }, // Cibil Score
    uploadedDocuments: {
      aadharFront: { type: String, required: false }, // Aadhar Front (File Path)
      aadharBack: { type: String, required: false }, // Aadhar Back Side (File Path)
      panCard: { type: String, required: false }, // Pan Card (File Path)
      electricityBillOrRentAgreement: { type: String, required: false }, // Electricity Bill or Rent Agreement (File Path)
      
      bankStatement: { type: String, required: false }, // Bank Statement (Last 1 Year) (File Path)
      incomeTaxReturnFile: { type: String, required: false }, // Income Tax Return File (If Available) (File Path)
      businessDocuments: { type: String, required: false }, // Business – Gumasta, MSME License, Nagar Nigam, Others (File Path)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessLoanApplication", BusinessLoanApplicationSchema);
 