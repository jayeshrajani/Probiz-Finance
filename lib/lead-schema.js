// Validation shared by the browser (ApplicationForm) and the server (server/leads/intake.js).
import { forms } from "./forms";

export const MOBILE = /^[6-9]\d{9}$/;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const CONSENT_VERSION = "2026-11";
export const CONSENT_TEXT = "I agree to Probiz contacting me by call, SMS, WhatsApp or email about this request, as described in the privacy policy.";
export const HONEYPOT = "company_website";

export const isEmpty = (v) => v === undefined || v === null || String(v).trim() === "";
export const visible = (items, values) => (items || []).filter((f) => !f.showIf || f.showIf(values));
export const normalizePhone = (v) => {
  const digits = String(v || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
};

export function validateField(field, value) {
  if (isEmpty(value)) return field.required ? "Required" : null;
  const v = String(value).trim();
  if (field.type === "tel" && !MOBILE.test(normalizePhone(v) || v)) return "Enter a 10-digit mobile number";
  if (field.type === "email" && !EMAIL.test(v)) return "Enter a valid email address";
  if (field.type === "number" && (Number.isNaN(Number(v)) || Number(v) < 0)) return "Enter a positive number";
  if (field.type === "date" && /birth/i.test(field.name) && new Date(v) > new Date()) return "Date of birth can't be in the future";
  if (field.pattern && !field.pattern.test(v)) return field.patternMessage || "Check this value";
  return null;
}

// Returns { field: message } for every visible field that fails; empty object when valid.
export function validateLead(formKey, values) {
  const config = forms[formKey];
  if (!config) return { _form: "Unknown form" };
  const errors = {};
  for (const step of config.steps) {
    for (const field of visible(step.fields, values)) {
      const err = validateField(field, values[field.name]);
      if (err) errors[field.name] = err;
    }
  }
  return errors;
}

export const fileSlots = (formKey, values) => visible(forms[formKey]?.files, values);
