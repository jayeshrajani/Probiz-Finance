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
    // sales | ops_l1 | ops_l2 (server/admin/personas.js); missing on older records means ops_l1.
    persona: {
        type: String,
        default: 'ops_l1'
    },
    // Sales only: monthly target { leads, amount }; either may be null (tracker off).
    salesTarget: {
        type: Schema.Types.Mixed,
        default: null
    },
    deleteFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Employee', employeeSchema);