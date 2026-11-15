const mongoose = require('../odm');
const Schema = mongoose.Schema;

// One record (_id "contact_social"): public contact details and social links shown on the website.
// Values are validated and normalised by server/controllers/siteSettings.controller.js before saving.
const siteSettingsSchema = new Schema({
  primaryPhone: { type: String, required: true },
  secondaryPhone: { type: String, default: '' },
  whatsappPhone: { type: String, default: '' },
  contactEmail: { type: String, required: true },
  social: {
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
  },
  updatedBy: { type: String, default: null },
  updatedByName: { type: String, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
