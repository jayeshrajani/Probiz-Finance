"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SpinnerGap, Trash, UserPlus } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/ui/input";
import { adminFetch, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const field = cn(fieldBase, "h-10 text-sm");

function Field({ label, ...props }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input className={field} {...props} />
    </label>
  );
}

function AddAdmin({ onAdded }) {
  const [v, setV] = useState({ admin_Name: "", admin_Email: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (v.password.length < 8) return toast.error("Use a password of at least 8 characters.");
    setBusy(true);
    try {
      await adminFetch("createAdmin", { method: "POST", body: v });
      toast.success(`${v.admin_Name} can now sign in`);
      setV({ admin_Name: "", admin_Email: "", password: "" });
      onAdded();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel title="Add an admin" description="They'll sign in at /admin-panel with this email and password.">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Name" required value={v.admin_Name} onChange={(e) => setV({ ...v, admin_Name: e.target.value })} autoComplete="off" />
        <Field label="Email" type="email" required value={v.admin_Email} onChange={(e) => setV({ ...v, admin_Email: e.target.value })} autoComplete="off" />
        <Field label="Temporary password" type="password" required value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} autoComplete="new-password" />
        <Button type="submit" disabled={busy} className="justify-self-start">
          {busy ? <SpinnerGap className="animate-spin" /> : <UserPlus />} Add admin
        </Button>
      </form>
    </Panel>
  );
}

function ChangePassword() {
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (v.next !== v.confirm) return toast.error("The new passwords don't match.");
    setBusy(true);
    try {
      await adminFetch("admin/me/password", { method: "PUT", body: { current: v.current, next: v.next } });
      toast.success("Password updated");
      setV({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel title="Your password">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Current password" type="password" required value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} autoComplete="current-password" />
        <Field label="New password" type="password" required minLength={8} value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} autoComplete="new-password" />
        <Field label="Repeat new password" type="password" required value={v.confirm} onChange={(e) => setV({ ...v, confirm: e.target.value })} autoComplete="new-password" />
        <Button type="submit" variant="outline" disabled={busy} className="justify-self-start">
          {busy && <SpinnerGap className="animate-spin" />} Update password
        </Button>
      </form>
    </Panel>
  );
}

function Team() {
  const { admin } = useAdmin();
  const { data, error, loading, reload } = useAdminData("admin/admins");
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await adminFetch(`admin/admins/${target._id}`, { method: "DELETE" });
      toast.success(`${target.admin_Name} removed`);
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
      <div className="mb-6">
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">Team and account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone here can see every lead. Remove people as soon as they leave.</p>
      </div>
      <ErrorNote error={error} onRetry={reload} />
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Panel title="Admins" className="xl:col-span-2" bodyClassName="p-0">
          {loading && !data ? (
            <LoadingRows rows={3} />
          ) : (
            <ul className="divide-y divide-border">
              {(data?.data || []).map((a) => {
                const me = String(a._id) === String(admin._id);
                return (
                  <li key={a._id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{(a.admin_Name || "?").slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {a.admin_Name} {me && <span className="ml-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand-ink">You</span>}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{a.admin_Email}</span>
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:block">Added {timeAgo(a.createdAt)}</span>
                    {!me && (
                      <Button size="icon-sm" variant="ghost" aria-label={`Remove ${a.admin_Name}`} className="text-muted-foreground hover:text-destructive" onClick={() => setTarget(a)}>
                        <Trash />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <div className="grid content-start gap-6">
          <AddAdmin onAdded={reload} />
          <ChangePassword />
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(target)}
        title={`Remove ${target?.admin_Name}?`}
        body="They won't be able to sign in any more. Their notes on leads stay."
        confirmLabel="Remove"
        busy={busy}
        onConfirm={remove}
        onClose={() => setTarget(null)}
      />
    </>
  );
}

export default function TeamPage() {
  return (
    <AdminShell title="Team">
      <Team />
    </AdminShell>
  );
}
