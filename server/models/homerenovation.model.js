const mongoose = require('../odm');

const LoanOfferSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  dateOfBirth: { type: String, required: false },
  address: { type: String, required: false },
  contactNumber: { type: String, required: false },
  alternateContact: { type: String, required: false },
  propertyType: { type: String, required: false },
  propertySize: { type: String, required: false },
  constructionSize: { type: String, required: false },
  marketValue: { type: String, required: false },
  loanAmount: { type: String, required: false },
  profession: { type: String, required: false },
  incomeType: { type: String, required: false },
  monthlyIncome: { type: String, required: false },
  incomeTaxReturn: { type: String, required: false },
  businessCertificate: { type: String, required: false },
  cibilScore: { type: String, required: false },
  otherIncomeSource: { type: String, required: false },
  otherIncomeAmount: { type: String, required: false },
  uploadedDocuments: {
    aadharFront: { type: String, required: false },
    aadharBack: { type: String, required: false },
    panCard: { type: String, required: false },
    electricityBill: { type: String, required: false },
    propertyFront: { type: String, required: false },
    propertyInside: { type: String, required: false },
    propertyTaxReceipt: { type: String, required: false },
    bankStatement: { type: String, required: false },  // Bank Statement (Last 1 Year)
    incomeTaxReturnFile: { type: String, required: false },  // Income Tax Return File (If Available)
    salarySlipOrOfferLetter: { type: String, required: false },  // For Salaried Employee - Salary Slip or Offer Letter
    forBusiness: { type: String, required: false },  // For Salaried Employee - Salary Slip or Offer Letter
    propertyPaper: { type: String, required: false },  // Property Paper
  },
}, { timestamps: true });

module.exports = mongoose.model("HomeRenovationLoan", LoanOfferSchema);
