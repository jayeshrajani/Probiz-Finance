const mongoose = require("mongoose");

const CarLoanApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    alternateContactNumber: { type: String, required: true },

    // Car Details
    carType:{type: String, required: false},
    carBrand: { type: String, required: false },
    brand: { type: String, required: false },
    yearOfMake: { type: String, required: false },
    onRoadPrice: { type: String, required: false },
    loanAmountRequired: { type: String, required: false },

    // Income Details
    profession: { type: String, required: false },
    incomeType: { type: String, required: false },
    totalMonthlyIncome: { type: String, required: false },
    incomeTaxReturn: { type: String, required: false },
    businessCertificate: { type: String, required: false },
    cibilScore: { type: String, required: false },
    otherIncomeSource: { type: String, required: false },
    otherIncomeAmount: { type: String, required: false },

    uploadedDocuments: {
      aadharFront: { type: String, required: false },
      aadharBack: { type: String, required: false },
      panCard: { type: String, required: false },
      electricityBillOrRentAgreement: { type: String, required: false },
      carPhoto: { type: String, required: false },
      carRC: { type: String, required: false },
      carQuotation: { type: String, required: false },
      insurance: { type: String, required: false },
      bankStatement: { type: String, required: false },
      salarySlipOrOfferLetter: { type: String, required: false },
      businessDocuments: { type: String, required: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarLoanApplication", CarLoanApplicationSchema);

