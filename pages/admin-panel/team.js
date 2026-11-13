"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Key, SpinnerGap, Trash, UserPlus } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/ui/input";
import { adminFetch, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const field = cn(fieldBase, "h-10 text-sm");

function Field({ label, className, ...props }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium", className)}>
      {label}
      <input className={field} {...props} />
    </label>
  );
}

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return [busy, run];
}

function AddEmployee({ onAdded }) {
  const blank = { name: "", email: "", mobile: "", employeeId: "", title: "Advisor", password: "" };
  const [v, setV] = useState(blank);
  const [busy, run] = useSubmit();
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <Panel title="Add an employee" description="Employees sign in from the website's sign-in page, under Employee.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            await adminFetch("admin/employees", { method: "POST", body: v });
            toast.success(`${v.name} can now sign in`);
            setV(blank);
            onAdded();
          });
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Full name" required value={v.name} onChange={set("name")} autoComplete="off" />
        <Field label="Employee ID" required value={v.employeeId} onChange={set("employeeId")} placeholder="PBZ-003" autoComplete="off" />
        <Field label="Work email" type="email" required value={v.email} onChange={set("email")} autoComplete="off" />
        <Field label="Mobile" type="tel" required value={v.mobile} onChange={set("mobile")} autoComplete="off" />
        <Field label="Job title" value={v.title} onChange={set("title")} autoComplete="off" />
        <Field label="Temporary password" type="password" required minLength={8} value={v.password} onChange={set("password")} autoComplete="new-password" />
        <Button type="submit" disabled={busy} className="justify-self-start sm:col-span-2">
          {busy ? <SpinnerGap className="animate-spin" /> : <UserPlus />} Add employee
        </Button>
      </form>
    </Panel>
  );
}

function Employees() {
  const { data, error, loading, reload } = useAdminData("admin/employees");
  const [removing, setRemoving] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [password, setPassword] = useState("");
  const [busy, run] = useSubmit();
  const list = data?.data || [];

  return (
    <>
      <Panel title="Employees" description="Advisors who work leads. They see only their own leads and the unassigned pool." bodyClassName="p-0">
        <ErrorNote error={error} onRetry={reload} />
        {loading && !data ? (
          <LoadingRows rows={3} />
        ) : list.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No employees yet. Add your first advisor below.</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((e) => (
              <li key={e._id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink">{e.name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {e.name} <span className="font-normal text-muted-foreground">· {e.roll}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {e.employeeId} · {e.email} · {e.mobile}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {e.active} active · {e.won} won
                </span>
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" aria-label={`Reset ${e.name}'s password`} onClick={() => setResetting(e)}>
                    <Key />
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label={`Remove ${e.name}`} className="text-muted-foreground hover:text-destructive" onClick={() => setRemoving(e)}>
                    <Trash />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AddEmployee onAdded={reload} />

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.name}?`}
        body="They won't be able to sign in. Their open leads go back to the unassigned pool; notes stay."
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() =>
          run(async () => {
            await adminFetch(`admin/employees/${removing._id}`, { method: "DELETE" });
            toast.success(`${removing.name} removed`);
            setRemoving(null);
            reload();
          })
        }
        onClose={() => setRemoving(null)}
      />

      {resetting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 px-4 backdrop-blur-[2px]" onClick={() => setResetting(null)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-label={`Reset ${resetting.name}'s password`}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await adminFetch(`admin/employees/${resetting._id}/password`, { method: "PUT", body: { password } });
                toast.success("Password reset. Share it with them privately.");
                setResetting(null);
                setPassword("");
              });
            }}
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-[0_40px_100px_-30px_oklch(0.21_0.006_286/0.5)]"
          >
            <h2 className="text-lg font-semibold tracking-[-0.015em]">Reset {resetting.name}'s password</h2>
            <Field label="New password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="mt-4" autoFocus />
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetting(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <SpinnerGap className="animate-spin" />} Reset
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Admins() {
  const { staff } = useAdmin();
  const { data, error, loading, reload } = useAdminData("admin/admins");
  const [v, setV] = useState({ admin_Name: "", admin_Email: "", password: "" });
  const [target, setTarget] = useState(null);
  const [busy, run] = useSubmit();

  return (
    <Panel title="Admins" description="Full access: every lead, customers, exports and this page." bodyClassName="p-0">
      <ErrorNote error={error} onRetry={reload} />
      {loading && !data ? (
        <LoadingRows rows={2} />
      ) : (
        <ul className="divide-y divide-border">
          {(data?.data || []).map((a) => {
            const me = String(a._id) === staff.id;
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (v.password.length < 8) return toast.error("Use a password of at least 8 characters.");
          run(async () => {
            await adminFetch("createAdmin", { method: "POST", body: v });
            toast.success(`${v.admin_Name} is now an admin`);
            setV({ admin_Name: "", admin_Email: "", password: "" });
            reload();
          });
        }}
        className="grid gap-3 border-t border-border p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      >
        <Field label="Name" required value={v.admin_Name} onChange={(e) => setV({ ...v, admin_Name: e.target.value })} autoComplete="off" />
        <Field label="Email" type="email" required value={v.admin_Email} onChange={(e) => setV({ ...v, admin_Email: e.target.value })} autoComplete="off" />
        <Field label="Password" type="password" required value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} autoComplete="new-password" />
        <Button type="submit" variant="outline" disabled={busy}>
          {busy ? <SpinnerGap className="animate-spin" /> : <UserPlus />} Add admin
        </Button>
      </form>
      <ConfirmDialog
        open={Boolean(target)}
        title={`Remove ${target?.admin_Name}?`}
        body="They won't be able to sign in any more. Their notes on leads stay."
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() =>
          run(async () => {
            await adminFetch(`admin/admins/${target._id}`, { method: "DELETE" });
            toast.success(`${target.admin_Name} removed`);
            setTarget(null);
            reload();
          })
        }
        onClose={() => setTarget(null)}
      />
    </Panel>
  );
}

function MyAccount() {
  const { staff, isAdmin } = useAdmin();
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [busy, run] = useSubmit();
  return (
    <Panel title="Your account">
      <dl className="mb-6 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium">{staff.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate font-medium">{staff.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-medium">{isAdmin ? "Admin" : [staff.title, staff.employeeId].filter(Boolean).join(" · ")}</dd>
        </div>
      </dl>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (v.next !== v.confirm) return toast.error("The new passwords don't match.");
          run(async () => {
            await adminFetch("admin/me/password", { method: "PUT", body: { current: v.current, next: v.next } });
            toast.success("Password updated");
            setV({ current: "", next: "", confirm: "" });
          });
        }}
        className="grid gap-4 border-t border-border pt-5"
      >
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
  const { isAdmin } = useAdmin();
  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">{isAdmin ? "Team and account" : "My account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin ? "Admins manage everything. Employees work the leads you share with them." : "Your details and password."}
        </p>
      </div>
      {isAdmin ? (
        <div className="grid items-start gap-6 xl:grid-cols-3">
          <div className="grid gap-6 xl:col-span-2">
            <Employees />
            <Admins />
          </div>
          <MyAccount />
        </div>
      ) : (
        <div className="max-w-xl">
          <MyAccount />
        </div>
      )}
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
