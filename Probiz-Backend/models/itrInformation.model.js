const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const itrInformationSchema = new Schema({
    // User ID reference
    userId: {
        type: ObjectId,
        ref: 'User',
        required: false
    },
    
    // Form Type: 'job' or 'business'
    formType: {
        type: String,
        required: [true, "Form type is required"],
        enum: ['job', 'business']
    },
    
    // ========== Section A: Job ITR - Salary Income ==========
    // 1. Basic Information
    fullName: {
        type: String,
        required: false
    },
    pan: {
        type: String,
        required: [true, "PAN is required"],
        uppercase: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"]
    },
    dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"]
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        match: [/^[0-9]{10}$/, "Invalid mobile number format"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"]
    },
    
    // 2. Salary Income (for Job ITR)
    annualGrossSalary: {
        type: Number,
        default: 0
    },
    tdsAsPerForm16: {
        type: Number,
        default: 0
    },
    
    // 3. Other Income (for Job ITR)
    savingsAccountInterest: {
        type: Number,
        default: 0
    },
    otherIncome: {
        type: Number,
        default: 0
    },
    otherIncomeDescription: {
        type: String,
        default: ""
    },
    
    // 4. Total Deductions (for Job ITR)
    eligibleDeductions: {
        type: Number,
        default: 0
    },
    deductionsDescription: {
        type: String,
        default: ""
    },
    
    // 5. Tax Already Paid (for Job ITR)
    tdsAsPerForm26AS: {
        type: Number,
        default: 0
    },
    advanceSelfAssessmentTax: {
        type: Number,
        default: 0
    },
    
    // ========== Section B: Business ITR - Business/Freelance Income ==========
    // 1. Basic Information (for Business ITR)
    nameOfIndividualOrFirm: {
        type: String,
        required: false
    },
    
    // 2. Annual Business Figures (for Business ITR)
    totalTurnoverReceipts: {
        type: Number,
        default: 0
    },
    totalExpenses: {
        type: Number,
        default: 0
    },
    netProfit: {
        type: Number,
        default: 0
    },
    
    // 3. Tax Deducted / Taxes Paid (for Business ITR)
    tdsTotalForm26AS: {
        type: Number,
        default: 0
    },
    advanceSelfAssessmentTaxBusiness: {
        type: Number,
        default: 0
    },
    
    // 4. Other Income (for Business ITR)
    otherIncomeBusiness: {
        type: Number,
        default: 0
    },
    otherIncomeBusinessDescription: {
        type: String,
        default: ""
    },
    
    // 5. Total Deductions (for Business ITR)
    eligibleDeductionsBusiness: {
        type: Number,
        default: 0
    },
    deductionsBusinessDescription: {
        type: String,
        default: ""
    },
    
    // ========== Common Fields for Both Sections ==========
    // 6. Bank Details for Refund
    accountNumber: {
        type: String,
        required: [true, "Account number is required"]
    },
    ifscCode: {
        type: String,
        required: [true, "IFSC code is required"],
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"]
    },
    bankName: {
        type: String,
        required: [true, "Bank name is required"]
    },
    accountType: {
        type: String,
        required: [true, "Account type is required"],
        enum: ['Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit']
    },
    
    // 7. Declaration
    place: {
        type: String,
        required: [true, "Place is required"]
    },
    declarationDate: {
        type: Date,
        required: [true, "Declaration date is required"]
    },
    signature: {
        type: String,
        required: [true, "Signature is required"]
    },
    
    // Status and additional fields
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'rejected'],
        default: 'pending'
    },
    remarks: {
        type: String,
        default: ""
    }
    
}, {
    timestamps: true
})

module.exports = mongoose.model("ITRInformation", itrInformationSchema)

