const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const governmentBusiSchema = new Schema({
    name: {
        type: String,
        required: [true, "please enter user name"],
    },
    email: {
        type: String,
        required: [true, "please enter email"],
    },
    
    mobile_no:{
        type: String,
        required: [true, "please enter mobile_no"],
    },
    
    message: {
        type: String,
        required: false,
    },

    
}, {
    timestamps: true
})
module.exports = mongoose.model("GovernmentBusiness", governmentBusiSchema)

