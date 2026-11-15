import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import FALLBACK from "@/content/site-settings.json";

const REFRESH_MS = 60 * 1000;
const PLATFORMS = ["linkedin", "youtube", "instagram", "facebook"];

const apiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "/api/";
  return base.endsWith("/") ? base : `${base}/`;
};

const phone = (v) => (typeof v === "string" && /^[1-9]\d{9}$/.test(v) ? v : "");
const httpsUrl = (v) => {
  if (typeof v !== "string" || !v) return "";
  try {
    const url = new URL(v);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

// Keeps only well-formed values (the server validates too); required values fall back to the approved ones.
function clean(data) {
  if (!data || typeof data !== "object") data = FALLBACK;
  const whatsapp = phone(data.whatsappPhone);
  return {
    primaryPhone: phone(data.primaryPhone) || FALLBACK.primaryPhone,
    secondaryPhone: phone(data.secondaryPhone),
    whatsappPhone: /^[6-9]/.test(whatsapp) ? whatsapp : "",
    contactEmail: typeof data.contactEmail === "string" && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(data.contactEmail) ? data.contactEmail : FALLBACK.contactEmail,
    social: Object.fromEntries(PLATFORMS.map((p) => [p, httpsUrl(data.social?.[p])])),
  };
}

export const formatPhone = (n) => (n ? `+91 ${n.slice(0, 5)} ${n.slice(5)}` : "");
const phoneLink = (n) => (n ? { number: n, display: formatPhone(n), href: `tel:+91${n}` } : null);

function withLinks(s) {
  return {
    ...s,
    primary: phoneLink(s.primaryPhone),
    secondary: phoneLink(s.secondaryPhone),
    whatsappHref: s.whatsappPhone ? `https://wa.me/91${s.whatsappPhone}` : null,
    emailHref: s.contactEmail ? `mailto:${s.contactEmail}` : null,
  };
}

// The approved initial values. Shown until the API answers, and kept if it fails (they may be outdated then).
const fallback = clean(FALLBACK);
let current = fallback;
let loadedAt = 0;
let pending = null;

// Latest known settings for code outside React components (the assistant's replies).
export const getSiteSettings = () => withLinks(current);

// One request shared by every component, repeated at most once a minute during a visit.
function loadSiteSettings() {
  if (loadedAt && Date.now() - loadedAt < REFRESH_MS) return Promise.resolve(current);
  pending ||= fetch(`${apiBase()}site-settings`, { headers: { Accept: "application/json" } })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((body) => {
      current = clean(body?.data);
      loadedAt = Date.now();
      return current;
    })
    .catch(() => current)
    .finally(() => {
      pending = null;
    });
  return pending;
}

const SiteSettingsContext = createContext(withLinks(fallback));

export function SiteSettingsProvider({ children }) {
  const router = useRouter();
  // The first render matches the statically generated HTML (approved values); database values replace them.
  const [settings, setSettings] = useState(fallback);

  useEffect(() => {
    let live = true;
    const refresh = () => loadSiteSettings().then((s) => live && setSettings(s));
    refresh();
    router.events.on("routeChangeComplete", refresh);
    return () => {
      live = false;
      router.events.off("routeChangeComplete", refresh);
    };
  }, [router.events]);

  const value = useMemo(() => withLinks(settings), [settings]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
