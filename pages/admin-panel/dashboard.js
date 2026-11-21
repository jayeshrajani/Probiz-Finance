"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowRight, PencilSimple, SpinnerGap } from "@phosphor-icons/react";
import AdminShell, { stageLabel, useAdmin } from "@/components/admin/AdminShell";
import { Empty, ErrorNote, LoadingRows, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fieldBase } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_META, adminFetch, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const PRESETS = [7, 30, 90];
const SOURCE_TABS = [
  { id: "sources", label: "Sources", empty: "No source data yet." },
  { id: "channels", label: "Channels", empty: "No leads in this period." },
  { id: "campaigns", label: "Campaigns", empty: "No UTM-tagged leads in this period. Tag ad links with utm_campaign to see them here." },
  { id: "pages", label: "Pages", empty: "No landing page data yet." },
];
const EASE = [0.16, 1, 0.3, 1];

const OUTCOMES = [
  { key: "won", label: "Converted", bar: "bg-emerald-500" },
  { key: "open", label: "Open", bar: "bg-amber-400" },
  { key: "lost", label: "Rejected", bar: "bg-red-500" },
];
const SALES_DOTS = { new: "bg-amber-300", contacted: "bg-amber-400", in_progress: "bg-amber-500", won: "bg-emerald-500", lost: "bg-red-500" };
const TONES = {
  good: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  mid: { dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  bad: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  none: { dot: "bg-muted-foreground/40", text: "" },
};
// Under 5 leads a rejection rate says little, so it stays neutral.
const rejectionTone = (rate, n) => (rate === null || rate === undefined || n < 5 ? "none" : rate > 0.5 ? "bad" : rate >= 0.25 ? "mid" : "good");

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const monthLabel = (m) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

function monthPace(month) {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const now = new Date();
  const current = now.getFullYear() === y && now.getMonth() + 1 === m;
  // Completed days only, so nothing counts as behind on the 1st.
  return { elapsed: current ? (now.getDate() - 1) / days : 1, left: current ? days - now.getDate() + 1 : 0 };
}

function paceTone(done, goal, month) {
  if (done >= goal) return ["good", "Target met"];
  const expected = goal * monthPace(month).elapsed;
  if (done >= expected) return ["good", "On track"];
  return done >= expected * 0.6 ? ["mid", "A little behind"] : ["bad", "Behind"];
}

const pct = (v) => (v === null || v === undefined ? "–" : `${Math.round(v * 100)}%`);
const fmtDay = (iso, withYear) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });

function delta(current, previous) {
  if (!previous) return current ? "None in the period before" : "Same as the period before";
  const change = Math.round(((current - previous) / previous) * 100);
  return change === 0 ? "Same as the period before" : `${change > 0 ? "+" : ""}${change}% vs the period before`;
}

function leadsHref(params = {}) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const s = q.toString();
  return `/admin-panel/leads${s ? `?${s}` : ""}`;
}

function Header({ title, summary, children }) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
        {summary && <p className="mt-1 text-muted-foreground">{summary}</p>}
      </div>
      {children && <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">{children}</div>}
    </div>
  );
}

function Kpi({ label, value, hint, href, valueClassName }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-3xl font-semibold tracking-[-0.03em] tabular-nums", valueClassName)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  return (
    <Card className={cn("p-5", href && "transition-colors hover:border-foreground/20")}>
      {href ? (
        <Link href={href} className="block outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}

function DailyChart({ days, bucketDays = 1, endLabel = "Today", stacked = false }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((n, d) => n + d.count, 0);
  const shown = hover ?? days.length - 1;
  const day = days[shown];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-3xl font-semibold tracking-[-0.03em] tabular-nums">{total}</p>
        <p className="text-right text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{day.count}</span> {bucketDays > 1 ? "in the week of" : "on"} {fmtDay(day.date)}
          {stacked && day.count > 0 && (
            <span className="tabular-nums">
              {": "}
              {OUTCOMES.map((o) => `${day[o.key] || 0} ${o.label.toLowerCase()}`).join(", ")}
            </span>
          )}
        </p>
      </div>
      <div className={cn("mt-6 flex h-40 items-end", days.length > 60 ? "gap-px" : "gap-[3px]")} onMouseLeave={() => setHover(null)} role="img" aria-label={`${total} leads from ${fmtDay(days[0].date)} to ${endLabel}`}>
        {days.map((d, i) => (
          <div key={d.date} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
            {stacked && d.count ? (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.count / max) * 100, 6)}%` }}
                transition={{ duration: 0.5, ease: EASE }}
                className={cn("flex w-full flex-col-reverse overflow-hidden rounded-t-[3px] transition-opacity", i === shown ? "opacity-100" : "opacity-75")}
              >
                {OUTCOMES.map((o) => (d[o.key] ? <span key={o.key} className={o.bar} style={{ flexGrow: d[o.key] }} /> : null))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.count / max) * 100, d.count ? 6 : 2)}%` }}
                transition={{ duration: 0.5, ease: EASE }}
                className={cn("w-full rounded-t-[3px] transition-colors", i === shown && !stacked ? "bg-brand" : d.count ? "bg-foreground/75" : "bg-border")}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{fmtDay(days[0].date)}</span>
        <span>{endLabel}</span>
      </div>
      {stacked && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {OUTCOMES.map((o) => (
            <li key={o.key} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", o.bar)} />
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pipeline({ counts, query, dots }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        {total > 0 &&
          Object.entries(counts).map(([s, n]) =>
            n ? <motion.span key={s} className={dots?.[s] || STATUS_META[s].dot} initial={{ width: 0 }} animate={{ width: `${(n / total) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} /> : null
          )}
      </div>
      <ul className="mt-5 grid gap-1">
        {Object.entries(counts).map(([s, n]) => (
          <li key={s}>
            <Link href={leadsHref({ ...query, status: s })} className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted">
              <StatusBadge status={s} />
              <span className="tabular-nums">{n}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadRows({ leads, empty, showStage }) {
  if (leads.length === 0) return <Empty title={empty.title} body={empty.body} />;
  return (
    <ul className="divide-y divide-border">
      {leads.map((l) => (
        <li key={`${l.type}-${l.id}`}>
          <Link href={`/admin-panel/leads/${l.type}/${l.id}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{l.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {[l.typeLabel, l.phone, showStage && l.stage?.toUpperCase(), showStage ? l.assignedName || "waiting" : l.assignedName].filter(Boolean).join(", ")}
              </span>
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">{timeAgo(l.createdAt)}</span>
            <StatusBadge status={l.status} className="w-28 justify-end" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const viewAll = (href, label = "View all") => (
  <Button asChild variant="ghost" size="sm" className="-my-1 h-8 px-3">
    <Link href={href}>
      {label} <ArrowRight weight="bold" />
    </Link>
  </Button>
);

function Bars({ items, hrefFor, empty = "Nothing yet." }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.total));
  return (
    <ul className="grid gap-3.5">
      {items.map((t) => {
        const row = (
          <>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="truncate">{t.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {t.won > 0 && <span className="mr-2">{t.won} won</span>}
                <span className="text-foreground">{t.total}</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full rounded-full bg-foreground/70" initial={{ width: 0 }} animate={{ width: `${(t.total / max) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
            </div>
          </>
        );
        const href = hrefFor?.(t);
        return (
          <li key={t.type || t.label}>
            {href ? (
              <Link href={href} className="block hover:[&_span.truncate]:underline">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}

function HeadTip({ children, tip, className }) {
  return (
    <TableHead className={cn("text-right", className)}>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-4">{children}</TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </TableHead>
  );
}

function TeamTable({ team, query }) {
  if (!team?.length)
    return (
      <p className="p-5 text-sm text-muted-foreground">
        No employees yet.{" "}
        <Link href="/admin-panel/team" className="font-medium text-foreground underline underline-offset-4">
          Add your advisors
        </Link>{" "}
        so leads can be shared out.
      </p>
    );
  return (
    <Table className="min-w-[640px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Advisor</TableHead>
          <HeadTip tip="Leads from this period that are assigned to them now.">Assigned</HeadTip>
          <TableHead className="text-right">Won</TableHead>
          <HeadTip tip="Won as a share of assigned.">Conversion</HeadTip>
          <HeadTip tip="Open leads they own right now.">Active</HeadTip>
        </TableRow>
      </TableHeader>
      <TableBody className="tabular-nums">
        {team.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">
              <Link href={leadsHref({ scope: m.id, ...query })} className="hover:underline">
                {m.name}
              </Link>
              {m.personaLabel && <span className="block text-xs font-normal text-muted-foreground">{m.personaLabel}</span>}
            </TableCell>
            <TableCell className="text-right">{m.assigned}</TableCell>
            <TableCell className="text-right">{m.won}</TableCell>
            <TableCell className="text-right">{pct(m.conversion)}</TableCell>
            <TableCell className="text-right">{m.active}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SalesTable({ sales, query }) {
  if (!sales?.length)
    return (
      <p className="p-5 text-sm text-muted-foreground">
        No sales executives yet.{" "}
        <Link href="/admin-panel/team" className="font-medium text-foreground underline underline-offset-4">
          Add one
        </Link>{" "}
        to track the leads they bring in.
      </p>
    );
  return (
    <Table className="min-w-[640px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Sales executive</TableHead>
          <HeadTip tip="Leads they added in this period.">Added</HeadTip>
          <TableHead className="text-right">Converted</TableHead>
          <HeadTip tip="Converted as a share of added.">Conversion</HeadTip>
          <HeadTip tip="Closed without converting, as a share of added.">Rejected</HeadTip>
          <HeadTip tip="Leads from this period that are still open.">Open</HeadTip>
        </TableRow>
      </TableHeader>
      <TableBody className="tabular-nums">
        {sales.map((m) => {
          const tone = TONES[rejectionTone(m.added ? m.lost / m.added : null, m.added)];
          return (
            <TableRow key={m.id}>
              <TableCell className="font-medium">
                <Link href={leadsHref({ ...query, addedBy: m.id })} className="hover:underline">
                  {m.name}
                </Link>
              </TableCell>
              <TableCell className="text-right">{m.added}</TableCell>
              <TableCell className="text-right">{m.won}</TableCell>
              <TableCell className="text-right">{pct(m.conversion)}</TableCell>
              <TableCell className="text-right">
                <span className={cn("inline-flex items-center gap-1.5", tone.text)}>
                  <span className={cn("size-2 rounded-full", tone.dot)} />
                  {m.lost} <span className="text-muted-foreground">({pct(m.added ? m.lost / m.added : null)})</span>
                </span>
              </TableCell>
              <TableCell className="text-right">{m.open}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function TargetBar({ label, done, goal, month, format = String, compact = false }) {
  const [tone, status] = paceTone(done, goal, month);
  const bar = (
    <div className={cn("overflow-hidden rounded-full bg-muted", compact ? "mt-1.5 h-1.5" : "mt-2 h-2")}>
      <motion.div className={cn("h-full rounded-full", TONES[tone].dot)} initial={{ width: 0 }} animate={{ width: `${Math.min(done / goal, 1) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
    </div>
  );
  if (compact)
    return (
      <div className="min-w-32" title={status}>
        <p className="tabular-nums">
          <span className={cn("font-medium", TONES[tone].text)}>{format(done)}</span> <span className="text-muted-foreground">/ {format(goal)}</span>
        </p>
        {bar}
      </div>
    );
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", TONES[tone].text)}>{status}</span>
      </div>
      <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] tabular-nums">
        {format(done)} <span className="text-base font-normal text-muted-foreground">of {format(goal)}</span>
      </p>
      {bar}
      <p className="mt-1.5 text-xs text-muted-foreground">{done >= goal ? "Anything more is a bonus." : `${format(goal - done)} to go`}</p>
    </div>
  );
}

function MyTarget({ t }) {
  const { leads, amount } = t.target;
  const { left } = monthPace(t.month);
  return (
    <Panel title={`My target, ${monthLabel(t.month)}`} description={`Only leads you added that convert this month count. ${left} ${left === 1 ? "day" : "days"} left.`}>
      {!leads && !amount ? (
        <p className="text-sm text-muted-foreground">No target set for you this month. Your admin sets it.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {leads && <TargetBar label="Converted leads" done={t.won} goal={leads} month={t.month} />}
          {amount && <TargetBar label="Converted loan amount" done={t.wonAmount} goal={amount} month={t.month} format={inr} />}
        </div>
      )}
    </Panel>
  );
}

function SalesTargets({ targets, onSaved }) {
  const [editing, setEditing] = useState(null);
  const [v, setV] = useState({ leads: "", amount: "" });
  const [busy, setBusy] = useState(false);
  const field = cn(fieldBase, "h-10 text-sm");
  if (!targets.length) return <p className="p-5 text-sm text-muted-foreground">No sales executives yet.</p>;
  const edit = (t) => {
    setEditing(t);
    setV({ leads: t.target.leads ?? "", amount: t.target.amount ?? "" });
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const num = (s) => (s === "" ? null : Number(s));
      await adminFetch(`admin/employees/${editing.id}/target`, { method: "PUT", body: { leads: num(v.leads), amount: num(v.amount) } });
      toast.success(`Target saved for ${editing.name}.`);
      setEditing(null);
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Sales executive</TableHead>
            <TableHead>Converted leads</TableHead>
            <TableHead>Converted amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targets.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">
                {t.name}
                <Button variant="outline" size="sm" className="mt-1.5 flex" onClick={() => edit(t)}>
                  <PencilSimple /> Set target
                </Button>
              </TableCell>
              <TableCell>
                {t.target.leads ? <TargetBar compact done={t.won} goal={t.target.leads} month={t.month} /> : <span className="text-muted-foreground">No target, {t.won} converted</span>}
              </TableCell>
              <TableCell>
                {t.target.amount ? (
                  <TargetBar compact done={t.wonAmount} goal={t.target.amount} month={t.month} format={inr} />
                ) : (
                  <span className="text-muted-foreground">No target, {inr(t.wonAmount)}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={Boolean(editing)} onOpenChange={(next) => !next && setEditing(null)}>
        <DialogContent>
          <form className="grid gap-4" onSubmit={save}>
            <DialogHeader>
              <DialogTitle>Monthly target for {editing?.name}</DialogTitle>
              <DialogDescription>Only leads they added that convert count. Leave a box empty to switch that tracker off.</DialogDescription>
            </DialogHeader>
            <label className="grid gap-1.5 text-sm font-medium">
              Converted leads per month
              <input className={field} type="number" min={1} step={1} inputMode="numeric" value={v.leads} onChange={(e) => setV({ ...v, leads: e.target.value })} placeholder="No target" autoFocus />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Converted loan amount per month (₹)
              <input className={field} type="number" min={1} step={1} inputMode="numeric" value={v.amount} onChange={(e) => setV({ ...v, amount: e.target.value })} placeholder="No target" />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy && <SpinnerGap className="animate-spin" />} Save target
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Sources({ sources }) {
  return (
    <Tabs defaultValue="sources">
      <TabsList className="w-full">
        {SOURCE_TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {SOURCE_TABS.map((t) => (
        <TabsContent key={t.id} value={t.id} className="pt-3">
          <Bars items={sources[t.id] || []} empty={t.empty} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function RangePicker({ range, onChange }) {
  const [custom, setCustom] = useState(range.preset === null);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const today = new Date().toLocaleDateString("en-CA");
  const dateField = "h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20";
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Tabs
        value={custom ? "custom" : String(range.preset)}
        onValueChange={(v) => {
          if (v === "custom") return setCustom(true);
          setCustom(false);
          onChange({ days: v });
        }}
      >
        <TabsList aria-label="Date range">
          {PRESETS.map((d) => (
            <TabsTrigger key={d} value={String(d)} className="px-3">
              {d} days
            </TabsTrigger>
          ))}
          <TabsTrigger value="custom" className="px-3">
            Custom
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {custom && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (from && to && from <= to) onChange({ from, to });
          }}
        >
          <label className="sr-only" htmlFor="range-from">
            From
          </label>
          <input id="range-from" type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} className={dateField} />
          <span className="text-sm text-muted-foreground">to</span>
          <label className="sr-only" htmlFor="range-to">
            To
          </label>
          <input id="range-to" type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} className={dateField} />
          <Button type="submit" size="sm" disabled={!from || !to || from > to}>
            Apply
          </Button>
        </form>
      )}
    </div>
  );
}

function Loading({ error, reload, loading }) {
  return (
    <>
      <ErrorNote error={error} onRetry={reload} />
      {loading && (
        <Panel bodyClassName="p-0">
          <LoadingRows />
        </Panel>
      )}
    </>
  );
}

function AdminOverview() {
  const router = useRouter();
  const { config } = useAdmin();
  const { days, from, to, addedBy } = router.query;
  const salesTeam = (config.employees || []).filter((e) => e.persona === "sales");
  const seller = salesTeam.find((e) => e.id === addedBy);
  const params = new URLSearchParams({ analytics: "1" });
  if (from && to) {
    params.set("from", from);
    params.set("to", to);
  } else if (days) params.set("days", days);
  if (seller) params.set("addedBy", seller.id);
  const { data, error, loading, reload } = useAdminData(router.isReady ? `admin/overview?${params}` : null);
  const o = data?.data;
  const a = o?.analytics;

  const replaceQuery = (query) => {
    const next = Object.fromEntries(Object.entries(query).filter(([, v]) => v));
    router.replace({ pathname: router.pathname, query: next }, undefined, { shallow: true });
  };
  const setRange = (query) => replaceQuery({ ...query, addedBy: seller?.id });
  const setSeller = (id) => replaceQuery({ days, from, to, addedBy: id });
  const rangeLabel = a ? (a.range.preset ? `last ${a.range.preset} days` : `${fmtDay(a.range.from)} to ${fmtDay(a.range.to, true)}`) : "";
  const inRange = a ? { from: a.range.from, to: a.range.to, addedBy: seller?.id } : {};

  const summary = o
    ? o.totals.unassigned
      ? `${o.totals.unassigned} open ${o.totals.unassigned === 1 ? "lead has" : "leads have"} no advisor yet.`
      : "Every open lead has an advisor."
    : null;

  return (
    <>
      <Header title={seller ? `Overview: ${seller.name}` : "Overview"} summary={summary}>
        {salesTeam.length > 0 && (
          <Select value={seller?.id || "all"} onValueChange={(v) => setSeller(v === "all" ? "" : v)}>
            <SelectTrigger aria-label="Sales executive" className="w-full sm:w-auto sm:min-w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sales executives</SelectItem>
              {salesTeam.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {a && <RangePicker key={`${a.range.preset}-${a.range.from}-${a.range.to}`} range={a.range} onChange={setRange} />}
      </Header>
      <Loading error={error} reload={reload} loading={loading && !o} />

      {o && a && (
        <div className={cn("grid grid-cols-1 gap-6 transition-opacity", loading && "opacity-60")} aria-busy={loading || undefined}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="New leads" value={o.totals.open} hint="Waiting for a first call" href={leadsHref({ status: "new", addedBy: seller?.id })} />
            <Kpi
              label="Unassigned"
              value={o.totals.unassigned}
              hint={o.stageCounts ? `L1 pool ${o.stageCounts.l1.waiting}, L2 pool ${o.stageCounts.l2.waiting}` : "Open leads with no advisor"}
              href={leadsHref({ scope: "unassigned", addedBy: seller?.id })}
            />
            <Kpi label="Leads in period" value={a.totals.leads} hint={delta(a.totals.leads, a.totals.previous)} href={leadsHref(inRange)} />
            <Kpi label="Converted" value={a.totals.won} hint={`${pct(a.totals.conversion)} of leads in period`} href={leadsHref({ ...inRange, status: "won" })} />
            <Kpi label="Customers" value={o.totals.users} hint="Website accounts" href="/admin-panel/customers" />
            <Kpi label="Listings" value={o.totals.properties} hint="Property for sale" href="/admin-panel/properties" />
            <Kpi label="Subscribers" value={o.totals.subscribers} hint="Newsletter" href="/admin-panel/subscribers" />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Panel title={`Leads, ${rangeLabel}`} description={a.range.bucketDays > 1 ? "Form submissions, grouped by week" : "Form submissions per day"} className="xl:col-span-2">
              <DailyChart days={a.series} bucketDays={a.range.bucketDays} endLabel={a.range.preset ? "Today" : fmtDay(a.range.to)} />
            </Panel>
            <Panel title="Pipeline" description="Leads from this period, by current status">
              <Pipeline counts={a.statusCounts} query={inRange} />
            </Panel>
          </div>
          <Panel
            title="Team performance"
            description={`Operations. Assigned, won and conversion cover the ${rangeLabel}. Active is as of now.`}
            bodyClassName="p-0"
          >
            <TeamTable team={a.team} query={inRange} />
          </Panel>
          <Panel title="Sales performance" description={`Leads each sales executive added in the ${rangeLabel}, and how many converted.`} bodyClassName="p-0">
            <SalesTable sales={a.sales} query={inRange} />
          </Panel>
          {o.targets && (
            <Panel
              title={`Sales targets, ${monthLabel(o.targets[0]?.month || new Date().toISOString().slice(0, 7))}`}
              description="Only leads each executive added that converted this month count. They see their own progress on their dashboard."
              bodyClassName="p-0"
            >
              <SalesTargets targets={o.targets} onSaved={reload} />
            </Panel>
          )}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Panel title="Latest leads" className="xl:col-span-2" bodyClassName="p-0" actions={viewAll(leadsHref())}>
              <LeadRows leads={o.recent} empty={{ title: "No leads yet", body: "Applications and enquiries from the website will appear here." }} />
            </Panel>
            <div className="grid min-w-0 grid-cols-1 content-start gap-6">
              <Panel title="Lead sources" description="Where this period's leads came from">
                <Sources sources={a.sources} />
              </Panel>
              <Panel title="By product">
                <Bars items={a.byType.slice(0, 8)} hrefFor={(t) => leadsHref({ type: t.type, ...inRange })} />
              </Panel>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeeDay() {
  const { config, staff } = useAdmin();
  const { data, error, loading, reload } = useAdminData("admin/overview");
  const o = data?.data;
  const level = config.personas?.find((p) => p.id === staff.persona)?.level;
  const pool = stageLabel(config, level) || "your level";

  const summary = o
    ? `${o.totals.active} active ${o.totals.active === 1 ? "lead" : "leads"}${o.totals.unassigned ? `, ${o.totals.unassigned} waiting to be picked up` : ""}.`
    : null;

  return (
    <>
      <Header title="My day" summary={summary} />
      <Loading error={error} reload={reload} loading={loading && !o} />

      {o && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="My active leads" value={o.totals.active} hint="New, contacted or in progress" href={leadsHref({ scope: "mine" })} />
            <Kpi label="Ready to pick up" value={o.totals.unassigned} hint={`Open leads in the ${pool} pool`} href={leadsHref({ scope: "unassigned" })} />
            <Kpi label="Converted" value={o.totals.won} hint="Leads you closed as won" href={leadsHref({ scope: "mine", status: "won" })} />
            <Kpi label="Last 7 days" value={o.totals.last7} hint={`${o.totals.leads} assigned to you in total`} href={leadsHref({ scope: "mine" })} />
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <Panel title="Pick up next" description={`Newest open leads in the ${pool} pool. Acting on one makes it yours.`} className="xl:col-span-2" bodyClassName="p-0" actions={viewAll(leadsHref({ scope: "unassigned" }), "See all")}>
              <LeadRows leads={o.pool} empty={{ title: "Nothing waiting", body: "Every open lead at your level has an advisor. New ones will show up here." }} />
            </Panel>
            <Panel title="My pipeline">
              <Pipeline counts={o.statusCounts} query={{ scope: "mine" }} />
            </Panel>
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <Panel title="My latest leads" className="xl:col-span-2" bodyClassName="p-0" actions={viewAll(leadsHref({ scope: "mine" }))}>
              <LeadRows leads={o.recent} empty={{ title: "No leads yet", body: "Pick one up from the list above to get started." }} />
            </Panel>
            <Panel title="My leads, last 30 days">
              <DailyChart days={o.daily} />
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

function SalesDay() {
  const { data, error, loading, reload } = useAdminData("admin/overview");
  const o = data?.data;
  const waiting = o ? o.stageCounts.l1.waiting + o.stageCounts.l2.waiting : 0;
  const tone = o ? rejectionTone(o.totals.rejection, o.totals.leads) : "none";

  const summary = o
    ? `${o.totals.active} open ${o.totals.active === 1 ? "lead" : "leads"} you added${waiting ? `, ${waiting} waiting to be picked up` : ""}.${
        tone === "bad" ? " Most of your leads are being rejected: check they fit before adding them." : ""
      }`
    : null;

  return (
    <>
      <Header title="My dashboard" summary={summary} />
      <Loading error={error} reload={reload} loading={loading && !o} />

      {o && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Kpi label="With Operations L1" value={o.stageCounts.l1.open} hint={`${o.stageCounts.l1.waiting} not picked up yet`} href={leadsHref({ scope: "mine", stage: "l1" })} />
            <Kpi label="With Operations L2" value={o.stageCounts.l2.open} hint={`${o.stageCounts.l2.waiting} not picked up yet`} href={leadsHref({ scope: "mine", stage: "l2" })} />
            <Kpi label="Converted" value={o.totals.won} hint={`Of ${o.totals.leads} leads you added`} href={leadsHref({ scope: "mine", status: "won" })} />
            <Kpi
              label="Rejected"
              value={pct(o.totals.rejection)}
              valueClassName={TONES[tone].text}
              hint={tone === "none" && o.totals.leads < 5 ? "Too early to tell" : `${o.totals.lost} of ${o.totals.leads} leads you added`}
              href={leadsHref({ scope: "mine", status: "lost" })}
            />
            <Kpi label="Last 7 days" value={o.totals.last7} hint="Leads you added" href={leadsHref({ scope: "mine" })} />
          </div>
          {o.target && <MyTarget t={o.target} />}
          <div className="grid gap-6 xl:grid-cols-3">
            <Panel
              title="My latest leads"
              description="Level and advisor working each one"
              className="xl:col-span-2"
              bodyClassName="p-0"
              actions={viewAll(leadsHref({ scope: "mine" }))}
            >
              <LeadRows leads={o.recent} showStage empty={{ title: "No leads yet", body: "Add your first lead to see it here." }} />
            </Panel>
            <Panel title="My pipeline">
              <Pipeline counts={o.statusCounts} query={{ scope: "mine" }} dots={SALES_DOTS} />
            </Panel>
          </div>
          <Panel title="Leads I added, last 30 days" description="Each day's leads by what happened to them">
            <DailyChart days={o.daily} stacked />
          </Panel>
        </div>
      )}
    </>
  );
}

function Dashboard() {
  const { isAdmin, isSales } = useAdmin();
  return isAdmin ? <AdminOverview /> : isSales ? <SalesDay /> : <EmployeeDay />;
}

export default function DashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <Dashboard />
    </AdminShell>
  );
}
