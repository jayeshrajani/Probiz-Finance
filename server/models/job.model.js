const mongoose = require('../odm');
const Schema = mongoose.Schema;

// Job openings shown on /Careers. Values are validated by server/controllers/jobs.controller.js before saving.
const jobSchema = new Schema({
  jobId: { type: String, required: true },
  title: { type: String, required: true },
  team: { type: String, required: true },
  location: { type: String, default: '' },
  employmentType: { type: String, default: '' },
  experience: { type: String, default: '' },
  vacancies: { type: String, default: '' },
  ctc: { type: String, default: '' },
  overview: { type: String, required: true },
  responsibilities: { type: [String], default: [] },
  idealCandidate: { type: [String], default: [] },
  status: { type: String, default: 'open' },
  updatedBy: { type: String, default: null },
  updatedByName: { type: String, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Job', jobSchema);
