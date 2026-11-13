const mongoose = require("mongoose");

const BalanceTransferTopUpSchema = new mongoose.Schema({
  fullName: { type: String, required: false }, // As per Aadhar
  dateOfBirth: { type: String, required: false }, // As per Aadhar
  address: { type: String, required: false }, // As per Aadhar
  contactNumber: { type: String, required: false }, // Joint with Aadhar
  alternateContact: { type: String, required: false },

  residenceType: { type: String, required: false },
  currentLoanAmount: { type: String, required: false },
  currentLoanInstallmentsPaid: { type: String, required: false }, // No. of Installment Paid
  loanAmountRequired: { type: String, required: false },

  profession: { type: String, required: false },
  incomeType: { type: String,  required: false },
  totalMonthlyIncome: { type: String, required: false },
  incomeTaxReturn: { type: String,  required: false },
  cibilScore: { type: String, required: false },

  uploadedDocuments: {
    aadharFront: { type: String, required: false },
    aadharBack: { type: String, required: false },
    panCard: { type: String, required: false },
    electricityOrRentAgreement: { type: String, required: false },
    officeShopElectricityOrRent: { type: String, required: false },
    propertyPhotoFront: { type: String, required: false },
    propertyPhotoInside: { type: String, required: false },
    bankStatementLastYear: { type: String, required: false },
    incomeTaxReturnFile: { type: String, required: false },
    forBusinessDocuments: { type: String, required: false }, // Gumasta, MSME License, Nagar Nigam, etc.
    loanAccountStatement: { type: String, required: false }, // By Bank
    listOfDocumentsByBank: { type: String, required: false },
    foreclosureLetter: { type: String, required: false }
  }
}, { timestamps: true });

module.exports = mongoose.model("BalanceTransferTopUp", BalanceTransferTopUpSchema);
