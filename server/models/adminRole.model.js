const mongoose = require('../odm');

const adminRoles = new mongoose.Schema({
  rollName: {
    type: String,
    required: [true, "Please enter role name"],
  },
  permission: [
    {
      tabName: {
        type: String,
        required: true,
      },
      tabAcess: {
        type: [String], // Example: ["Add", "Edit", "View", "Delete"]
        default: [],
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('adminRoles', adminRoles);
