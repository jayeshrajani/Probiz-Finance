// Remembers how a visitor arrived (first page, referrer, UTM tags) for this browser tab, so a lead can say where it came from.
import { CONSENT_TEXT, CONSENT_VERSION } from "./lead-schema";

const KEY = "probiz:attribution";
const UTM = ["source", "medium", "campaign", "term", "content"];

function read() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function captureAttribution() {
  if (typeof window === "undefined" || read()) return;
  const url = new URL(window.location.href);
  const utm = Object.fromEntries(UTM.map((k) => [k, url.searchParams.get(`utm_${k}`)]).filter(([, v]) => v));
  let referrer = null;
  try {
    if (document.referrer && new URL(document.referrer).host !== url.host) referrer = document.referrer;
  } catch {
    referrer = null;
  }
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ landingPage: url.pathname + url.search, referrer, utm }));
  } catch {
    // Private mode: attribution is best effort.
  }
}

// The `_meta` block every lead submission carries.
export function leadMeta({ channel = "web_form", consent = false, topic } = {}) {
  const first = (typeof window !== "undefined" && read()) || {};
  return {
    channel,
    topic: topic || undefined,
    consent: consent ? { accepted: true, version: CONSENT_VERSION, text: CONSENT_TEXT } : undefined,
    source: {
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
      referrer: first.referrer || undefined,
      landingPage: first.landingPage || undefined,
      device: typeof window !== "undefined" ? (window.innerWidth < 768 ? "mobile" : "desktop") : undefined,
      utm: first.utm || {},
    },
  };
}
