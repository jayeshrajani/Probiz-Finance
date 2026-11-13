const mongoose = require('../odm');
const Schema = mongoose.Schema;

const goldLoanSchema = new Schema({

    fullName: {
        type: String,
        required: [true, "Please enter full name"],
    },
    fatherOrHusbandName: {
        type: String,
       
    },
    motherName: {
        type: String,
    },
    dateOfBirth: {
        type: String,
        required: [true, "Please enter date of birth"],
    },
    permanentAddress: {
        type: String,
        required: [true, "Please enter permanent address"],
    },
    contactNumber: {
        type: String,
        required: [true, "Please enter contact number"],
    },
    email: {
        type: String,
    },

    // Employment/Occupation Details
    occupationOrBusiness: {
        type: String,
        required: false
    },
    monthlyOrAnnualIncome: {
        type: String,
        required: false
    },

    // Gold Pledged Info
    goldType: {
        type: String,
        required: false
    },
    goldWeightInGrams: {
        type: Number,
        required: false, 
    },
    goldPurity: {
        type: String,
    },

    // Loan Info
    loanAmountRequired: {
        type: Number,
        required: false, 
    },
    loanPurpose: {
        type: String,
    },
    preferredRepaymentTenure: {
        type: String,
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("GoldLoan", goldLoanSchema);
