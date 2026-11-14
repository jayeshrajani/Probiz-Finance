const apiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "/api/";
  return base.endsWith("/") ? base : `${base}/`;
};

const NETWORK_ERROR = "We couldn't reach the server. Check your connection and try again.";

// Signed-in customers send their token so their leads are linked to their account.
function withAuth(init = {}) {
  const token = getStoredUser()?.accessToken;
  if (!token) return init;
  return { ...init, headers: { ...init.headers, authorization: `Bearer ${token}` } };
}

async function request(endpoint, init) {
  try {
    const res = await fetch(apiBase() + endpoint, withAuth(init));
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { message: NETWORK_ERROR } };
  }
}

export const getJSON = (endpoint) => request(endpoint);

export const postJSON = (endpoint, body) =>
  request(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const postForm = (endpoint, formData) => request(endpoint, { method: "POST", body: formData });

export function errorMessage(data, fallback = "Something went wrong. Please try again.") {
  return data?.message || data?.error || fallback;
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem("userData")) || null;
  } catch {
    return null;
  }
}
