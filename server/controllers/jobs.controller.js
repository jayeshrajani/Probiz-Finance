// Job openings for the careers page: public list of open jobs, admin create/update/delete.
const Job = require('../models/job.model');
const { transaction } = require('../odm');

const TEXT_LIMITS = { jobId: 20, title: 120, team: 40, location: 120, employmentType: 40, experience: 60, vacancies: 60, ctc: 80, overview: 1500 };
const REQUIRED = new Set(['jobId', 'title', 'team', 'overview']);
const LIST_FIELDS = ['responsibilities', 'idealCandidate'];
const MAX_ITEMS = 12;
const MAX_ITEM_LENGTH = 200;
const STATUSES = ['open', 'closed'];

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const clean = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : null);
const fail = (res, status, message, fields) => res.status(status).json({ message, status, ...(fields && { fields }) });
const uniqueKey = (jobId) => `unique:job:jobId:${jobId}`;

// Full replacement: returns { values } or { message, fields }.
function validate(body) {
  if (!isPlainObject(body)) return { message: 'Send the job as a JSON object.', fields: {} };
  const values = {};
  const fields = {};
  for (const [key, max] of Object.entries(TEXT_LIMITS)) {
    const value = body[key] === undefined || body[key] === null ? '' : clean(body[key]);
    if (value === null) fields[key] = 'Enter text.';
    else if (!value && REQUIRED.has(key)) fields[key] = 'This field is required.';
    else if (value.length > max) fields[key] = `Keep this under ${max} characters.`;
    else values[key] = value;
  }
  if (values.jobId) {
    values.jobId = values.jobId.toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(values.jobId)) fields.jobId = 'Use letters, numbers and dashes, for example PF-MKT-201.';
  }
  for (const key of LIST_FIELDS) {
    const raw = body[key] === undefined || body[key] === null ? [] : body[key];
    const items = Array.isArray(raw) ? raw.map(clean) : null;
    if (!items || items.includes(null)) {
      fields[key] = 'Send a list of lines.';
      continue;
    }
    const lines = items.filter(Boolean);
    if (lines.length > MAX_ITEMS || lines.some((x) => x.length > MAX_ITEM_LENGTH)) fields[key] = `Up to ${MAX_ITEMS} lines, ${MAX_ITEM_LENGTH} characters each.`;
    else values[key] = lines;
  }
  const status = body.status === undefined ? 'open' : body.status;
  if (!STATUSES.includes(status)) fields.status = 'Choose open or closed.';
  else values.status = status;
  if (Object.keys(fields).length) return { message: 'Please check the highlighted fields.', fields };
  return { values };
}

const byOrder = (a, b) => String(a.team).localeCompare(String(b.team)) || String(a.jobId).localeCompare(String(b.jobId));

const publicView = (job) => ({
  id: String(job._id),
  jobId: job.jobId,
  title: job.title,
  team: job.team,
  location: job.location || '',
  employmentType: job.employmentType || '',
  experience: job.experience || '',
  vacancies: job.vacancies || '',
  ctc: job.ctc || '',
  overview: job.overview,
  responsibilities: job.responsibilities || [],
  idealCandidate: job.idealCandidate || [],
});

const adminView = (job) => ({
  ...publicView(job),
  status: job.status,
  createdAt: job.createdAt || null,
  updatedAt: job.updatedAt || null,
  updatedByName: job.updatedByName || null,
});

const editor = (req) => ({ updatedBy: req.staff.id, updatedByName: req.staff.name || req.staff.email || null });

exports.listPublic = async (req, res) => {
  const jobs = await Job.find({ status: 'open' }).lean();
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
  res.status(200).json({ data: jobs.sort(byOrder).map(publicView) });
};

exports.listAdmin = async (req, res) => {
  const jobs = await Job.find({}).lean();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ data: jobs.sort(byOrder).map(adminView) });
};

exports.create = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { values, message, fields } = validate(req.body);
  if (!values) return fail(res, 400, message, fields);
  const doc = await transaction(async (tx) => {
    await tx.lock(uniqueKey(values.jobId));
    if (await Job.findOne({ jobId: values.jobId }).lean()) return null;
    return Job.create({ ...values, ...editor(req) });
  });
  if (!doc) return fail(res, 409, `Job ID ${values.jobId} is already in use.`, { jobId: 'This job ID is already in use.' });
  res.status(201).json({ message: 'Job added.', data: adminView(doc.toObject()) });
};

exports.update = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { values, message, fields } = validate(req.body);
  if (!values) return fail(res, 400, message, fields);
  const result = await transaction(async (tx) => {
    const doc = await Job.findById(req.params.id);
    if (!doc) return { status: 404 };
    await tx.lock(uniqueKey(doc.jobId), uniqueKey(values.jobId));
    if (values.jobId !== doc.jobId && (await Job.findOne({ jobId: values.jobId }).lean())) return { status: 409 };
    Object.assign(doc, values, editor(req));
    await doc.save();
    return { doc };
  });
  if (result.status === 404) return fail(res, 404, 'That job no longer exists.');
  if (result.status === 409) return fail(res, 409, `Job ID ${values.jobId} is already in use.`, { jobId: 'This job ID is already in use.' });
  res.status(200).json({ message: 'Job saved.', data: adminView(result.doc.toObject()) });
};

exports.remove = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const doc = await Job.findByIdAndDelete(req.params.id);
  if (!doc) return fail(res, 404, 'That job no longer exists.');
  res.status(200).json({ message: 'Job deleted.' });
};

exports.validate = validate;
