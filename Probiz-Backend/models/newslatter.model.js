const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const newsSchema = new Schema({
   
    email: {
        type: String,
        required: [true, "please enter email"],
    },
        
    
}, {
    timestamps: true
})
module.exports = mongoose.model("NewsLatters", newsSchema)

