import { useCallback, useEffect, useRef, useState } from "react";

const TOKEN_KEY = "probiz:admin-token";
const BASE = "/api/";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function adminFetch(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const form = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !form) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path.replace(/^\//, ""), { method, headers, body: body === undefined || form ? body : JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.endsWith("/admin-panel")) window.location.assign("/admin-panel");
  }
  if (!res.ok) throw new ApiError(data.message || data.error || "Something went wrong.", res.status, data);
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
  new: { label: "New", dot: "bg-brand", soft: "bg-brand-soft text-brand-ink ring-brand/25" },
  contacted: { label: "Contacted", dot: "bg-sky-500", soft: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30" },
  in_progress: { label: "In progress", dot: "bg-amber-400", soft: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/30" },
  won: { label: "Converted", dot: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30" },
  lost: { label: "Closed", dot: "bg-muted-foreground/40", soft: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-500/30" },
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
