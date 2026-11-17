// The visitor's city, from the browser's location (only after they agree), so forms can pre-fill it.
// Only the place names are kept; coordinates are used once for the lookup and never stored or sent to us.
const KEY = "probiz:location";
const ASK_KEY = "probiz:location-ask";
export const LOCATION_EVENT = "probiz:location";

export function savedLocation() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function declinedLocation() {
  try {
    return window.localStorage.getItem(ASK_KEY) === "no";
  } catch {
    return false;
  }
}

export function declineLocation() {
  try {
    window.localStorage.setItem(ASK_KEY, "no");
  } catch {
    // Private mode: we may ask again next visit.
  }
}

function save(loc) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(loc));
    window.localStorage.removeItem(ASK_KEY);
  } catch {
    // Private mode: the location lasts for this page view only.
  }
  window.dispatchEvent(new CustomEvent(LOCATION_EVENT, { detail: loc }));
}

const position = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 })
  );

// Resolves to the saved location, or rejects (permission denied, timeout, lookup failed).
export async function detectLocation() {
  if (!navigator.geolocation) throw new Error("unsupported");
  const { coords } = await position();
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.search = new URLSearchParams({ latitude: coords.latitude.toFixed(5), longitude: coords.longitude.toFixed(5), localityLanguage: "en" });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`lookup ${res.status}`);
  const d = await res.json();
  const district = d.localityInfo?.administrative?.find((a) => a.adminLevel === 5)?.name?.replace(/\s+district$/i, "") || "";
  const city = d.city || d.locality || district;
  if (!city) throw new Error("no city");
  const state = d.principalSubdivision || "";
  const pinCode = /^\d{6}$/.test(d.postcode || "") ? d.postcode : "";
  const loc = { city, district, state, pinCode, label: [city, [state, pinCode].filter(Boolean).join(" ")].filter(Boolean).join(", "), at: Date.now() };
  save(loc);
  return loc;
}
