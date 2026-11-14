"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ArrowSquareOut, DownloadSimple, MagnifyingGlass, Phone, X } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { Empty, ErrorNote, LoadingRows, Pager, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { adminFetch, downloadCsv, formatDateTime, STATUS_META, timeAgo, useAdminData } from "@/lib/admin-api";
import { formatINRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const LIMIT = 25;
const CHANNEL_LABEL = { web_form: "Website form", assistant: "Assistant", staff: "Staff entry", legacy_api: "Older form", legacy_import: "Imported" };
const amountText = (v) => (v === null || v === undefined || v === "" ? "" : Number.isFinite(Number(v)) ? formatINRShort(Number(v)) : String(v));

function Leads() {
  const router = useRouter();
  const { config, isAdmin } = useAdmin();
  const { type = "", status = "", q = "", page = "1", scope = "", channel = "" } = router.query;
  const typeDef = config.types.find((t) => t.type === type);
  const owner = config.employees.find((e) => e.id === scope);
  const heading = typeDef
    ? typeDef.label
    : scope === "mine"
      ? "My leads"
      : scope === "unassigned"
        ? isAdmin
          ? "Unassigned leads"
          : "Pick up new leads"
        : owner
          ? `${owner.name}'s leads`
          : isAdmin
            ? "All leads"
            : "My leads and new leads";
  const subheading =
    scope === "unassigned"
      ? isAdmin
        ? "Nobody owns these yet. Open one to assign it to an advisor."
        : "Open a lead and act on it to make it yours."
      : typeDef
        ? "Submissions from this form on the website."
        : "Most recent activity first.";
  const [search, setSearch] = useState(q);
  const [exporting, setExporting] = useState(false);

  useEffect(() => setSearch(q), [q]);

  const setQuery = (patch) => {
    const next = { ...router.query, ...patch };
    for (const k of Object.keys(next)) if (!next[k] || next[k] === "1" && k === "page") delete next[k];
    router.push({ pathname: "/admin-panel/leads", query: next }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => setQuery({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  const path = useMemo(() => {
    if (!router.isReady) return null;
    const p = new URLSearchParams({ type: type || "all", limit: String(LIMIT), page: String(page) });
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (scope) p.set("scope", scope);
    if (channel) p.set("channel", channel);
    return `admin/leads?${p}`;
  }, [router.isReady, type, status, q, page, scope, channel]);

  const { data, error, loading, reload } = useAdminData(path);
  const rows = data?.data || [];
  const counts = data?.statusCounts || {};
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  async function exportCsv() {
    setExporting(true);
    try {
      const p = new URLSearchParams({ type: type || "all", limit: "200" });
      if (status) p.set("status", status);
      if (q) p.set("q", q);
      if (scope) p.set("scope", scope);
      if (channel) p.set("channel", channel);
      let all = [];
      for (let n = 1; ; n++) {
        p.set("page", String(n));
        const res = await adminFetch(`admin/leads?${p}`);
        all = all.concat(res.data);
        if (all.length >= res.total || res.data.length === 0) break;
      }
      downloadCsv(`probiz-${type || "all"}-leads.csv`, [
        { label: "Name", value: (r) => r.name },
        { label: "Product", value: (r) => r.typeLabel },
        { label: "Phone", value: (r) => r.phone },
        { label: "Email", value: (r) => r.email },
        { label: "Amount", value: (r) => r.amount },
        { label: "Detail", value: (r) => r.detail },
        { label: "Status", value: (r) => STATUS_META[r.status]?.label },
        { label: "Advisor", value: (r) => r.assignedName || "Unassigned" },
        { label: "Source", value: (r) => CHANNEL_LABEL[r.channel] || "" },
        { label: "Times sent", value: (r) => r.repeatCount + 1 },
        { label: "Received", value: (r) => formatDateTime(r.createdAt) },
        { label: "Last activity", value: (r) => formatDateTime(r.lastActivityAt) },
      ], all);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeDef?.page && (
            <Button asChild variant="outline" size="sm">
              <a href={typeDef.page} target="_blank" rel="noreferrer">
                <ArrowSquareOut /> View form
              </a>
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting || !allCount}>
              <DownloadSimple /> {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background">
        <div className="flex flex-col gap-3 border-b border-border p-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div role="tablist" aria-label="Filter by status" className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {[["", "All", allCount], ...config.statuses.map((s) => [s, STATUS_META[s].label, counts[s] || 0])].map(([value, label, n]) => (
              <button
                key={value || "all"}
                type="button"
                role="tab"
                aria-selected={status === value}
                onClick={() => setQuery({ status: value, page: "" })}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors",
                  status === value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {label}
                <span className={cn("text-xs tabular-nums", status === value ? "text-background/60" : "text-muted-foreground/70")}>{n}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label="Advisor"
              value={scope}
              onChange={(e) => setQuery({ scope: e.target.value, page: "" })}
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-brand"
            >
              {isAdmin ? (
                <>
                  <option value="">Any advisor</option>
                  <option value="unassigned">Unassigned</option>
                  {config.employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="">Mine and unassigned</option>
                  <option value="mine">Only mine</option>
                  <option value="unassigned">Only unassigned</option>
                </>
              )}
            </select>
            <select
              aria-label="Source"
              value={channel}
              onChange={(e) => setQuery({ channel: e.target.value, page: "" })}
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="">Any source</option>
              {(config.channels || []).map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c] || c}
                </option>
              ))}
            </select>
            {!typeDef && (
              <select
                aria-label="Product"
                value={type}
                onChange={(e) => setQuery({ type: e.target.value, page: "" })}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="">All products</option>
                {config.groups.map((g) => (
                  <optgroup key={g.id} label={g.label}>
                    {config.types
                      .filter((t) => t.group === g.id)
                      .map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            )}
            <label className="relative flex-1 2xl:w-72 2xl:flex-none">
              <span className="sr-only">Search leads</span>
              <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone or email"
                className="h-9 w-full rounded-lg border border-border bg-background pr-8 pl-9 text-sm outline-none focus:border-brand"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </label>
          </div>
        </div>

        <ErrorNote error={error} onRetry={reload} />
        {loading && !data ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <Empty title={q || status ? "No leads match" : "No leads yet"} body={q || status ? "Try a different search or status." : "Submissions from the website will land here."} />
        ) : (
          <>
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="hidden px-5 py-3 font-medium xl:table-cell">Detail</th>
                  <th className="px-5 py-3 font-medium">Last activity</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Advisor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y divide-border transition-opacity", loading && "opacity-60")}>
                {rows.map((r) => (
                  <tr key={`${r.type}-${r.id}`} onClick={() => router.push(`/admin-panel/leads/${r.type}/${r.id}`)} className="cursor-pointer transition-colors hover:bg-secondary/60">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin-panel/leads/${r.type}/${r.id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-brand-ink">
                        {r.name}
                      </Link>
                      {r.repeatCount > 0 && (
                        <span title="Sent the form more than once" className="ml-2 rounded-full bg-brand-soft px-1.5 py-0.5 text-[0.6875rem] font-medium text-brand-ink tabular-nums">
                          ×{r.repeatCount + 1}
                        </span>
                      )}
                      <span className="block text-xs text-muted-foreground">
                        {[!typeDef && r.typeLabel, CHANNEL_LABEL[r.channel]].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="block tabular-nums">{r.phone || "-"}</span>
                      {r.email && <span className="block max-w-[14rem] truncate text-xs text-muted-foreground">{r.email}</span>}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">{amountText(r.amount) || <span className="text-muted-foreground">-</span>}</td>
                    <td className="hidden max-w-[14rem] truncate px-5 py-3.5 text-muted-foreground xl:table-cell">{r.detail || "-"}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground" title={`Received ${formatDateTime(r.createdAt)}`}>
                      {timeAgo(r.lastActivityAt || r.createdAt)}
                    </td>
                    <td className="hidden px-5 py-3.5 lg:table-cell">
                      {r.assignedName ? <span className="text-sm">{r.assignedName}</span> : <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Unassigned</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-border md:hidden">
              {rows.map((r) => (
                <li key={`${r.type}-${r.id}`} className="flex items-center gap-3 px-4 py-3.5">
                  <Link href={`/admin-panel/leads/${r.type}/${r.id}`} className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.name}</span>
                      <StatusBadge status={r.status} className="shrink-0" />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {r.typeLabel} · {timeAgo(r.createdAt)}
                      {amountText(r.amount) ? ` · ${amountText(r.amount)}` : ""}
                    </span>
                  </Link>
                  {r.phone && (
                    <a href={`tel:${r.phone}`} aria-label={`Call ${r.name}`} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                      <Phone weight="fill" className="size-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <Pager page={Number(page)} limit={LIMIT} total={data.total} onPage={(n) => setQuery({ page: String(n) })} />
          </>
        )}
      </div>
    </>
  );
}

export default function LeadsPage() {
  return (
    <AdminShell>
      <Leads />
    </AdminShell>
  );
}
