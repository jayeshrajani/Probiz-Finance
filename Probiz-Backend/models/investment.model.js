const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const loanSchema = new Schema({

    loan_Type: {
        type: String,
        required: [true, "please select loan type"],
    },
    first_Name: {
        type: String,
        required: [true, "please enter user first name"],
    },
    last_Name: {
        type: String,
        required: [true, "please enter user last name"],
    },
    email: {
        type: String,
       
    },
    mobile_no:{
        type: String,
        required: [true, "please enter mobile_no"],
    },
    dateOfBirth: { type: String, required: true }, // Use String for easy formatting
   
}, {
    timestamps: true
})
module.exports = mongoose.model("Investment Plan", loanSchema)

