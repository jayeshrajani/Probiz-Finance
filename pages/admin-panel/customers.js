"use client";

import { useMemo, useState } from "react";
import { DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminOnly, Empty, ErrorNote, LoadingRows, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      <PageHeader title="Customers" description={`${all.length} website accounts.`}>
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
      </PageHeader>
      <ErrorNote error={error} onRetry={reload} />
      <Panel bodyClassName="p-0">
        {loading && !data ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <Empty title={q ? "No customers match" : "No customers yet"} body="People who sign up on the website appear here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.user_Name}</TableCell>
                  <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                    <a href={`mailto:${u.user_Email}`} className="hover:text-foreground hover:underline">
                      {u.user_Email}
                    </a>
                  </TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">
                    <a href={`tel:${u.country_code || ""}${u.mobile_no}`} className="hover:underline">
                      {[u.country_code, u.mobile_no].filter(Boolean).join(" ")}
                    </a>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground" title={formatDateTime(u.createdAt)}>
                    {timeAgo(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
