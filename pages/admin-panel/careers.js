"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilSimple, Plus, SpinnerGap, Trash } from "@phosphor-icons/react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminOnly, ConfirmDialog, Empty, ErrorNote, LoadingRows, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fieldBase } from "@/components/ui/input";
import { adminFetch, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const field = cn(fieldBase, "h-10 text-sm");
const area = cn(fieldBase, "min-h-24 py-2.5 text-sm leading-relaxed");
const TEAMS = ["Sales", "Marketing", "Operations", "Credit", "Technology", "HR"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const EMPTY = {
  jobId: "",
  title: "",
  team: "",
  location: "",
  employmentType: "Full-time",
  experience: "",
  vacancies: "",
  ctc: "",
  overview: "",
  responsibilities: "",
  idealCandidate: "",
  status: "open",
};

const toForm = (job) => ({
  ...EMPTY,
  ...job,
  responsibilities: (job.responsibilities || []).join("\n"),
  idealCandidate: (job.idealCandidate || []).join("\n"),
});

const toBody = (v) => ({
  ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, v[k]])),
  responsibilities: v.responsibilities.split("\n"),
  idealCandidate: v.idealCandidate.split("\n"),
});

function Field({ id, label, hint, error, as = "input", className, ...props }) {
  const Tag = as;
  const note = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Tag
        id={id}
        className={cn(as === "textarea" ? area : field, error && "border-destructive")}
        aria-invalid={error ? true : undefined}
        aria-describedby={note}
        {...props}
      />
      {error ? (
        <p id={note} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={note} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function JobDialog({ job, onClose, onSaved }) {
  const editing = Boolean(job?.id);
  const [v, setV] = useState(() => toForm(job || {}));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setV({ ...v, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    try {
      const res = await adminFetch(editing ? `admin/jobs/${encodeURIComponent(job.id)}` : "admin/jobs", { method: editing ? "PUT" : "POST", body: toBody(v) });
      toast.success(`${res.message} The careers page shows it within a minute.`);
      onSaved();
    } catch (err) {
      setErrors(err.data?.fields || {});
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${job.jobId}` : "Add a job"}</DialogTitle>
          <DialogDescription>Open jobs appear on the public careers page. Applicants email their CV with the job ID in the subject.</DialogDescription>
        </DialogHeader>
        <form id="job-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field id="job-jobId" label="Job ID" required value={v.jobId} onChange={set("jobId")} error={errors.jobId} placeholder="PF-MKT-203" hint="Letters, numbers and dashes. Must be unique." autoComplete="off" />
          <Field id="job-team" label="Team" required value={v.team} onChange={set("team")} error={errors.team} list="job-teams" placeholder="Marketing" autoComplete="off" />
          <datalist id="job-teams">
            {TEAMS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <Field id="job-title" label="Job title" required value={v.title} onChange={set("title")} error={errors.title} className="sm:col-span-2" autoComplete="off" />
          <Field id="job-location" label="Location" value={v.location} onChange={set("location")} error={errors.location} placeholder="Indore head office" autoComplete="off" />
          <Field id="job-type" label="Employment type" as="select" value={v.employmentType} onChange={set("employmentType")} error={errors.employmentType}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Field>
          <Field id="job-experience" label="Experience" value={v.experience} onChange={set("experience")} error={errors.experience} placeholder="1-3 years" autoComplete="off" />
          <Field id="job-vacancies" label="Vacancies" value={v.vacancies} onChange={set("vacancies")} error={errors.vacancies} placeholder="2" autoComplete="off" />
          <Field id="job-ctc" label="Pay (CTC)" value={v.ctc} onChange={set("ctc")} error={errors.ctc} placeholder="₹2.4 LPA - ₹4 LPA + Bonus" className="sm:col-span-2" autoComplete="off" />
          <Field id="job-overview" label="Overview" as="textarea" required value={v.overview} onChange={set("overview")} error={errors.overview} className="sm:col-span-2" />
          <Field id="job-responsibilities" label="What you'll do" as="textarea" value={v.responsibilities} onChange={set("responsibilities")} error={errors.responsibilities} hint="One point per line." className="sm:col-span-2" />
          <Field id="job-ideal" label="Who we're looking for" as="textarea" value={v.idealCandidate} onChange={set("idealCandidate")} error={errors.idealCandidate} hint="One point per line." className="sm:col-span-2" />
          <Field id="job-status" label="Status" as="select" value={v.status} onChange={set("status")} error={errors.status} hint="Closed jobs stay here but are hidden from the website.">
            <option value="open">Open: shown on the website</option>
            <option value="closed">Closed: hidden</option>
          </Field>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="job-form" disabled={busy} aria-busy={busy}>
            {busy && <SpinnerGap className="animate-spin" />} {editing ? "Save job" : "Add job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Jobs() {
  const { data, error, loading, reload } = useAdminData("admin/jobs");
  const [editing, setEditing] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const rows = data?.data || [];
  const open = rows.filter((r) => r.status === "open").length;

  async function remove() {
    setBusy(true);
    try {
      await adminFetch(`admin/jobs/${encodeURIComponent(target.id)}`, { method: "DELETE" });
      toast.success(`${target.jobId} deleted`);
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Careers" description={`${open} open of ${rows.length} jobs. Open jobs are listed on the public careers page.`}>
        <Button size="sm" onClick={() => setEditing({})}>
          <Plus /> Add job
        </Button>
      </PageHeader>
      <ErrorNote error={error} onRetry={reload} />
      <Panel bodyClassName="p-0">
        {loading && !data ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <Empty title="No jobs yet" body="Add a job and it appears on the careers page." action={<Button size="sm" onClick={() => setEditing({})}><Plus /> Add job</Button>} />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{r.jobId}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{[r.team, r.location, r.updatedAt && `updated ${timeAgo(r.updatedAt)}`].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
                  <span aria-hidden className={cn("size-2 rounded-full", r.status === "open" ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                  {r.status === "open" ? "Open" : "Closed"}
                </span>
                <Button size="icon-sm" variant="ghost" aria-label={`Edit ${r.jobId}`} onClick={() => setEditing(r)}>
                  <PencilSimple />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label={`Delete ${r.jobId}`} className="text-muted-foreground hover:text-destructive" onClick={() => setTarget(r)}>
                  <Trash />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {editing && (
        <JobDialog
          job={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete ${target?.jobId}?`}
        body="The job is removed from the careers page and this list. To hide it but keep it, set its status to Closed instead."
        busy={busy}
        onConfirm={remove}
        onClose={() => setTarget(null)}
      />
    </>
  );
}

export default function CareersAdminPage() {
  return (
    <AdminShell title="Careers">
      <AdminOnly body="Job openings can only be managed by admins.">
        <Jobs />
      </AdminOnly>
    </AdminShell>
  );
}
