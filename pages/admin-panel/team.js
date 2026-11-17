"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Key, SpinnerGap, Trash, UserPlus } from "@phosphor-icons/react";
import AdminShell, { personaLabel, useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, ErrorNote, LoadingRows, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fieldBase } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminFetch, timeAgo, useAdminData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const field = cn(fieldBase, "h-10 text-sm");
const PERSONA_HINT = {
  sales: "Adds leads and follows their progress",
  ops_l1: "Picks up new leads, forwards to L2",
  ops_l2: "Works leads forwarded by L1",
};
const PERSONA_TONE = {
  sales: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  ops_l1: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  ops_l2: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

// Mirrors staffEmail() in server/admin/personas.js; the server adds a number if the address is taken.
function emailPreview(config, name, persona) {
  const p = config.personas?.find((x) => x.id === persona);
  if (!p || !name.trim()) return null;
  const first = name.trim().split(/\s+/)[0].normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "") || "staff";
  return `${first}.${p.emailTag}@${config.emailDomain}`;
}

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
  const { config } = useAdmin();
  const blank = { name: "", persona: "", mobile: "", employeeId: "", password: "" };
  const [v, setV] = useState(blank);
  const [created, setCreated] = useState(null);
  const [busy, run] = useSubmit();
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const preview = emailPreview(config, v.name, v.persona);
  return (
    <Panel title="Add an employee" description="Pick their role; the sign-in email is made from their first name and role.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!v.persona) return toast.error("Choose a role.");
          run(async () => {
            const res = await adminFetch("admin/employees", { method: "POST", body: v });
            toast.success(`${v.name} can now sign in as ${res.data.email}`);
            setCreated({ name: v.name, email: res.data.email });
            setV(blank);
            onAdded();
          });
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <fieldset className="grid gap-1.5 sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium">Role</legend>
          <div role="radiogroup" aria-label="Role" className="grid gap-2 sm:grid-cols-3">
            {(config.personas || []).map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={v.persona === p.id}
                onClick={() => setV({ ...v, persona: p.id })}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-brand/25 focus-visible:outline-none",
                  v.persona === p.id ? "border-brand bg-brand-soft" : "border-border hover:border-foreground/20"
                )}
              >
                <span className="block text-sm font-medium">{p.label}</span>
                <span className="block text-xs text-muted-foreground">{PERSONA_HINT[p.id]}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" required value={v.name} onChange={set("name")} autoComplete="off" />
        <div className="grid gap-1.5 text-sm font-medium">
          Sign-in email
          <p className={cn(field, "flex items-center truncate bg-secondary/60", !preview && "text-muted-foreground")} aria-live="polite">
            {preview || "Enter a name and pick a role"}
          </p>
        </div>
        <Field label="Mobile" type="tel" required value={v.mobile} onChange={set("mobile")} autoComplete="off" />
        <Field label="Employee ID" required value={v.employeeId} onChange={set("employeeId")} placeholder="PBZ-003" autoComplete="off" />
        <Field label="Temporary password" type="password" required minLength={8} value={v.password} onChange={set("password")} autoComplete="new-password" />
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? <SpinnerGap className="animate-spin" /> : <UserPlus />} Add employee
          </Button>
          {created && (
            <p className="text-sm text-muted-foreground">
              {created.name} signs in as <span className="font-medium text-foreground select-all">{created.email}</span>
            </p>
          )}
        </div>
      </form>
    </Panel>
  );
}

const PERSONA_ORDER = ["sales", "ops_l1", "ops_l2"];

function Employees() {
  const { config } = useAdmin();
  const { data, error, loading, reload } = useAdminData("admin/employees");
  const [removing, setRemoving] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [password, setPassword] = useState("");
  const [busy, run] = useSubmit();
  const list = [...(data?.data || [])].sort((a, b) => PERSONA_ORDER.indexOf(a.persona) - PERSONA_ORDER.indexOf(b.persona));

  const changeRole = (e, persona) =>
    run(async () => {
      await adminFetch(`admin/employees/${e._id}`, { method: "PUT", body: { persona } });
      toast.success(`${e.name} is now ${personaLabel(config, persona)}`);
      reload();
    });

  return (
    <>
      <Panel title="Employees" description="Sales add leads. Operations L1 picks them up and forwards to L2." bodyClassName="p-0">
        <ErrorNote error={error} onRetry={reload} />
        {loading && !data ? (
          <LoadingRows rows={3} />
        ) : list.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No employees yet. Add your first one below.</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((e) => (
              <li key={e._id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{e.name}</span>
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium", PERSONA_TONE[e.persona])}>{personaLabel(config, e.persona)}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{[e.employeeId, e.email, e.mobile].filter(Boolean).join(", ")}</span>
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {e.persona === "sales" ? `${e.added} added, ${e.addedWon} converted` : `${e.active} active, ${e.won} won`}
                </span>
                <Select value={e.persona} disabled={busy} onValueChange={(next) => next !== e.persona && changeRole(e, next)}>
                  <SelectTrigger size="sm" aria-label={`Change ${e.name}'s role`} className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {(config.personas || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      <Dialog
        open={Boolean(resetting)}
        onOpenChange={(next) => {
          if (!next) {
            setResetting(null);
            setPassword("");
          }
        }}
      >
        <DialogContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await adminFetch(`admin/employees/${resetting._id}/password`, { method: "PUT", body: { password } });
                toast.success("Password reset. Share it with them privately.");
                setResetting(null);
                setPassword("");
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>Reset {resetting?.name}'s password</DialogTitle>
              <DialogDescription>They'll use the new password next time they sign in.</DialogDescription>
            </DialogHeader>
            <Field label="New password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setResetting(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy && <SpinnerGap className="animate-spin" />} Reset password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {a.admin_Name} {me && <span className="font-normal text-muted-foreground">(you)</span>}
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
  const { staff, isAdmin, config } = useAdmin();
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
          <dd className="font-medium">
            {staff.platform ? "Platform manager" : isAdmin ? "Admin" : [personaLabel(config, staff.persona) || staff.title, staff.employeeId].filter(Boolean).join(", ")}
          </dd>
        </div>
      </dl>
      {staff.platform ? (
        <p className="border-t border-border pt-5 text-sm text-muted-foreground">Developer account. Its username and password come from PLATFORM_MANAGER_USERNAME and PLATFORM_MANAGER_PASSWORD.</p>
      ) : (
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
      )}
    </Panel>
  );
}

function Team() {
  const { isAdmin } = useAdmin();
  return (
    <>
      <PageHeader
        title={isAdmin ? "Team and account" : "My account"}
        description={isAdmin ? "Admins manage everything. Employees work the leads you share with them." : "Your details and password."}
      />
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
