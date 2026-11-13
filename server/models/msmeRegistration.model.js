const mongoose = require('../odm')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const msmeRegistrationSchema = new Schema({
    // User ID reference
    userId: {
        type: ObjectId,
        ref: 'User',
        required: false
    },
    
    // ========== 1. Applicant Section ==========
    aadhaarNo: {
        type: String,
        required: [true, "Aadhaar number is required"],
        match: [/^[0-9]{12}$/, "Aadhaar number must be 12 digits"]
    },
    nameOnAadhaar: {
        type: String,
        required: [true, "Name on Aadhaar is required"]
    },
    mobileLinkedToAadhaar: {
        type: String,
        required: [true, "Mobile number linked to Aadhaar is required"],
        match: [/^[0-9]{10}$/, "Invalid mobile number format"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"]
    },
    
    // ========== 2. Business Identity Section ==========
    enterpriseName: {
        type: String,
        required: [true, "Enterprise name is required"]
    },
    organisationType: {
        type: String,
        required: [true, "Organisation type is required"],
        enum: ['Proprietor', 'Partnership', 'LLP', 'Pvt Ltd', 'Other']
    },
    pan: {
        type: String,
        required: [true, "PAN is required"],
        uppercase: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"]
    },
    gstin: {
        type: String,
        required: false,
        uppercase: true,
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"]
    },
    
    // ========== 3. Address Section ==========
    doorShopNo: {
        type: String,
        required: [true, "Door/Shop number is required"]
    },
    street: {
        type: String,
        required: [true, "Street is required"]
    },
    areaLocality: {
        type: String,
        required: [true, "Area/Locality is required"]
    },
    city: {
        type: String,
        required: [true, "City is required"]
    },
    pinCode: {
        type: String,
        required: [true, "PIN code is required"],
        match: [/^[0-9]{6}$/, "PIN code must be 6 digits"]
    },
    
    // ========== 4. Key Facts Section ==========
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    majorActivity: {
        type: String,
        required: [true, "Major activity is required"],
        enum: ['Manufacturing', 'Services']
    },
    nicCode: {
        type: String,
        required: [true, "NIC Code is required"],
        match: [/^[0-9]{2}$/, "NIC Code must be 2 digits"]
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    totalEmployeesMale: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    totalEmployeesFemale: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    totalEmployeesOthers: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    
    // ========== 5. Financial Size Section ==========
    investmentInMachineryEquipment: {
        type: Number,
        required: [true, "Investment in machinery/equipment is required"],
        min: 0
    },
    annualTurnoverLastFY: {
        type: Number,
        required: [true, "Annual turnover for last FY is required"],
        min: 0
    },
    
    // ========== 6. Bank Details Section ==========
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
    
    // ========== 7. Declaration Section ==========
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

module.exports = mongoose.model("MSMERegistration", msmeRegistrationSchema)

