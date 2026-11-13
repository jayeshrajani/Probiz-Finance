const mongoose = require("mongoose");

const KisanCreditLoanApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true }, // Use String for easy formatting
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  alternateContactNumber: { type: String, required: false },
  residenceType: { type: String, required: false }, // Owned / Rented
  totalLand: { type: Number, required: false }, // in Acres
  pawti: { type: Boolean, required: false }, // Yes / No
  incomeType: { type: String, required: false }, // Cash / Account
  monthlySalary: { type: Number, required: false },
  incomeTaxReturn: { type: Boolean, required: false }, // Yes / No
  cibilScore: { type: Number, required: false },
  uploadedDocuments: {
    aadharFront: { type: String, required: false },
    aadharBack: { type: String, required: false },
    panCard: { type: String, required: false },
    electricityBill: { type: String, required: false },
    bankStatement: { type: String, required: false },
    incomeTaxReturnFile: { type: String, required: false },
    pawti: { type: String, required: false },
    khasraCopy: { type: String, required: false },
  },
}, { timestamps: true });

module.exports = mongoose.model("KisanCreditLoanApplication", KisanCreditLoanApplicationSchema);
