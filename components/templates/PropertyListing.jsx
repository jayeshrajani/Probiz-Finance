"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Buildings, FunnelSimple, MapPin, Plus, WarningCircle } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import TopoBackground from "@/components/kokonutui/topo-background";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { getJSON } from "@/lib/api";
import { formatINRShort } from "@/lib/format";
import { firstImage, PROPERTY_TYPES, typeLabel } from "@/lib/property";

function PropertyCard({ p }) {
  const img = firstImage(p);
  return (
    <Link href={`/property-detail?id=${p._id}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
        {img ? (
          <img src={img} alt={p.propertyName || "Property"} loading="lazy" className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Buildings weight="duotone" className="size-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-[-0.015em]">{p.propertyName || typeLabel(p.propertyType) || "Property"}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
            <MapPin weight="duotone" className="size-3.5 shrink-0" />
            {[p.area, p.city].filter(Boolean).join(", ") || "Location on request"}
          </p>
        </div>
        {Number(p.price) > 0 && <p className="shrink-0 font-semibold tabular-nums">{formatINRShort(p.price)}</p>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{[typeLabel(p.propertyType), p.bhk_of_house].filter(Boolean).join(", ")}</p>
    </Link>
  );
}

function Skeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[4/3] animate-pulse rounded-2xl bg-secondary" />
      <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-secondary" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-secondary" />
    </div>
  );
}

export default function PropertyListing({ title = "Property Listings", path = "/property", headline, intro, presetType = "" }) {
  const [filters, setFilters] = useState({ city: "", area: "", type: presetType, minPrice: "", maxPrice: "" });
  const [state, setState] = useState({ status: "loading", items: [] });

  async function load(f) {
    setState((s) => ({ ...s, status: "loading" }));
    const q = new URLSearchParams();
    if (f.city) q.append("city", f.city.trim());
    if (f.area) q.append("areaName", f.area.trim());
    if (f.type) q.append("propertyType", f.type);
    if (f.minPrice) q.append("minPrice", f.minPrice);
    if (f.maxPrice) q.append("maxPrice", f.maxPrice);
    const res = await getJSON(`getFilterProperties?${q.toString()}`);
    if (res.ok) setState({ status: "ready", items: res.data?.data || [] });
    else setState({ status: "error", items: [] });
  }

  useEffect(() => {
    load(filters);
    // Only the preset filter is applied on first load; later changes go through "Apply".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <SiteLayout title={title} description="Plots, flats, houses, shops and farmland for sale, listed by owners on Probiz." path={path}>
      <TopoBackground className="block min-h-0 bg-transparent text-brand/80">
      <section className="container-page relative pt-10 pb-10 text-foreground md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Property" }]} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="display-1 max-w-[14ch] text-balance">{headline || "Find your next property."}</h1>
            <p className="lede mt-5 max-w-xl">{intro || "Plots, flats, shops and farmland, with loans and legal checks from the same team."}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/add-product">
              <Plus weight="bold" /> List your property
            </Link>
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(filters);
          }}
          className="mt-10 grid gap-3 rounded-2xl bg-secondary p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_auto]"
        >
          <Input aria-label="City" placeholder="City" value={filters.city} onChange={set("city")} className="bg-background" />
          <Input aria-label="Area" placeholder="Area or locality" value={filters.area} onChange={set("area")} className="bg-background" />
          <NativeSelect aria-label="Property type" value={filters.type} onChange={set("type")} className="bg-background">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </NativeSelect>
          <Input aria-label="Minimum price" placeholder="Min ₹" inputMode="numeric" value={filters.minPrice} onChange={set("minPrice")} className="bg-background" />
          <Input aria-label="Maximum price" placeholder="Max ₹" inputMode="numeric" value={filters.maxPrice} onChange={set("maxPrice")} className="bg-background" />
          <Button type="submit" size="lg" className="h-12">
            <FunnelSimple weight="bold" /> Apply
          </Button>
        </form>
      </section>
      </TopoBackground>

      <section className="container-page pb-24">
        {state.status === "loading" && (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        )}
        {state.status === "error" && (
          <div className="flex flex-col items-center rounded-2xl border border-border py-20 text-center">
            <WarningCircle weight="duotone" className="size-10 text-muted-foreground" />
            <p className="mt-4 font-semibold">We couldn't load listings.</p>
            <Button variant="outline" className="mt-6" onClick={() => load(filters)}>
              Try again
            </Button>
          </div>
        )}
        {state.status === "ready" && state.items.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Buildings weight="duotone" className="size-10 text-muted-foreground" />
            <p className="mt-4 font-semibold">No properties match these filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Widen the price range or clear a filter.</p>
          </div>
        )}
        {state.status === "ready" && state.items.length > 0 && (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {state.items.length} {state.items.length === 1 ? "property" : "properties"}
            </p>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {state.items.map((p) => (
                <PropertyCard key={p._id} p={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
