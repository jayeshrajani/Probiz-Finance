const mongoose = require("mongoose");

const CreditCardSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  alternateContact: { type: String, required: true },
  profession: { type: String, required: false },
  incomeType: { type: String, required: false },
  monthlyIncome: { type: String, required: false },
  cibilScore: { type: String, required: false },
  uploadedDocuments: {
    aadharFront: { type: String, required: false },
    aadharBack: { type: String, required: false },
    panCard: { type: String, required: false },
    electricityBill: { type: String, required: false },
    bankStatement: { type: String, required: false },  // Bank Statement (Last 1 Year)
    salarySlipOrOfferLetter: { type: String, required: false },  // For Salaried Employee - Salary Slip or Offer Letter
   
  },
}, { timestamps: true });

module.exports = mongoose.model("CreditCard", CreditCardSchema);
