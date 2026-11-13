const mongoose = require("mongoose");

const BalanceTransferSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  dateOfBirth: { type: String, required: false },
  address: { type: String, required: false },
  contactNumber: { type: String, required: false },
  alternateContact: { type: String, required: false },
  propertyType: { type: String, required: false },
  loanAmount: { type: String, required: false },
  noOfStallmentCurrentLoan: { type: String, required: false },
  profession: { type: String, required: false },
  incomeType: { type: String, required: false },
  monthlyIncome: { type: String, required: false },
  incomeTaxReturn: { type: String, required: false },
  cibilScore: { type: String, required: false },
  uploadedDocuments: {
  aadharFront: { type: String, required: false },
  aadharBack: { type: String, required: false },
  panCard: { type: String, required: false },
  electricityBillOrRentAgreement: { type: String, required: false },
  officeShopProof: { type: String, required: false }, // Office/Shop – Electricity bill or Rent Agreement
  propertyPhotoFront: { type: String, required: false },
  propertyPhotoInside: { type: String, required: false },
  bankStatement: { type: String, required: false }, // Last 1 Year
  incomeTaxReturnFile: { type: String, required: false }, // If Available
  businessProof: { type: String, required: false }, // Gumasta, MSME License, Nagar Nigam, etc.
  loanAccountStatement: { type: String, required: false },
  listOfDocuments: { type: String, required: false },
  foreclosureLetter: { type: String, required: false }
}
}, { timestamps: true });

module.exports = mongoose.model("BalanceTransfer", BalanceTransferSchema);
