"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
import { Plus, SpinnerGap, WarningCircle, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { PageHeader, Panel } from "@/components/admin/ui";
import FileSlot from "@/components/forms/FileSlot";
import FormField from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetch } from "@/lib/admin-api";
import { forms } from "@/lib/forms";
import { CONSENT_VERSION, coApplicantSlots, isEmpty, validateLead, visible } from "@/lib/lead-schema";

// Each document is uploaded in its own request, and hosting (Vercel) rejects request bodies above 4.5 MB.
const MAX_FILE = 4.4 * 1024 * 1024;
const MAX_OTHERS = 20;
const SOURCES = ["Phone call", "Walk-in", "WhatsApp", "Referral", "Other"];
const CONSENT = "The customer agreed to Probiz contacting them by call, SMS, WhatsApp or email about this request.";

async function uploadDocument(file) {
  const body = new FormData();
  body.append("file", file);
  return (await adminFetch("admin/uploads", { method: "POST", body })).token;
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}

function NewLead() {
  const router = useRouter();
  const { config, isAdmin, isSales, staff, refreshCounts } = useAdmin();
  const idPrefix = useId().replace(/:/g, "");
  const types = config.types.filter((t) => t.formKey && forms[t.formKey]);
  const levelOf = (persona) => config.personas?.find((p) => p.id === persona)?.level;
  const myLevel = levelOf(staff.persona);

  const [type, setType] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [assignTo, setAssignTo] = useState("");
  const [values, setValues] = useState({});
  const [docs, setDocs] = useState({});
  const [others, setOthers] = useState([]);
  const [docsFor, setDocsFor] = useState("applicant");
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
  const coSlots = def ? coApplicantSlots(def.formKey) : [];
  const party = docsFor === "coApplicant" && coSlots.length ? "coApplicant" : "applicant";
  const otherKey = (o) => `other-${o.id}`;
  const othersFor = (p) => others.filter((o) => o.party === p);
  const attached = (p) => (p === "coApplicant" ? coSlots : slots).filter((s) => docs[s.name]).length + othersFor(p).filter((o) => docs[otherKey(o)]).length;
  const entries = [...slots, ...coSlots].map((s) => docs[s.name]).concat(others.map((o) => docs[otherKey(o)])).filter(Boolean);
  const uploading = entries.some((d) => d.status === "uploading");

  // Uploads straight away; a later pick for the same key wins over a slower earlier upload.
  async function attach(key, file) {
    if (!file) return setDocs(({ [key]: _, ...rest }) => rest);
    if (file.size > MAX_FILE) return setDocs((d) => ({ ...d, [key]: { file, status: "failed", message: "Over 4.4 MB. Compress it or split it into parts." } }));
    setDocs((d) => ({ ...d, [key]: { file, status: "uploading" } }));
    try {
      const token = await uploadDocument(file);
      setDocs((d) => (d[key]?.file === file ? { ...d, [key]: { file, token, status: "ready" } } : d));
    } catch (err) {
      setDocs((d) => (d[key]?.file === file ? { ...d, [key]: { file, status: "failed", message: err.message } } : d));
    }
  }
  const addOther = (p) => setOthers((list) => [...list, { id: Date.now() + Math.random(), party: p, label: "" }]);
  const removeOther = (o) => {
    setOthers((list) => list.filter((x) => x.id !== o.id));
    attach(otherKey(o), null);
  };

  const pickType = (next) => {
    setType(next);
    setValues({});
    setDocs({});
    setOthers([]);
    setDocsFor("applicant");
    setErrors({});
    setError(null);
  };
  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: null } : e));
  };

  async function submit(e) {
    e.preventDefault();
    if (!form || busy) return;
    const found = validateLead(def.formKey, values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`${idPrefix}-${first}`)?.focus();
    if (uploading) return setError("Wait for the documents to finish uploading.");
    if (entries.some((d) => d.status === "failed")) return setError("Remove or re-attach the documents marked in red.");
    const named = others.filter((o) => docs[otherKey(o)] || o.label.trim());
    if (named.some((o) => !o.label.trim())) return setError("Name every other document.");
    if (named.some((o) => !docs[otherKey(o)])) return setError("Attach a file to every other document you named, or remove it.");
    if (!consent) return setError("Confirm the customer agreed to be contacted.");

    const payload = {};
    for (const step of form.steps) {
      for (const field of visible(step.fields, values)) {
        if (!isEmpty(values[field.name])) payload[field.name] = String(values[field.name]).trim();
      }
    }
    const meta = { topic: source, consent: { accepted: true, version: CONSENT_VERSION, text: CONSENT } };
    const body = {
      ...payload,
      _meta: meta,
      _assignTo: assignTo,
      _uploads: Object.fromEntries([...slots, ...coSlots].filter((s) => docs[s.name]?.token).map((s) => [s.name, docs[s.name].token])),
      _others: named.map((o) => ({ party: o.party, label: o.label.trim(), token: docs[otherKey(o)].token })),
    };

    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(`admin/leads/${def.formKey}`, { method: "POST", body });
      refreshCounts();
      if (isSales) toast.success(`Lead ${res.leadRef ? `${res.leadRef} ` : ""}added. It is waiting for Operations L1.`);
      const visibleToMe = isAdmin || isSales || res.assignedTo === staff.id || (!res.assignedTo && res.stage === myLevel);
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
            ? `This customer already has an open ${def?.label.toLowerCase() || ""} lead${merged.leadRef ? ` (${merged.leadRef})` : ""} with ${merged.assignedName || "another advisor"}, so your entry was added to it.`
            : merged.leadRef ? `Lead ${merged.leadRef} was saved.` : "The lead was saved."}
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
                <option value="">Operations L1 pool</option>
                {(config.stages || []).map((s) => {
                  const list = config.employees.filter((emp) => levelOf(emp.persona) === s.id);
                  return list.length ? (
                    <optgroup key={s.id} label={s.label}>
                      {list.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </NativeSelect>
            ) : (
              <p id={`${idPrefix}-assign`} className="flex h-12 items-center text-sm text-muted-foreground">
                {isSales ? "Goes to the Operations L1 pool" : "Assigned to you"}
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

      {form && !form.json && (
        <Panel title="Documents" description="Optional. PDF, JPG or PNG, up to 4.4 MB each. Each file uploads as soon as you pick it.">
          {coSlots.length > 0 && (
            <Tabs value={party} onValueChange={setDocsFor} className="mb-4">
              <TabsList aria-label="Documents for">
                {[
                  ["applicant", "Applicant"],
                  ["coApplicant", "Co-applicant"],
                ].map(([value, label]) => (
                  <TabsTrigger key={value} value={value} className="px-3">
                    {label}
                    {attached(value) > 0 && <span className="ml-1.5 rounded-full bg-brand-soft px-1.5 text-xs font-semibold text-brand-ink">{attached(value)}</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {(party === "coApplicant" ? coSlots : slots).map((slot) => (
              <FileSlot key={slot.name} slot={slot} file={docs[slot.name]?.file} status={docs[slot.name]?.status} message={docs[slot.name]?.message} onChange={attach} idPrefix={idPrefix} />
            ))}
          </div>

          {othersFor(party).length > 0 && (
            <div className="mt-5 grid gap-3">
              <p className="text-sm font-medium">Other documents</p>
              {othersFor(party).map((o) => {
                const key = otherKey(o);
                return (
                  <div key={o.id} className="grid items-center gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={o.label}
                        maxLength={80}
                        placeholder="Document name, e.g. Rent agreement"
                        aria-label="Document name"
                        onChange={(e) => setOthers((list) => list.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)))}
                      />
                      <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${o.label || "this document"}`} onClick={() => removeOther(o)}>
                        <X weight="bold" />
                      </Button>
                    </div>
                    <FileSlot slot={{ name: key, label: "Attach file" }} file={docs[key]?.file} status={docs[key]?.status} message={docs[key]?.message} onChange={attach} idPrefix={idPrefix} />
                  </div>
                );
              })}
            </div>
          )}
          {others.length < MAX_OTHERS && (
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => addOther(party)}>
              <Plus weight="bold" /> Add another document
            </Button>
          )}
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
            <Button type="submit" disabled={busy || uploading}>
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
