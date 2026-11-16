"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { PageHeader, Panel } from "@/components/admin/ui";
import FileSlot, { formatBytes } from "@/components/forms/FileSlot";
import FormField from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { adminFetch } from "@/lib/admin-api";
import { forms } from "@/lib/forms";
import { CONSENT_VERSION, isEmpty, validateLead, visible } from "@/lib/lead-schema";
import { cn } from "@/lib/utils";

// Hosting (Vercel) rejects request bodies above 4.5 MB.
const MAX_UPLOAD = 4.4 * 1024 * 1024;
const SOURCES = ["Phone call", "Walk-in", "WhatsApp", "Referral", "Other"];
const CONSENT = "The customer agreed to Probiz contacting them by call, SMS, WhatsApp or email about this request.";

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}

function NewLead() {
  const router = useRouter();
  const { config, isAdmin, staff, refreshCounts } = useAdmin();
  const idPrefix = useId().replace(/:/g, "");
  const types = config.types.filter((t) => t.formKey && forms[t.formKey]);

  const [type, setType] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [assignTo, setAssignTo] = useState("");
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [merged, setMerged] = useState(null);

  useEffect(() => {
    if (router.isReady && !type && types.some((t) => t.type === router.query.type)) setType(router.query.type);
  }, [router.isReady]);

  const def = types.find((t) => t.type === type);
  const form = def ? forms[def.formKey] : null;
  const slots = form ? visible(form.files, values) : [];
  const uploadBytes = slots.reduce((sum, s) => sum + (files[s.name]?.size || 0), 0);
  const tooLarge = uploadBytes > MAX_UPLOAD;

  const pickType = (next) => {
    setType(next);
    setValues({});
    setFiles({});
    setErrors({});
    setError(null);
  };
  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: null } : e));
  };

  async function submit(e) {
    e.preventDefault();
    if (!form || busy || tooLarge) return;
    const found = validateLead(def.formKey, values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`${idPrefix}-${first}`)?.focus();
    if (!consent) return setError("Confirm the customer agreed to be contacted.");

    const payload = {};
    for (const step of form.steps) {
      for (const field of visible(step.fields, values)) {
        if (!isEmpty(values[field.name])) payload[field.name] = String(values[field.name]).trim();
      }
    }
    const meta = { topic: source, consent: { accepted: true, version: CONSENT_VERSION, text: CONSENT } };
    let body;
    if (form.json) {
      body = { ...payload, _meta: meta, _assignTo: assignTo };
    } else {
      body = new FormData();
      Object.entries(payload).forEach(([k, v]) => body.append(k, v));
      body.append("_meta", JSON.stringify(meta));
      body.append("_assignTo", assignTo);
      slots.forEach((slot) => files[slot.name] && body.append(slot.name, files[slot.name]));
    }

    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(`admin/leads/${def.formKey}`, { method: "POST", body });
      refreshCounts();
      const visibleToMe = isAdmin || !res.assignedTo || res.assignedTo === staff.id;
      if (res.leadId && visibleToMe) return router.push(`/admin-panel/leads/${res.type}/${res.leadId}`);
      setMerged(res);
    } catch (err) {
      if (err.data?.fields) setErrors(err.data.fields);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (merged) {
    return (
      <Panel title="Added to an existing lead">
        <p className="text-sm text-muted-foreground">
          {merged.repeat
            ? `This customer already has an open ${def?.label.toLowerCase() || ""} lead with ${merged.assignedName || "another advisor"}, so your entry was added to it.`
            : "The lead was saved."}
        </p>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin-panel/leads?scope=mine">My leads</Link>
          </Button>
          <Button size="sm" onClick={() => { setMerged(null); pickType(""); setConsent(false); }}>
            Add another
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid max-w-3xl gap-4">
      <Panel title="Lead">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid content-start gap-2 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-type`}>Product</Label>
            <NativeSelect id={`${idPrefix}-type`} value={type} onChange={(e) => pickType(e.target.value)}>
              <option value="" disabled>
                Select
              </option>
              {config.groups.map((g) => {
                const list = types.filter((t) => t.group === g.id);
                return list.length ? (
                  <optgroup key={g.id} label={g.label}>
                    {list.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null;
              })}
            </NativeSelect>
          </div>
          <div className="grid content-start gap-2">
            <Label htmlFor={`${idPrefix}-source`}>How it came in</Label>
            <NativeSelect id={`${idPrefix}-source`} value={source} onChange={(e) => setSource(e.target.value)}>
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid content-start gap-2">
            <Label htmlFor={`${idPrefix}-assign`}>Advisor</Label>
            {isAdmin ? (
              <NativeSelect id={`${idPrefix}-assign`} value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                <option value="">Unassigned</option>
                {config.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <p id={`${idPrefix}-assign`} className="flex h-12 items-center text-sm text-muted-foreground">
                Assigned to you
              </p>
            )}
          </div>
        </div>
      </Panel>

      {form?.steps.map((step) => (
        <Panel key={step.id} title={step.title}>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {visible(step.fields, values).map((field) => (
              <FormField key={field.name} field={field} value={values[field.name]} error={errors[field.name]} onChange={setValue} idPrefix={idPrefix} />
            ))}
          </div>
        </Panel>
      ))}

      {slots.length > 0 && (
        <Panel title="Documents" description="Optional. PDF, JPG or PNG, up to 5 MB each.">
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <FileSlot key={slot.name} slot={slot} file={files[slot.name]} onChange={(name, file) => setFiles((f) => ({ ...f, [name]: file }))} idPrefix={idPrefix} />
            ))}
          </div>
          <p className={cn("mt-4 text-xs", tooLarge ? "font-medium text-destructive" : "text-muted-foreground")}>
            {tooLarge ? `Total ${formatBytes(uploadBytes)} is over the 4.4 MB limit. Remove a file.` : `${uploadBytes ? formatBytes(uploadBytes) : "0 KB"} of 4.4 MB`}
          </p>
        </Panel>
      )}

      {form && (
        <Panel>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setError(null);
              }}
              className="mt-1 size-4 shrink-0 accent-[var(--brand)]"
            />
            <span>{CONSENT}</span>
          </label>
          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <WarningCircle weight="fill" className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin-panel/leads">Cancel</Link>
            </Button>
            <Button type="submit" disabled={busy || tooLarge}>
              {busy ? (
                <>
                  <SpinnerGap className="animate-spin" /> Saving
                </>
              ) : (
                "Add lead"
              )}
            </Button>
          </div>
        </Panel>
      )}
    </form>
  );
}

export default function NewLeadPage() {
  return (
    <AdminShell title="Add a lead">
      <PageHeader title="Add a lead" description="For customers who called, walked in or were referred. The same checks as the website form apply." />
      <NewLead />
    </AdminShell>
  );
}
