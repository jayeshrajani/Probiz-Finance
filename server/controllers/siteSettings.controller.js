// Public contact details and social links (Stage 8.5). One record, editable by admins, read by the website.
const SiteSettings = require('../models/siteSettings.model');
const { transaction } = require('../odm');
const DEFAULTS = require('../../content/site-settings.json');

const ID = 'contact_social';
const LOCK = `site_settings:${ID}`;
// Server-side cache of the public view; with the 60 s HTTP cache the website reflects changes within about 5 minutes.
const CACHE_MS = 2 * 60 * 1000;
const PHONE_FIELDS = ['primaryPhone', 'secondaryPhone', 'whatsappPhone'];
const FIELDS = [...PHONE_FIELDS, 'contactEmail', 'social'];
// Exact hostnames only, so look-alikes such as linkedin.com.evil.example are rejected.
const SOCIAL_HOSTS = {
  linkedin: ['linkedin.com', 'www.linkedin.com', 'in.linkedin.com'],
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com'],
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
};
const PLATFORMS = Object.keys(SOCIAL_HOSTS);

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Indian numbers with an optional +91, 91 or 0 prefix and common separators; returns 10 digits, '' or null.
function normalisePhone(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const raw = String(value).trim();
  if (!raw) return '';
  if (raw.length > 20 || !/^\+?[\d\s().-]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) {
    if (!digits.startsWith('91')) return null;
    digits = digits.slice(2);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // 10-digit national number: mobiles start with 6-9; landlines are an area code (11 Delhi, 120 Noida, 731 Indore...)
  // plus the number. Digits alone cannot tell a 7x/8x landline from a mobile or prove a number uses WhatsApp.
  return /^[1-9]\d{9}$/.test(digits) ? digits : null;
}

const isMobile = (digits) => /^[6-9]\d{9}$/.test(digits);

function normaliseEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || email.includes('..')) return null;
  return /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email) ? email : null;
}

function normaliseSocial(platform, value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text) return '';
  if (text.length > 300) return null;
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
  if (!SOCIAL_HOSTS[platform].includes(url.hostname)) return null;
  return url.href;
}

const MESSAGES = {
  primaryPhone: 'Enter a valid Indian phone number (10 digits, optional +91).',
  secondaryPhone: 'Enter a valid Indian phone number, or leave it empty.',
  whatsappPhone: 'Enter a valid Indian mobile number, or leave it empty.',
  contactEmail: 'Enter a valid email address.',
};
const socialMessage = (platform) => `Enter an https:// link on ${SOCIAL_HOSTS[platform][0]}, or leave it empty.`;

// Applies a (partial) update to the current values. Returns { values } or { message, fields }.
function validate(body, current) {
  if (!isPlainObject(body)) return { message: 'Send the settings as a JSON object.', fields: {} };
  const unknown = Object.keys(body).filter((k) => !FIELDS.includes(k));
  const unknownSocial = isPlainObject(body.social) ? Object.keys(body.social).filter((k) => !PLATFORMS.includes(k)) : [];
  if (unknown.length || unknownSocial.length) {
    const names = [...unknown, ...unknownSocial.map((k) => `social.${k}`)];
    return { message: `Unknown setting${names.length > 1 ? 's' : ''}: ${names.join(', ')}.`, fields: {} };
  }
  const values = { ...current, social: { ...current.social } };
  const fields = {};
  for (const key of PHONE_FIELDS) {
    if (!(key in body)) continue;
    const phone = normalisePhone(body[key]);
    if (phone === null || (key === 'primaryPhone' && !phone) || (key === 'whatsappPhone' && phone && !isMobile(phone))) fields[key] = MESSAGES[key];
    else values[key] = phone;
  }
  if ('contactEmail' in body) {
    const email = normaliseEmail(body.contactEmail);
    if (!email) fields.contactEmail = MESSAGES.contactEmail;
    else values.contactEmail = email;
  }
  if ('social' in body) {
    if (!isPlainObject(body.social)) fields.social = 'Send the social links as an object.';
    else {
      for (const platform of PLATFORMS) {
        if (!(platform in body.social)) continue;
        const url = normaliseSocial(platform, body.social[platform]);
        if (url === null) fields[`social.${platform}`] = socialMessage(platform);
        else values.social[platform] = url;
      }
    }
  }
  if (Object.keys(fields).length) return { message: 'Please check the highlighted fields.', fields };
  return { values };
}

// Only approved public fields. Stored values are re-checked; an invalid one falls back (required) or is hidden.
function publicView(record) {
  const source = record || DEFAULTS;
  const phone = (key) => normalisePhone(source[key]) || '';
  const social = Object.fromEntries(PLATFORMS.map((p) => [p, normaliseSocial(p, source.social?.[p]) || '']));
  const whatsapp = phone('whatsappPhone');
  return {
    primaryPhone: phone('primaryPhone') || DEFAULTS.primaryPhone,
    secondaryPhone: phone('secondaryPhone'),
    whatsappPhone: isMobile(whatsapp) ? whatsapp : '',
    contactEmail: normaliseEmail(source.contactEmail) || DEFAULTS.contactEmail,
    social,
  };
}

const adminView = (record) => ({
  ...publicView(record),
  saved: Boolean(record),
  updatedAt: record?.updatedAt || null,
  updatedByName: record?.updatedByName || null,
});

let cache = null;
let loading = null;

async function loadPublic() {
  if (cache && cache.expires > Date.now()) return cache.value;
  loading ||= SiteSettings.findById(ID).lean()
    .then((record) => {
      cache = { value: publicView(record), expires: Date.now() + CACHE_MS };
      return cache.value;
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

// Creates the record with the approved initial values only if it does not exist; never overwrites.
async function seedSiteSettings() {
  const { values, message } = validate(DEFAULTS, { social: {} });
  if (!values) throw new Error(`content/site-settings.json is invalid: ${message}`);
  return transaction(async (tx) => {
    await tx.lock(LOCK);
    if (await SiteSettings.findById(ID).lean()) return { created: false };
    await SiteSettings.create({ _id: ID, ...values });
    return { created: true };
  });
}

exports.getPublic = async (req, res) => {
  const data = await loadPublic();
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
  res.status(200).json({ data });
};

exports.getAdmin = async (req, res) => {
  const record = await SiteSettings.findById(ID).lean();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ data: adminView(record) });
};

exports.update = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const result = await transaction(async (tx) => {
    await tx.lock(LOCK);
    const record = await SiteSettings.findById(ID);
    const outcome = validate(req.body, publicView(record ? record.toObject() : null));
    if (!outcome.values) return outcome;
    const doc = record || new SiteSettings({ _id: ID });
    Object.assign(doc, outcome.values, { updatedBy: req.staff.id, updatedByName: req.staff.name || req.staff.email || null });
    await doc.save();
    return { doc };
  });
  if (!result.doc) return res.status(400).json({ message: result.message, status: 400, fields: result.fields });
  cache = null;
  res.status(200).json({ message: 'Website settings saved.', data: adminView(result.doc.toObject()) });
};

exports.seedSiteSettings = seedSiteSettings;
exports.validate = validate;
exports.publicView = publicView;
exports.SITE_SETTINGS_ID = ID;
exports.clearCache = () => {
  cache = null;
};
