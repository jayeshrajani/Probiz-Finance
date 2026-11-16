// Short callback requests (name + mobile) from the quick form, the header dialog and the assistant.
import { postJSON } from "./api";
import { track } from "./analytics";
import { leadMeta } from "./attribution";
import { HONEYPOT } from "./lead-schema";

const KEY = "probiz:contact";
export const CALLBACK_EVENT = "probiz:callback";

export const cleanMobile = (v) => {
  const digits = String(v || "").replace(/\D/g, "");
  const ten = digits.length > 10 && /^(91|0)/.test(digits) ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
};

export function openCallback(interest) {
  window.dispatchEvent(new CustomEvent(CALLBACK_EVENT, { detail: { interest: typeof interest === "string" ? interest : null } }));
}

// The longer application forms pre-fill from this, so nobody types their name twice in one visit.
export function rememberContact(name, mobile) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ name, mobile }));
  } catch {
    // Private mode: pre-fill is a convenience only.
  }
}

export function recalledContact() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export async function sendCallback({ name, mobile, interest, city, message, locale, channel = "web_form", trap = "" }) {
  const res = await postJSON("leads/callback", {
    name,
    mobile_no: mobile,
    ...(interest ? { interest } : {}),
    ...(city ? { city } : {}),
    ...(message ? { message } : {}),
    language: locale === "hi" ? "hi" : "en",
    _meta: leadMeta({ channel, consent: true, topic: interest }),
    [HONEYPOT]: trap,
  });
  if (res.ok) track("generate_lead", { form: `callback_${channel}`, product: interest || "callback" });
  return res;
}
