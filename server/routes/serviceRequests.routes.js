const { multipart } = require('../http');
const { models, SERVICE_FIELDS, SERVICE_FILES } = require('../models/serviceRequest.model');

const ENDPOINTS = {
  gst: 'addGstRegistration',
  gumasta: 'addGumastaLicense',
  itr: 'addItrFiling',
  rent: 'addRentAgreement',
  udyam: 'addUdyamRegistration',
};

const documents = multipart(['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'], { visibility: 'private' });

const save = (key) => async (req, res) => {
  try {
    const body = req.body || {};
    const data = {};
    for (const field of SERVICE_FIELDS[key]) {
      const value = body[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') data[field] = String(value).trim().slice(0, 2000);
    }
    if (!data.name || !data.mobile_no) return res.status(400).json({ message: 'Name and mobile number are required.', status: 400 });
    data.uploadedDocuments = Object.fromEntries(SERVICE_FILES[key].map((f) => [f, req.files?.[f]?.[0]?.location || null]));
    const saved = await new models[key](data).save();
    return res.status(201).json({ message: 'Request received', data: saved, status: 201 });
  } catch (err) {
    console.error(`[service:${key}] save failed`, err.message);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

module.exports = (app) => {
  for (const key of Object.keys(ENDPOINTS)) {
    app.post(`/api/${ENDPOINTS[key]}`, documents.fields(SERVICE_FILES[key].map((name) => ({ name, maxCount: 1 }))), save(key));
  }
};
