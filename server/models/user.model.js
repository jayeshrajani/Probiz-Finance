const mongoose = require('../odm')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const userSchema = new Schema({
    // Accounts created by mobile OTP sign-in start with only a mobile number.
    user_Name: {
        type: String,
    },
    user_Email: {
        type: String,
    },
    country_code:{
        type: String,
  
    },
    mobile_no:{
        type: String,
        required: [true, "please enter mobile_no"],
    },
    password: {
        type: String,
    },
    signupMethod: {
        type: String,
        default: 'password'
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    mobileVerifiedAt: {
        type: Date,
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    },

    deleteFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("User", userSchema)

