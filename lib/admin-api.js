import { useCallback, useEffect, useRef, useState } from "react";

const TOKEN_KEY = "probiz:admin-token";
const BASE = "/api/";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function adminFetch(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path.replace(/^\//, ""), { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.endsWith("/admin-panel")) window.location.assign("/admin-panel");
  }
  if (!res.ok) throw new ApiError(data.message || data.error || "Something went wrong.", res.status);
  return data;
}

// Small SWR-style hook: loads on mount and when `path` changes, exposes reload.
export function useAdminData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const latest = useRef(path);

  const load = useCallback(async () => {
    if (!path) return;
    latest.current = path;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await adminFetch(path);
      if (latest.current === path) setState({ data, error: null, loading: false });
    } catch (error) {
      if (latest.current === path) setState({ data: null, error, loading: false });
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Neutralise spreadsheet formulas in exported customer data.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map((c) => csvCell(c.label)).join(","), ...rows.map((r) => columns.map((c) => csvCell(c.value(r))).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export const STATUS_META = {
  new: { label: "New", tone: "bg-brand-soft text-brand-ink ring-brand/30" },
  contacted: { label: "Contacted", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  in_progress: { label: "In progress", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  won: { label: "Converted", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  lost: { label: "Closed", tone: "bg-secondary text-muted-foreground ring-border" },
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function timeAgo(value) {
  if (!value) return "";
  const diff = (new Date(value).getTime() - Date.now()) / 1000;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  return "just now";
}

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
