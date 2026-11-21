"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ArrowSquareOut, DownloadSimple, MagnifyingGlass, Phone, Plus, SealCheck, X } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { Empty, ErrorNote, LoadingRows, PageHeader, Pager, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetch, downloadCsv, formatDateTime, STATUS_META, timeAgo, useAdminData } from "@/lib/admin-api";
import { formatINRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const LIMIT = 25;
const ANY = "any";
const CHANNEL_LABEL = { web_form: "Website form", assistant: "Assistant", otp_signin: "Mobile sign-in", staff: "Staff entry", legacy_api: "Older form", legacy_import: "Imported" };

function Verified({ show }) {
  if (!show) return null;
  return <SealCheck weight="fill" aria-label="Number verified by OTP" className="inline size-3.5 shrink-0 align-[-2px] text-emerald-600 dark:text-emerald-400" />;
}
const amountText = (v) => (v === null || v === undefined || v === "" ? "" : Number.isFinite(Number(v)) ? formatINRShort(Number(v)) : String(v));
const fmtDay = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function FilterSelect({ label, value, onChange, children, className }) {
  return (
    <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
      <SelectTrigger aria-label={label} className={cn("w-full sm:w-auto sm:min-w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function Leads() {
  const router = useRouter();
  const { config, isAdmin, isSales } = useAdmin();
  const { type = "", group = "", status = "", q = "", page = "1", scope = "", channel = "", from = "", to = "", stage = "", addedBy = "" } = router.query;
  const typeDef = config.types.find((t) => t.type === type);
  const groupDef = config.groups.find((g) => g.id === group);
  const owner = config.employees.find((e) => e.id === scope);
  const adder = isAdmin ? config.employees.find((e) => e.id === addedBy) : null;
  const opsEmployees = config.employees.filter((e) => e.persona !== "sales");
  const heading = typeDef
    ? typeDef.label
    : groupDef
      ? groupDef.label
      : adder
      ? `Added by ${adder.name}`
      : isSales || scope === "mine"
      ? "My leads"
      : scope === "handled"
      ? "Handled earlier"
      : scope === "archived" && isAdmin
      ? "Archived leads"
      : scope === "unassigned"
        ? isAdmin
          ? "Unassigned leads"
          : "Pick up new leads"
        : owner
          ? `${owner.name}'s leads`
          : isAdmin
            ? "All leads"
            : "My leads and new leads";
  const subheading = isSales
    ? "Leads you added. Operations pick them up from here; open one to follow its progress."
    : scope === "handled"
    ? "Leads you worked before that have moved on. View only."
    : scope === "archived" && isAdmin
      ? "Kept, but hidden from every other list and count. Open one to restore it."
      : scope === "unassigned"
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
    for (const k of Object.keys(next)) if (!next[k] || (k === "page" && next[k] === "1")) delete next[k];
    router.push({ pathname: "/admin-panel/leads", query: next }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => setQuery({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters = useMemo(() => {
    const p = new URLSearchParams({ type: type || "all" });
    if (group) p.set("group", group);
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (scope) p.set("scope", scope);
    if (channel) p.set("channel", channel);
    if (stage) p.set("stage", stage);
    if (addedBy) p.set("addedBy", addedBy);
    if (from && to) {
      p.set("from", from);
      p.set("to", to);
    }
    return p;
  }, [type, group, status, q, scope, channel, stage, addedBy, from, to]);

  const path = useMemo(() => {
    if (!router.isReady) return null;
    const p = new URLSearchParams(filters);
    p.set("limit", String(LIMIT));
    p.set("page", String(page));
    return `admin/leads?${p}`;
  }, [router.isReady, filters, page]);

  const { data, error, loading, reload } = useAdminData(path);
  const rows = data?.data || [];
  const counts = data?.statusCounts || {};
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const filtered = Boolean(q || status || channel || stage || (from && to));

  async function exportCsv() {
    setExporting(true);
    try {
      const p = new URLSearchParams(filters);
      p.set("limit", "200");
      let all = [];
      for (let n = 1; ; n++) {
        p.set("page", String(n));
        const res = await adminFetch(`admin/leads?${p}`);
        all = all.concat(res.data);
        if (all.length >= res.total || res.data.length === 0) break;
      }
      downloadCsv(`probiz-${type || group || "all"}-leads.csv`, [
        { label: "Ref", value: (r) => r.ref },
        { label: "Name", value: (r) => r.name },
        { label: "Product", value: (r) => r.typeLabel },
        { label: "Phone", value: (r) => r.phone },
        { label: "Number verified", value: (r) => (r.phoneVerified ? "Yes" : "No") },
        { label: "Email", value: (r) => r.email },
        { label: "Amount", value: (r) => r.amount },
        { label: "Detail", value: (r) => r.detail },
        { label: "Status", value: (r) => STATUS_META[r.status]?.label },
        { label: "Level", value: (r) => r.stage?.toUpperCase() },
        { label: "Advisor", value: (r) => r.assignedName || "Unassigned" },
        { label: "Source", value: (r) => (r.addedBy ? `Added by ${r.addedBy}` : CHANNEL_LABEL[r.channel] || "") },
        { label: "Times sent", value: (r) => r.repeatCount + 1 },
        { label: "Received", value: (r) => formatDateTime(r.createdAt) },
        { label: "Last activity", value: (r) => formatDateTime(r.lastActivityAt) },
      ], all);
    } finally {
      setExporting(false);
    }
  }

  const open = (r) => router.push(`/admin-panel/leads/${r.type}/${r.id}`);

  return (
    <>
      <PageHeader title={heading} description={subheading}>
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
        <Button asChild size="sm">
          <Link href={typeDef?.formKey ? `/admin-panel/leads/new?type=${typeDef.type}` : "/admin-panel/leads/new"}>
            <Plus weight="bold" /> Add lead
          </Link>
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-3">
          <div className="-mx-1 overflow-x-auto px-1">
            <Tabs value={status || "all"} onValueChange={(v) => setQuery({ status: v === "all" ? "" : v, page: "" })}>
              <TabsList aria-label="Filter by status">
                {[["all", "All", allCount], ...config.statuses.map((s) => [s, STATUS_META[s].label, counts[s] || 0])].map(([value, label, n]) => (
                  <TabsTrigger key={value} value={value} className="px-3">
                    {label}
                    <span className="text-xs tabular-nums text-muted-foreground">{n}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {!isSales && (
              <FilterSelect label="Advisor" value={scope} onChange={(v) => setQuery({ scope: v, page: "" })}>
                {isAdmin ? (
                  <>
                    <SelectItem value={ANY}>Any advisor</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    {opsEmployees.length > 0 && <SelectSeparator />}
                    {opsEmployees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <>
                    <SelectItem value={ANY}>Everything I can see</SelectItem>
                    <SelectItem value="mine">Only mine</SelectItem>
                    <SelectItem value="unassigned">Ready to pick up</SelectItem>
                    <SelectItem value="handled">Handled earlier</SelectItem>
                  </>
                )}
              </FilterSelect>
            )}
            {(isAdmin || isSales) && (
              <FilterSelect label="Level" value={stage} onChange={(v) => setQuery({ stage: v, page: "" })} className="sm:min-w-36">
                <SelectItem value={ANY}>Any level</SelectItem>
                {(config.stages || []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </FilterSelect>
            )}
            <FilterSelect label="Source" value={channel} onChange={(v) => setQuery({ channel: v, page: "" })}>
              <SelectItem value={ANY}>Any source</SelectItem>
              {(config.channels || []).map((c) => (
                <SelectItem key={c} value={c}>
                  {CHANNEL_LABEL[c] || c}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="Product" value={type} onChange={(v) => setQuery({ type: v, page: "" })} className="sm:min-w-48">
              <SelectItem value={ANY}>{groupDef ? `All ${groupDef.label.toLowerCase()}` : "All products"}</SelectItem>
              {config.groups
                .filter((g) => !groupDef || g.id === groupDef.id)
                .map((g) => (
                  <SelectGroup key={g.id}>
                    <SelectSeparator />
                    <SelectLabel>{g.label}</SelectLabel>
                    {config.types
                      .filter((t) => t.group === g.id)
                      .map((t) => (
                        <SelectItem key={t.type} value={t.type}>
                          {t.label}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
            </FilterSelect>
            {from && to && (
              <Button variant="secondary" size="sm" className="h-9 rounded-lg" onClick={() => setQuery({ from: "", to: "", page: "" })} aria-label="Clear date filter">
                Received {fmtDay(from)} to {fmtDay(to)} <X weight="bold" />
              </Button>
            )}
            <label className="relative flex-1 sm:min-w-56">
              <span className="sr-only">Search leads</span>
              <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone, email, ref or sales executive"
                className="h-9 w-full rounded-lg border border-border bg-background pr-8 pl-9 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20"
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
          <Empty title={filtered ? "No leads match" : "No leads yet"} body={filtered ? "Try a different search, status or date range." : "Submissions from the website will land here."} />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden xl:table-cell">Detail</TableHead>
                    <TableHead>Last activity</TableHead>
                    <TableHead className="hidden lg:table-cell">Level</TableHead>
                    <TableHead className="hidden lg:table-cell">Advisor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={cn("transition-opacity", loading && "opacity-60")}>
                  {rows.map((r) => (
                    <TableRow key={`${r.type}-${r.id}`} onClick={() => open(r)} className="cursor-pointer">
                      <TableCell>
                        <Link href={`/admin-panel/leads/${r.type}/${r.id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:underline">
                          {r.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {[
                            r.ref,
                            !typeDef && r.typeLabel,
                            r.addedBy ? `added by ${r.addedBy}` : CHANNEL_LABEL[r.channel],
                            r.repeatCount > 0 && `sent ${r.repeatCount + 1} times`,
                            r.readOnly && !isAdmin && !isSales && "view only",
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 tabular-nums">
                          {r.phone || "–"} <Verified show={r.phone && r.phoneVerified} />
                        </span>
                        {r.email && <span className="block max-w-[14rem] truncate text-xs text-muted-foreground">{r.email}</span>}
                      </TableCell>
                      <TableCell className="tabular-nums">{amountText(r.amount) || <span className="text-muted-foreground">–</span>}</TableCell>
                      <TableCell className="hidden max-w-[14rem] truncate text-muted-foreground xl:table-cell">{r.detail || "–"}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground" title={`Received ${formatDateTime(r.createdAt)}`}>
                        {timeAgo(r.lastActivityAt || r.createdAt)}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">{r.stage?.toUpperCase()}</TableCell>
                      <TableCell className={cn("hidden lg:table-cell", !r.assignedName && "text-muted-foreground")}>{r.assignedName || "Unassigned"}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul className="divide-y divide-border md:hidden">
              {rows.map((r) => (
                <li key={`${r.type}-${r.id}`} className="flex items-center gap-3 px-4 py-3.5">
                  <Link href={`/admin-panel/leads/${r.type}/${r.id}`} className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate font-medium">{r.name}</span> <Verified show={r.phoneVerified} />
                      </span>
                      <StatusBadge status={r.status} className="shrink-0 text-xs" />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {[r.ref, r.typeLabel, timeAgo(r.lastActivityAt || r.createdAt), amountText(r.amount), isSales && `${r.stage?.toUpperCase()}, ${r.assignedName || "waiting"}`]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </Link>
                  {r.phone && (
                    <Button asChild size="icon-sm" variant="secondary">
                      <a href={`tel:${r.phone}`} aria-label={`Call ${r.name}`}>
                        <Phone weight="fill" />
                      </a>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Pager page={Number(page)} limit={LIMIT} total={data.total} onPage={(n) => setQuery({ page: String(n) })} />
          </>
        )}
      </Card>
    </>
  );
}

export default function LeadsPage() {
  return (
    <AdminShell title="Leads">
      <Leads />
    </AdminShell>
  );
}
