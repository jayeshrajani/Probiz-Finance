const mongoose = require("mongoose");

const PradhanMantriLoanApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  alternateContactNumber: { type: String },
  companyName: { type: String, required: false },
  reportingManagerName: { type: String, required: false },
  reportingManagerContactNumber: { type: String, required: false },
  residenceType: { type: String, required: false },
  loanAmountRequired: { type: Number, required: false },
  profession: { type: String, required: false },
  incomeType: { type: String, required: false },
  monthlySalary: { type: Number, required: false },
  incomeTaxReturn: { type: String, required: false },
  cibilScore: { type: Number, required: false },
  uploadedDocuments: {
    aadharFront: { type: String, required: false },
    aadharBack: { type: String, required: false },
    panCard: { type: String, required: false },
    electricityBillOrRentAgreement: { type: String, required: false },
    bankStatement: { type: String, required: false },
    incomeTaxReturnFile: { type: String, required: false },
    salarySlips: { type: String, required: false }, 
    offerLetter: { type: String, required: false }
  }
}, { timestamps: true });
 

module.exports = mongoose.model("PradhamMantriLoan", PradhanMantriLoanApplicationSchema);