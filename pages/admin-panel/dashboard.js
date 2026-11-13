"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Buildings, ChartLineUp, Newspaper, Tray, Users, Lightning } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { Empty, ErrorNote, LoadingRows, Panel, StatusBadge } from "@/components/admin/ui";
import { STATUS_META, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const STATUS_BAR = { new: "bg-brand", contacted: "bg-sky-400", in_progress: "bg-amber-400", won: "bg-emerald-500", lost: "bg-muted-foreground/40" };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Kpi({ icon: Icon, label, value, hint, href, accent }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("inline-flex size-8 items-center justify-center rounded-lg", accent ? "bg-brand-soft text-brand-ink" : "bg-secondary text-muted-foreground")}>
          <Icon weight="duotone" className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-border bg-background p-5 transition-[border-color,box-shadow] duration-200";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-foreground/15 hover:shadow-[0_12px_30px_-24px_oklch(0.21_0.006_286/0.4)]")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function DailyChart({ days }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((n, d) => n + d.count, 0);
  const shown = hover ?? days.length - 1;
  const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-3xl font-semibold tracking-[-0.03em] tabular-nums">{total}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{days[shown].count}</span> on {fmt(days[shown].date)}
        </p>
      </div>
      <div className="mt-6 flex h-40 items-end gap-[3px]" onMouseLeave={() => setHover(null)} role="img" aria-label={`${total} leads in the last 30 days`}>
        {days.map((d, i) => (
          <div key={d.date} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((d.count / max) * 100, d.count ? 6 : 2)}%` }}
              transition={{ duration: 0.6, delay: i * 0.012, ease: [0.16, 1, 0.3, 1] }}
              className={cn("w-full rounded-t-[4px] transition-colors", i === shown ? "bg-brand" : d.count ? "bg-foreground/80" : "bg-border")}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{fmt(days[0].date)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function Pipeline({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
        {total > 0 &&
          Object.entries(counts).map(([s, n]) =>
            n ? <motion.span key={s} className={STATUS_BAR[s]} initial={{ width: 0 }} animate={{ width: `${(n / total) * 100}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} /> : null
          )}
      </div>
      <ul className="mt-5 grid gap-3">
        {Object.entries(counts).map(([s, n]) => (
          <li key={s}>
            <Link href={`/admin-panel/leads?status=${s}`} className="flex items-center gap-3 rounded-lg text-sm hover:text-brand-ink">
              <span className={cn("size-2.5 rounded-full", STATUS_BAR[s])} />
              <span className="flex-1">{STATUS_META[s].label}</span>
              <span className="font-medium tabular-nums">{n}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dashboard() {
  const { admin } = useAdmin();
  const { data, error, loading, reload } = useAdminData("admin/overview");
  const o = data?.data;
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight font-semibold tracking-[-0.03em]">
          {greeting()}, {(admin.admin_Name || "there").split(" ")[0]}.
        </h1>
        {o && (
          <p className="mt-1 text-muted-foreground">
            {o.totals.open ? (
              <>
                You have <span className="font-medium text-foreground">{o.totals.open} new {o.totals.open === 1 ? "lead" : "leads"}</span> waiting for a first call.
              </>
            ) : (
              "Every lead has been picked up. Nice."
            )}
          </p>
        )}
      </div>

      <ErrorNote error={error} onRetry={reload} />

      {loading && !o && (
        <Panel bodyClassName="p-0">
          <LoadingRows />
        </Panel>
      )}

      {o && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <Kpi icon={Lightning} label="New leads" value={o.totals.open} hint="Waiting for a first call" href="/admin-panel/leads?status=new" accent />
            <Kpi icon={Tray} label="Last 7 days" value={o.totals.last7} hint={`${o.totals.last30} in 30 days`} href="/admin-panel/leads" />
            <Kpi icon={ChartLineUp} label="All leads" value={o.totals.leads} hint="Across every form" href="/admin-panel/leads" />
            <Kpi icon={Users} label="Customers" value={o.totals.users} hint="Website accounts" href="/admin-panel/customers" />
            <Kpi icon={Buildings} label="Listings" value={o.totals.properties} hint="Property for sale" href="/admin-panel/properties" />
            <Kpi icon={Newspaper} label="Subscribers" value={o.totals.subscribers} hint="Newsletter" href="/admin-panel/subscribers" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Panel title="Leads, last 30 days" description="Every form submission from the website" className="xl:col-span-2">
              <DailyChart days={o.daily} />
            </Panel>
            <Panel title="Pipeline" description="Where every lead stands">
              <Pipeline counts={o.statusCounts} />
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Panel
              title="Latest leads"
              className="xl:col-span-2"
              bodyClassName="p-0"
              actions={
                <Link href="/admin-panel/leads" className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
                  View all <ArrowRight weight="bold" className="size-3.5" />
                </Link>
              }
            >
              {o.recent.length === 0 ? (
                <Empty title="No leads yet" body="Applications and enquiries from the website will appear here." />
              ) : (
                <ul className="divide-y divide-border">
                  {o.recent.map((l) => (
                    <li key={`${l.type}-${l.id}`}>
                      <Link href={`/admin-panel/leads/${l.type}/${l.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/60">
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{l.name.slice(0, 1).toUpperCase()}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{l.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {l.typeLabel}
                            {l.phone ? ` · ${l.phone}` : ""}
                          </span>
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:block">{timeAgo(l.createdAt)}</span>
                        <StatusBadge status={l.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="By product" description="Total leads and how many are new">
              {o.byType.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing yet.</p>
              ) : (
                <ul className="grid gap-4">
                  {o.byType.slice(0, 8).map((t) => (
                    <li key={t.type}>
                      <Link href={`/admin-panel/leads?type=${t.type}`} className="group block">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate group-hover:text-brand-ink">{t.label}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {t.open > 0 && <span className="mr-2 font-medium text-brand-ink">{t.open} new</span>}
                            {t.total}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full bg-foreground/80"
                            initial={{ width: 0 }}
                            animate={{ width: `${(t.total / o.byType[0].total) * 100}%` }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
