// Google Analytics 4 for the public site. Nothing loads without a measurement ID and the visitor's consent,
// and nothing is sent from the admin panel. Event parameters never carry names, phone numbers or emails.
export const GA_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim();
export const gaConfigured = /^G-[A-Z0-9]+$/.test(GA_ID);

const CONSENT_KEY = "probiz:analytics-consent";
export const CONSENT_EVENT = "probiz:analytics-consent";

const isAdminPath = () => typeof window !== "undefined" && window.location.pathname.startsWith("/admin-panel");

export function getConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    if (value) window.localStorage.setItem(CONSENT_KEY, value);
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Private mode: the choice lasts for this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value || null }));
}

export function track(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function" || isAdminPath()) return;
  window.gtag("event", name, params);
}

export const trackPageView = () => track("page_view", { page_location: window.location.href, page_title: document.title });
