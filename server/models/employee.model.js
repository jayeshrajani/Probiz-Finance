const mongoose = require('../odm');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

const employeeSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter name"],
    },
    mobile: {
        type: String,
        required: [true, "please enter mobile"],
    },
    email: {
        type: String,
        required: [true, "please enter email"],
    },
    roll: {
        type: String,
        required: [true, "please enter roll"],
    },
    password: {
        type: String,
        required: [true, "please enter password"]
    },
    employeeId: {
        type: String,
        required: [true, "please enter employeeId"]
    },
    deleteFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Employee', employeeSchema);