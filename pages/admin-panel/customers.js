"use client";

import { useMemo, useState } from "react";
import { DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminOnly, Empty, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { downloadCsv, formatDateTime, timeAgo, useAdminData } from "@/lib/admin-api";

function Customers() {
  const { data, error, loading, reload } = useAdminData("getAllUsers");
  const [q, setQ] = useState("");
  const all = data?.data || [];
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return term ? list.filter((u) => [u.user_Name, u.user_Email, u.mobile_no].some((v) => v && String(v).toLowerCase().includes(term))) : list;
  }, [all, q]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{all.length} website accounts.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <label className="relative flex-1 sm:w-64">
            <span className="sr-only">Search customers</span>
            <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone" className="h-9 w-full rounded-lg border border-border bg-background pl-9 text-sm outline-none focus:border-brand" />
          </label>
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            onClick={() =>
              downloadCsv(
                "probiz-customers.csv",
                [
                  { label: "Name", value: (u) => u.user_Name },
                  { label: "Email", value: (u) => u.user_Email },
                  { label: "Mobile", value: (u) => `${u.country_code || ""} ${u.mobile_no || ""}`.trim() },
                  { label: "Joined", value: (u) => formatDateTime(u.createdAt) },
                ],
                rows
              )
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
          <Empty title={q ? "No customers match" : "No customers yet"} body="People who sign up on the website appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((u) => (
              <li key={u._id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{(u.user_Name || "?").slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{u.user_Name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{u.user_Email}</span>
                </span>
                <a href={`tel:${u.country_code || ""}${u.mobile_no}`} className="hidden text-sm tabular-nums hover:text-brand-ink sm:block">
                  {u.country_code} {u.mobile_no}
                </a>
                <span className="w-24 text-right text-xs text-muted-foreground" title={formatDateTime(u.createdAt)}>
                  {timeAgo(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

export default function CustomersPage() {
  return (
    <AdminShell title="Customers">
      <AdminOnly>
        <Customers />
      </AdminOnly>
    </AdminShell>
  );
}
