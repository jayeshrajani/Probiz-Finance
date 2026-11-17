"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowSquareOut, Buildings, ImageSquare, MagnifyingGlass, PencilSimple, SpinnerGap, Trash, VideoCamera, X } from "@phosphor-icons/react";
import AdminShell, { useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, Empty, ErrorNote, LoadingRows, PageHeader, Panel } from "@/components/admin/ui";
import FormField from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { adminFetch, formatDateTime, timeAgo, useAdminData } from "@/lib/admin-api";
import { formatINRShort } from "@/lib/format";
import { hasValue, PROPERTY_SECTIONS, propertyErrors, typeLabel, visibleFields } from "@/lib/property";

const MAX_UPLOAD = 4.4 * 1024 * 1024;
const FIELD_NAMES = PROPERTY_SECTIONS.flatMap((s) => s.fields.map((f) => f.name));

const toValues = (p) => Object.fromEntries(FIELD_NAMES.map((k) => [k, hasValue(p[k]) ? String(p[k]) : ""]));

function ListingEditor({ listing, canEdit, onClose, onSaved }) {
  const [values, setValues] = useState(() => toValues(listing));
  const [errors, setErrors] = useState({});
  const [kept, setKept] = useState(() => listing.propertyImage || []);
  const [added, setAdded] = useState([]);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const tooLarge = added.reduce((s, f) => s + f.size, 0) > MAX_UPLOAD;
  const photoCount = kept.length + added.length;

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
  };

  async function save(e) {
    e.preventDefault();
    const errs = propertyErrors(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`edit-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    if (tooLarge) return;
    const fd = new FormData();
    const shown = new Set(PROPERTY_SECTIONS.flatMap((s) => visibleFields(s.fields, values).map((f) => f.name)));
    // Hidden fields (e.g. carpet area on a plot) are cleared so old values don't linger.
    for (const k of FIELD_NAMES) fd.append(k, shown.has(k) ? String(values[k] ?? "").trim() : "");
    fd.append("keepImages", JSON.stringify(kept));
    added.forEach((f) => fd.append("propertyImage", f));
    if (removeVideo) fd.append("removeVideo", "1");
    setSaving(true);
    try {
      await adminFetch(`updateProperty/${listing._id}`, { method: "PUT", body: fd });
      toast.success("Listing updated");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="flex min-h-full flex-col">
      <div className="border-b border-border px-6 pt-6 pb-5">
        <SheetTitle className="pr-10 font-display text-xl font-semibold tracking-[-0.02em]">{listing.propertyName || "Untitled listing"}</SheetTitle>
        <SheetDescription className="mt-1 text-sm text-muted-foreground">
          Listed {formatDateTime(listing.createdAt)}
          {canEdit ? "" : ". Only admins can edit listings."}
        </SheetDescription>
        <a href={`/property-detail?id=${listing._id}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:underline">
          <ArrowSquareOut className="size-4" /> See it on the website
        </a>
      </div>

      <fieldset disabled={!canEdit || saving} className="grid flex-1 content-start gap-8 px-6 py-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Photos</h3>
            <span className="text-xs text-muted-foreground">{photoCount} of 10</span>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {kept.map((url) => (
              <li key={url} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
                <img src={url} alt="" className="size-full object-cover" />
                {canEdit && (
                  <button type="button" onClick={() => setKept((k) => k.filter((u) => u !== url))} aria-label="Remove photo" className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-background/90 shadow">
                    <X weight="bold" className="size-3.5" />
                  </button>
                )}
              </li>
            ))}
            {added.map((file, i) => (
              <li key={`${file.name}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-secondary ring-2 ring-brand/60">
                <img src={URL.createObjectURL(file)} alt="" className="size-full object-cover" />
                <button type="button" onClick={() => setAdded((a) => a.filter((_, j) => j !== i))} aria-label={`Remove ${file.name}`} className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-background/90 shadow">
                  <X weight="bold" className="size-3.5" />
                </button>
              </li>
            ))}
            {canEdit && photoCount < 10 && (
              <li>
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-input text-xs text-muted-foreground hover:bg-secondary">
                  <ImageSquare weight="duotone" className="size-6" />
                  Add photos
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const picked = Array.from(e.target.files || []);
                      setAdded((a) => [...a, ...picked].slice(0, 10 - kept.length));
                      e.target.value = "";
                    }}
                  />
                </label>
              </li>
            )}
          </ul>
          {tooLarge && <p className="mt-2 text-xs font-medium text-destructive">New photos are over 4.4 MB in total. Remove some or compress them.</p>}
          {listing.propertyVideo && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm">
              <VideoCamera weight="duotone" className="size-5 shrink-0 text-muted-foreground" />
              <span className={removeVideo ? "flex-1 text-muted-foreground line-through" : "flex-1"}>Video tour</span>
              {canEdit && (
                <Button type="button" size="sm" variant="ghost" onClick={() => setRemoveVideo((v) => !v)}>
                  {removeVideo ? "Keep" : "Remove"}
                </Button>
              )}
            </div>
          )}
        </section>

        {PROPERTY_SECTIONS.map((s) => (
          <section key={s.title} className="grid gap-x-4 gap-y-5 border-t border-border pt-6 sm:grid-cols-2">
            <h3 className="text-sm font-semibold sm:col-span-2">{s.title}</h3>
            {visibleFields(s.fields, values).map((f) => (
              <FormField key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={setValue} idPrefix="edit" />
            ))}
          </section>
        ))}
      </fieldset>

      <div className="glass-bar sticky bottom-0 flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {canEdit ? "Cancel" : "Close"}
        </Button>
        {canEdit && (
          <Button type="submit" disabled={saving || tooLarge}>
            {saving && <SpinnerGap className="animate-spin" />} Save changes
          </Button>
        )}
      </div>
    </form>
  );
}

function Properties() {
  const { isAdmin } = useAdmin();
  const { data, error, loading, reload } = useAdminData("getAllProperty");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState(null);
  const [editing, setEditing] = useState(null);
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
      <PageHeader title="Property listings" description="Listed by customers through the website. Open one to fix details or photos, or delete it.">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search listings</span>
          <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, owner, city" className="h-9 w-full rounded-lg border border-border bg-background pl-9 text-sm outline-none focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20" />
        </label>
      </PageHeader>
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
                </div>
                <div className="p-4">
                  <p className="truncate font-semibold">{p.propertyName || "Untitled listing"}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{[typeLabel(p.propertyType), p.area, p.city].filter(Boolean).join(", ") || "Location not given"}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold tabular-nums">{Number(p.price) ? formatINRShort(Number(p.price)) : "Price on request"}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted-foreground">
                    {[p.ownerName || "Owner", p.contactNo].filter(Boolean).join(", ")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(p)}>
                      {isAdmin ? (
                        <>
                          <PencilSimple /> View and edit
                        </>
                      ) : (
                        "View details"
                      )}
                    </Button>
                    {isAdmin && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setTarget(p)}>
                        <Trash /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {editing && (
            <ListingEditor
              key={editing._id}
              listing={editing}
              canEdit={isAdmin}
              onClose={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                reload();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
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
