"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Archive, ArrowCounterClockwise, ArrowLeft, ArrowSquareOut, EnvelopeSimple, FileText, HandGrabbing, Phone, SpinnerGap, Trash, WhatsappLogo } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch, formatDateTime, STATUS_META, timeAgo, useAdminData } from "@/lib/admin-api";
import { formatINR } from "@/lib/format";
import { forms } from "@/lib/forms";
import { cn } from "@/lib/utils";

const isFile = (v) => typeof v === "string" && (/^https?:\/\//i.test(v) || v.startsWith("/uploads/") || v.startsWith("/api/files/"));
const isImage = (v) => /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(v);
const isPdf = (v) => /\.pdf(\?|#|$)/i.test(v);
const extOf = (v) => (String(v).split(/[?#]/)[0].split(".").pop() || "").toUpperCase();

// A small look at the actual document: the image itself, or page one of a PDF.
function DocThumb({ url, label }) {
  if (isImage(url)) return <img src={url} alt={label} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />;
  if (isPdf(url)) {
    return (
      <div className="relative size-full overflow-hidden bg-white">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          title={label}
          loading="lazy"
          tabIndex={-1}
          className="pointer-events-none absolute top-0 left-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0"
        />
      </div>
    );
  }
  return <FileText weight="duotone" className="size-10 text-muted-foreground" />;
}
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

// Labels as the customer saw them on the form, falling back to the stored field name.
function labelsFor(formKey) {
  const config = forms[formKey];
  if (!config) return {};
  const fields = config.steps.flatMap((s) => s.fields);
  return Object.fromEntries([...fields, ...(config.files || [])].map((f) => [f.name, f.label]));
}

function splitFields(fields, labels = {}) {
  const label = (key) => labels[key] || humanize(key);
  const details = [];
  const files = [];
  for (const [key, value] of Object.entries(fields)) {
    if (key === "createdAt" || key === "updatedAt") continue;
    // Some forms store uploads as { fieldName: url } instead of top-level fields.
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [sub, url] of Object.entries(value)) if (isFile(url)) files.push({ key: `${key}.${sub}`, label: label(sub), url });
      continue;
    }
    const list = Array.isArray(value) ? value : [value];
    if (list.length && list.every(isFile)) {
      list.forEach((url, i) => files.push({ key, label: label(key) + (list.length > 1 ? ` ${i + 1}` : ""), url }));
      continue;
    }
    const shown = formatValue(key, value);
    if (shown !== null) details.push({ key, label: label(key), value: shown });
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
        <Textarea
          id="note"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Called, asked for bank statements..."
          className="min-h-20 resize-none text-sm"
        />
        <Button type="submit" size="sm" className="justify-self-end" disabled={busy || !text.trim()}>
          {busy && <SpinnerGap className="animate-spin" />} Add note
        </Button>
      </form>
      <ol className="mt-6 grid gap-0">
        <AnimatePresence initial={false}>
          {notes.map((n) => (
            <motion.li
              key={n.id || `${n.at}-${n.text}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border-l border-border pb-5 pl-5 last:pb-0"
            >
              <span
                className={cn(
                  "absolute top-1 -left-[5px] size-2.5 rounded-full ring-4 ring-background",
                  STATUS_META[n.status]?.dot || (n.kind === "system" ? "bg-muted-foreground/40" : "bg-foreground")
                )}
              />
              <p className={cn("text-sm leading-relaxed", n.kind === "system" && "text-muted-foreground")}>
                {n.status && STATUS_META[n.status] ? (
                  <>
                    Status changed to{" "}
                    <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset", STATUS_META[n.status].soft)}>{STATUS_META[n.status].label}</span>
                  </>
                ) : (
                  n.text
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {n.by}, {timeAgo(n.at)}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
        {notes.length === 0 && <li className="text-sm text-muted-foreground">No activity yet. Add the first note after you call.</li>}
      </ol>
    </Panel>
  );
}

const CHANNEL_LABEL = {
  web_form: "Website form",
  assistant: "Website assistant",
  staff: "Added by staff",
  legacy_api: "Older form",
  legacy_import: "Imported",
};

function Origin({ lead, customer }) {
  const src = lead.source || {};
  const utm = Object.entries(src.utm || {}).map(([k, v]) => `${k}: ${v}`);
  const rows = [
    ["Channel", CHANNEL_LABEL[src.channel] || "Unknown"],
    ["Added by", src.addedBy?.name ? `${src.addedBy.name}${src.addedBy.role ? ` (${src.addedBy.role})` : ""}` : null],
    ["Topic", src.topic],
    ["Submitted on", src.page],
    ["First page", src.landingPage],
    ["Referrer", src.referrer],
    ["Campaign", utm.join(", ") || null],
    ["Device", src.device],
    ["Consent", lead.consent?.accepted ? `Given ${formatDateTime(lead.consent.at)}` : "Not recorded"],
    ["Account", customer ? `${customer.name || "Signed-in customer"}${customer.email ? ` (${customer.email})` : ""}` : "Not signed in"],
  ].filter(([, v]) => v);
  return (
    <Panel title="Where it came from">
      <dl className="grid gap-3">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function LeadDetail() {
  const router = useRouter();
  const { config, refreshCounts, isAdmin, staff } = useAdmin();
  const { type, id } = router.query;
  const { data, error, loading, reload } = useAdminData(router.isReady ? `admin/leads/${type}/${id}` : null);
  const [override, setOverride] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shown, setShown] = useState(0);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading || !data) return <LoadingRows rows={8} />;

  const { lead, customer } = data.data;
  const submissions = data.data.submissions?.length ? data.data.submissions : [{ id: "current", createdAt: lead.createdAt, fields: data.data.fields }];
  const fields = (submissions[shown] || submissions[0]).fields;
  const current = override || data.data;
  const { status, notes, assignedTo, assignedName, archived } = current;
  const canEdit = isAdmin || !assignedTo || assignedTo === staff.id;
  const { details, files } = splitFields(fields, labelsFor(config.types.find((t) => t.type === type)?.formKey));
  const phone = lead.phone ? String(lead.phone).replace(/\D/g, "").slice(-10) : null;

  async function patch(body, message) {
    setSaving(true);
    try {
      const res = await adminFetch(`admin/leads/${type}/${id}`, { method: "PATCH", body });
      setOverride(res.data);
      refreshCounts();
      toast.success(message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const setStatus = (next) => next !== status && patch({ status: next }, `Marked as ${STATUS_META[next].label.toLowerCase()}`);

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
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.typeLabel}, received {formatDateTime(lead.createdAt)}
            {lead.repeatCount > 0 && `. Sent ${lead.repeatCount + 1} times, last ${timeAgo(lead.lastActivityAt)}`}
          </p>
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
          {isAdmin && (
            <Button size="sm" variant="outline" disabled={saving} onClick={() => patch({ archive: !archived }, archived ? "Lead restored" : "Lead archived")}>
              {archived ? (
                <>
                  <ArrowCounterClockwise /> Restore
                </>
              ) : (
                <>
                  <Archive /> Archive
                </>
              )}
            </Button>
          )}
          {isAdmin && (
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirm(true)}>
              <Trash /> Delete
            </Button>
          )}
        </div>
      </div>

      {archived && (
        <Card className="mb-4 flex-row items-center gap-3 border-dashed bg-secondary/60 px-4 py-3 text-sm">
          <Archive className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-muted-foreground">This lead is archived. It is hidden from lead lists, counts and advisors until you restore it.</span>
        </Card>
      )}

      <Card className="mb-4 flex-row flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm">
          {assignedName ? (
            <>
              <span className="text-muted-foreground">Advisor: </span>
              <span className="font-medium">{assignedTo === staff.id ? `${assignedName} (you)` : assignedName}</span>
            </>
          ) : (
            <span className="text-muted-foreground">No advisor yet.</span>
          )}
        </p>
        {isAdmin ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground" id="assign-label">
              Assign to
            </span>
            <Select
              value={assignedTo || "none"}
              disabled={saving}
              onValueChange={(v) => {
                const who = config.employees.find((x) => x.id === v);
                patch({ assignTo: who ? who.id : null }, who ? `Assigned to ${who.name}` : "Moved to unassigned");
              }}
            >
              <SelectTrigger aria-labelledby="assign-label" className="min-w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="none">Unassigned</SelectItem>
                {config.employees.length > 0 && <SelectSeparator />}
                {config.employees.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                  </SelectItem>
                ))}
                {assignedTo && !config.employees.some((x) => x.id === assignedTo) && <SelectItem value={assignedTo}>{assignedName} (removed)</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        ) : (
          !assignedTo && (
            <Button size="sm" disabled={saving} onClick={() => patch({ claim: true }, "This lead is yours now")}>
              <HandGrabbing weight="bold" /> Pick up this lead
            </Button>
          )
        )}
      </Card>

      <div role="radiogroup" aria-label="Lead status" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-5">
        {config.statuses.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={status === s}
            disabled={saving || !canEdit}
            onClick={() => setStatus(s)}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-brand/25 focus-visible:outline-none disabled:cursor-not-allowed",
              status === s ? cn("shadow-sm ring-1 ring-inset", STATUS_META[s].soft) : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
          >
            <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", STATUS_META[s].dot, status !== s && "opacity-60")} />
            {STATUS_META[s].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="grid content-start gap-6 xl:col-span-2">
          <Panel title="Application details">
            {submissions.length > 1 && (
              <Tabs value={String(shown)} onValueChange={(v) => setShown(Number(v))} className="mb-6">
                <TabsList aria-label="Submissions" className="h-auto flex-wrap">
                  {submissions.map((s, i) => (
                    <TabsTrigger key={s.id} value={String(i)} className="px-3">
                      {i === 0 ? "Latest" : `Earlier ${i}`}, {formatDateTime(s.createdAt)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
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
                      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-secondary">
                        <DocThumb url={f.url} label={f.label} />
                        {extOf(f.url) && (
                          <span className="absolute bottom-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wide text-muted-foreground shadow-sm">{extOf(f.url)}</span>
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
          <Origin lead={lead} customer={customer} />
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
