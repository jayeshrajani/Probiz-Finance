"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, DownloadSimple, Trash } from "@phosphor-icons/react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminOnly, ConfirmDialog, Empty, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { adminFetch, downloadCsv, formatDateTime, timeAgo, useAdminData } from "@/lib/admin-api";

function Subscribers() {
  const { data, error, loading, reload } = useAdminData("getNewsLetter");
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const rows = [...(data?.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  async function remove() {
    setBusy(true);
    try {
      await adminFetch(`deleteNewsLetter/${target._id}`, { method: "DELETE" });
      toast.success("Subscriber removed");
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} people signed up for rates and tips from the website footer.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            onClick={async () => {
              await navigator.clipboard.writeText(rows.map((r) => r.email).join(", "));
              toast.success("Emails copied");
            }}
          >
            <Copy /> Copy emails
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            onClick={() =>
              downloadCsv("probiz-subscribers.csv", [
                { label: "Email", value: (r) => r.email },
                { label: "Subscribed", value: (r) => formatDateTime(r.createdAt) },
              ], rows)
            }
          >
            <DownloadSimple /> Export
          </Button>
        </div>
      </div>
      <ErrorNote error={error} onRetry={reload} />
      <Panel bodyClassName="p-0">
        {loading && !data ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <Empty title="No subscribers yet" body="The newsletter form sits in the website footer." />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r._id} className="group flex items-center gap-4 px-5 py-3">
                <a href={`mailto:${r.email}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand-ink">
                  {r.email}
                </a>
                <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                <Button size="icon-sm" variant="ghost" aria-label={`Remove ${r.email}`} className="text-muted-foreground hover:text-destructive" onClick={() => setTarget(r)}>
                  <Trash />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <ConfirmDialog open={Boolean(target)} title="Remove subscriber?" body={target?.email} confirmLabel="Remove" busy={busy} onConfirm={remove} onClose={() => setTarget(null)} />
    </>
  );
}

export default function SubscribersPage() {
  return (
    <AdminShell title="Subscribers">
      <AdminOnly>
        <Subscribers />
      </AdminOnly>
    </AdminShell>
  );
}
