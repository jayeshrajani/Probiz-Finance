"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowSquareOut, Buildings, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import AdminShell from "@/components/admin/AdminShell";
import { ConfirmDialog, Empty, ErrorNote, LoadingRows, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { adminFetch, timeAgo, useAdminData } from "@/lib/admin-api";
import { formatINRShort } from "@/lib/format";
import { typeLabel } from "@/lib/property";

function Properties() {
  const { data, error, loading, reload } = useAdminData("getAllProperty");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const list = data?.data || [];
    const term = q.trim().toLowerCase();
    return term ? list.filter((p) => [p.propertyName, p.ownerName, p.city, p.area, p.contactNo].some((v) => v && String(v).toLowerCase().includes(term))) : list;
  }, [data, q]);

  async function remove() {
    setBusy(true);
    try {
      await adminFetch(`deleteProperty/${target._id}`, { method: "DELETE" });
      toast.success("Listing deleted");
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
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.025em]">Property listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Listed by customers through the website. Remove anything that shouldn't be public.</p>
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search listings</span>
          <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, owner, city" className="h-9 w-full rounded-lg border border-border bg-background pl-9 text-sm outline-none focus:border-brand" />
        </label>
      </div>
      <ErrorNote error={error} onRetry={reload} />
      {loading && !data ? (
        <Panel bodyClassName="p-0">
          <LoadingRows />
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <Empty title={q ? "No listings match" : "No listings yet"} body="Customers can list a property from the website once they sign in." />
        </Panel>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((p) => {
            const img = (p.propertyImage || [])[0];
            return (
              <li key={p._id} className="overflow-hidden rounded-2xl border border-border bg-background">
                <div className="relative aspect-[16/10] bg-secondary">
                  {img ? (
                    <img src={img} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <Buildings weight="duotone" className="absolute inset-0 m-auto size-10 text-muted-foreground" />
                  )}
                  {p.propertyType && <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium">{typeLabel(p.propertyType)}</span>}
                </div>
                <div className="p-4">
                  <p className="truncate font-semibold">{p.propertyName || "Untitled listing"}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{[p.area, p.city].filter(Boolean).join(", ") || "Location not given"}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold tabular-nums">{Number(p.price) ? formatINRShort(Number(p.price)) : "Price on request"}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted-foreground">
                    {p.ownerName || "Owner"} {p.contactNo ? `· ${p.contactNo}` : ""}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <a href={`/property-detail?id=${p._id}`} target="_blank" rel="noreferrer">
                        <ArrowSquareOut /> View
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setTarget(p)}>
                      <Trash /> Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this listing?"
        body={target ? `"${target.propertyName || "This listing"}" will disappear from the website.` : ""}
        busy={busy}
        onConfirm={remove}
        onClose={() => setTarget(null)}
      />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <AdminShell title="Property listings">
      <Properties />
    </AdminShell>
  );
}
