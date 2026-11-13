"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowSquareOut, EnvelopeSimple, FileText, Phone, SpinnerGap, Trash, WhatsappLogo } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, ErrorNote, LoadingRows, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { adminFetch, formatDateTime, STATUS_META, timeAgo, useAdminData } from "@/lib/admin-api";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const isFile = (v) => typeof v === "string" && (/^https?:\/\//i.test(v) || v.startsWith("/uploads/"));
const isImage = (v) => /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(v);
const MONEY = /amount|income|salary|value|budget|price|emi/i;
const DATE = /date|At$/;

const humanize = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ") : null;
  if (typeof value === "object") return JSON.stringify(value);
  if (MONEY.test(key) && Number.isFinite(Number(value)) && Number(value) > 0) return formatINR(Number(value));
  if (DATE.test(key) && !Number.isNaN(Date.parse(value))) return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return String(value);
}

function splitFields(fields) {
  const details = [];
  const files = [];
  for (const [key, value] of Object.entries(fields)) {
    if (key === "createdAt" || key === "updatedAt") continue;
    // Some forms store uploads as { fieldName: url } instead of top-level fields.
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [sub, url] of Object.entries(value)) if (isFile(url)) files.push({ key: `${key}.${sub}`, label: humanize(sub), url });
      continue;
    }
    const list = Array.isArray(value) ? value : [value];
    if (list.length && list.every(isFile)) {
      list.forEach((url, i) => files.push({ key, label: humanize(key) + (list.length > 1 ? ` ${i + 1}` : ""), url }));
      continue;
    }
    const shown = formatValue(key, value);
    if (shown !== null) details.push({ key, label: humanize(key), value: shown });
  }
  return { details, files };
}

function Notes({ type, id, notes, onChange }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await adminFetch(`admin/leads/${type}/${id}`, { method: "PATCH", body: { note: text } });
      onChange(res.data);
      setText("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel title="Activity" description="Notes and status changes, newest first">
      <form onSubmit={add} className="grid gap-2">
        <label htmlFor="note" className="sr-only">
          Add a note
        </label>
        <textarea
          id="note"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Called, asked for bank statements..."
          className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/20"
        />
        <Button type="submit" size="sm" className="justify-self-end" disabled={busy || !text.trim()}>
          {busy && <SpinnerGap className="animate-spin" />} Add note
        </Button>
      </form>
      <ol className="mt-6 grid gap-0">
        <AnimatePresence initial={false}>
          {notes.map((n) => (
            <motion.li
              key={`${n.at}-${n.text}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border-l border-border pb-5 pl-5 last:pb-0"
            >
              <span className={cn("absolute top-1 -left-[5px] size-2.5 rounded-full ring-4 ring-background", n.text.startsWith("Status changed") ? "bg-muted-foreground/50" : "bg-brand")} />
              <p className={cn("text-sm leading-relaxed", n.text.startsWith("Status changed") && "text-muted-foreground")}>{n.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {n.by} · {timeAgo(n.at)}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
        {notes.length === 0 && <li className="text-sm text-muted-foreground">No activity yet. Add the first note after you call.</li>}
      </ol>
    </Panel>
  );
}

function LeadDetail() {
  const router = useRouter();
  const { config, refreshCounts } = useAdmin();
  const { type, id } = router.query;
  const { data, error, loading, reload } = useAdminData(router.isReady ? `admin/leads/${type}/${id}` : null);
  const [override, setOverride] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading || !data) return <LoadingRows rows={8} />;

  const { lead, fields } = data.data;
  const status = override?.status ?? lead.status;
  const notes = override?.notes ?? data.data.notes;
  const { details, files } = splitFields(fields);
  const phone = lead.phone ? String(lead.phone).replace(/\D/g, "").slice(-10) : null;

  async function setStatus(next) {
    if (next === status) return;
    setSaving(true);
    try {
      const res = await adminFetch(`admin/leads/${type}/${id}`, { method: "PATCH", body: { status: next } });
      setOverride(res.data);
      refreshCounts();
      toast.success(`Marked as ${STATUS_META[next].label.toLowerCase()}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await adminFetch(`admin/leads/${type}/${id}`, { method: "DELETE" });
      refreshCounts();
      toast.success("Lead deleted");
      router.replace(`/admin-panel/leads?type=${type}`);
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  return (
    <>
      <Link href={`/admin-panel/leads?type=${type}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft weight="bold" className="size-3.5" /> {lead.typeLabel}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft font-display text-xl font-semibold text-brand-ink">{lead.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">{lead.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {lead.typeLabel} · received {formatDateTime(lead.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {phone && (
            <>
              <Button asChild size="sm">
                <a href={`tel:+91${phone}`}>
                  <Phone weight="fill" /> Call
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer">
                  <WhatsappLogo weight="fill" /> WhatsApp
                </a>
              </Button>
            </>
          )}
          {lead.email && (
            <Button asChild size="sm" variant="outline">
              <a href={`mailto:${lead.email}`}>
                <EnvelopeSimple /> Email
              </a>
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirm(true)}>
            <Trash /> Delete
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-background p-2">
        <div role="radiogroup" aria-label="Lead status" className="grid grid-cols-2 gap-1 sm:grid-cols-5">
          {config.statuses.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={status === s}
              disabled={saving}
              onClick={() => setStatus(s)}
              className={cn(
                "relative h-10 rounded-xl text-sm font-medium transition-colors disabled:cursor-wait",
                status === s ? "text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {status === s && <motion.span layoutId="status-pill" className="absolute inset-0 rounded-xl bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{STATUS_META[s].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="grid content-start gap-6 xl:col-span-2">
          <Panel title="Application details" actions={<StatusBadge status={status} />}>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.key} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{d.label}</dt>
                  <dd className="mt-1 text-sm font-medium break-words">{d.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Documents" description={files.length ? `${files.length} uploaded` : "Nothing uploaded with this application"}>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ask the customer to share documents on WhatsApp or email if you need them.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((f) => (
                  <li key={f.url}>
                    <a href={f.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20">
                      <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-secondary">
                        {isImage(f.url) ? (
                          <img src={f.url} alt={f.label} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        ) : (
                          <FileText weight="duotone" className="size-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                        <span className="truncate font-medium">{f.label}</span>
                        <ArrowSquareOut className="size-3.5 shrink-0 text-muted-foreground" />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Notes type={type} id={id} notes={notes} onChange={setOverride} />
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Delete this lead?"
        body={`${lead.name}'s ${lead.typeLabel.toLowerCase()} application and its notes will be removed for good.`}
        busy={deleting}
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}

export default function LeadDetailPage() {
  return (
    <AdminShell>
      <LeadDetail />
    </AdminShell>
  );
}
