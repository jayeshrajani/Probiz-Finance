const mongoose = require('../odm')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const contactSchema = new Schema({
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
        required: [true, "please enter email"],
    },

    
}, {
    timestamps: true
})
module.exports = mongoose.model("Contact", contactSchema)

