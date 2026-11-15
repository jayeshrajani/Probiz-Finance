"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FloppyDisk, SpinnerGap } from "@phosphor-icons/react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminOnly, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/ui/input";
import { adminFetch, formatDateTime, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const field = cn(fieldBase, "h-10 text-sm");

const CONTACT = [
  { key: "primaryPhone", label: "Primary phone number", type: "tel", hint: "Shown first on the website and used for every call button.", required: true },
  { key: "secondaryPhone", label: "Secondary phone number", type: "tel", hint: "Shown after the primary number in the footer and on the contact page. Leave empty to hide." },
  { key: "whatsappPhone", label: "WhatsApp number", type: "tel", hint: "A mobile number. Used by the WhatsApp button. Leave empty to hide the button." },
  { key: "contactEmail", label: "Contact email", type: "email", hint: "Shown in the footer, contact, careers and password-help pages.", required: true },
];
const SOCIAL = [
  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://www.linkedin.com/company/…" },
  { key: "youtube", label: "YouTube URL", placeholder: "https://www.youtube.com/@…" },
  { key: "instagram", label: "Instagram URL", placeholder: "https://www.instagram.com/…" },
  { key: "facebook", label: "Facebook URL", placeholder: "https://www.facebook.com/…" },
];

const toForm = (d) => ({
  primaryPhone: d.primaryPhone || "",
  secondaryPhone: d.secondaryPhone || "",
  whatsappPhone: d.whatsappPhone || "",
  contactEmail: d.contactEmail || "",
  social: Object.fromEntries(SOCIAL.map(({ key }) => [key, d.social?.[key] || ""])),
});

function Field({ id, label, hint, error, ...props }) {
  const note = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} className={cn(field, error && "border-destructive")} aria-invalid={error ? true : undefined} aria-describedby={note} {...props} />
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

function SettingsForm() {
  const { data, error, reload } = useAdminData("admin/site-settings");
  const saved = data?.data;
  const [v, setV] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (saved) setV(toForm(saved));
  }, [saved]);

  if (error && !saved) return <ErrorNote error={error} onRetry={reload} />;
  if (!v) {
    return (
      <Panel bodyClassName="p-0">
        <LoadingRows rows={4} />
      </Panel>
    );
  }

  const set = (key) => (e) => setV({ ...v, [key]: e.target.value });
  const setSocial = (key) => (e) => setV({ ...v, social: { ...v.social, [key]: e.target.value } });

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    try {
      await adminFetch("admin/site-settings", { method: "PUT", body: v });
      toast.success("Website settings saved. The public website shows them within about 5 minutes.");
      await reload();
    } catch (err) {
      setErrors(err.data?.fields || {});
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <Panel title="Contact information" description="Phone numbers accept +91, spaces and dashes; they are stored as 10 digits.">
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT.map(({ key, label, type, hint, required }) => (
            <Field
              key={key}
              id={`site-${key}`}
              label={label}
              type={type}
              hint={hint}
              required={required}
              value={v[key]}
              onChange={set(key)}
              error={errors[key]}
              autoComplete="off"
              inputMode={type === "tel" ? "tel" : undefined}
            />
          ))}
        </div>
      </Panel>
      <Panel title="Social media" description="Each link must be an https:// address on the platform's own site. Leave a link empty to hide its icon.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL.map(({ key, label, placeholder }) => (
            <Field
              key={key}
              id={`site-social-${key}`}
              label={label}
              type="url"
              placeholder={placeholder}
              value={v.social[key]}
              onChange={setSocial(key)}
              error={errors[`social.${key}`]}
              autoComplete="off"
              inputMode="url"
            />
          ))}
        </div>
      </Panel>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy} aria-busy={busy}>
          {busy ? <SpinnerGap className="animate-spin" /> : <FloppyDisk />} {busy ? "Saving…" : "Save changes"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {saved.saved && saved.updatedAt ? (
            <>
              Last updated <time dateTime={saved.updatedAt} title={formatDateTime(saved.updatedAt)}>{timeAgo(saved.updatedAt)}</time>
              {saved.updatedByName ? ` by ${saved.updatedByName}` : ""}.
            </>
          ) : (
            "Not saved yet: showing the initial values."
          )}
        </p>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  return (
    <AdminShell title="Site Settings">
      <div className="mb-6">
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">Site Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact details and social links shown on the public website. Changes appear without a redeploy.</p>
      </div>
      <AdminOnly body="Website settings can only be changed by admins.">
        <div className="max-w-3xl">
          <SettingsForm />
        </div>
      </AdminOnly>
    </AdminShell>
  );
}
