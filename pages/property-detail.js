"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Buildings, MapPin, Phone, WarningCircle } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getJSON } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { hasValue, typeLabel } from "@/lib/property";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[2rem] bg-secondary">
        <Buildings weight="duotone" className="size-16 text-muted-foreground/50" />
      </div>
    );
  }
  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-[2rem] bg-secondary">
        <img src={images[active]} alt={`${name}, photo ${active + 1}`} className="size-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={cn("size-20 shrink-0 overflow-hidden rounded-xl ring-offset-2 transition", i === active ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100")}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setState({ status: "missing", data: null });
      return;
    }
    getJSON(`getPropertyById/${encodeURIComponent(id)}`).then((res) => {
      if (res.ok && res.data?.data) setState({ status: "ready", data: res.data.data });
      else setState({ status: res.status === 404 ? "missing" : "error", data: null });
    });
  }, [router.isReady, id]);

  const p = state.data;
  const images = p ? (Array.isArray(p.propertyImage) ? p.propertyImage : [p.propertyImage]).filter(Boolean) : [];
  const facts = p
    ? [
        ["Type", typeLabel(p.propertyType)],
        ["Configuration", p.bhk_of_house],
        ["Built-up area", hasValue(p.buildUpArea) && `${p.buildUpArea} sq ft`],
        ["Carpet area", hasValue(p.carpetArea) && `${p.carpetArea} sq ft`],
        ["Plot area", hasValue(p.plotArea) && `${p.plotArea} sq ft`],
        ["Facing", p.houseFacing],
        ["Furnishing", p.furnishingStatus],
        ["Bathrooms", hasValue(p.bathrooms) && p.bathrooms],
        ["Balconies", hasValue(p.numberOfBalconies) && p.numberOfBalconies],
        ["Built in", hasValue(p.construction_year) && p.construction_year],
      ].filter(([, v]) => hasValue(v))
    : [];

  return (
    <SiteLayout title={p?.propertyName || "Property"} path="/property-detail">
      <section className="container-page pt-10 pb-24 md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Property", href: "/property" }, { label: p?.propertyName || "Details" }]} />

        {state.status === "loading" && (
          <div className="mt-8 grid gap-10 lg:grid-cols-12" aria-busy>
            <div className="aspect-[16/10] animate-pulse rounded-[2rem] bg-secondary lg:col-span-8" />
            <div className="h-64 animate-pulse rounded-[2rem] bg-secondary lg:col-span-4" />
          </div>
        )}

        {(state.status === "missing" || state.status === "error") && (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-border py-20 text-center">
            <WarningCircle weight="duotone" className="size-10 text-muted-foreground" />
            <p className="mt-4 font-semibold">{state.status === "missing" ? "This listing isn't available." : "We couldn't load this listing."}</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/property">See all properties</Link>
            </Button>
          </div>
        )}

        {state.status === "ready" && p && (
          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Gallery images={images} name={p.propertyName || "Property"} />
              <h1 className="display-2 mt-10">{p.propertyName || typeLabel(p.propertyType)}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                <MapPin weight="duotone" className="size-4" />
                {[p.address, p.area, p.city, p.state].filter(Boolean).join(", ")}
              </p>
              {facts.length > 0 && (
                <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 rounded-2xl bg-secondary p-6 sm:grid-cols-3">
                  {facts.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-sm text-muted-foreground">{k}</dt>
                      <dd className="mt-1 font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {p.description && (
                <div className="mt-10">
                  <h2 className="headline">About this property</h2>
                  <p className="mt-4 max-w-[65ch] whitespace-pre-line leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              )}
              {p.propertyVideo && (
                <video src={p.propertyVideo} controls preload="metadata" className="mt-10 w-full rounded-[2rem] bg-secondary" />
              )}
            </div>
            <aside className="lg:col-span-4">
              <div className="rounded-[2rem] border border-border p-7 lg:sticky lg:top-28">
                <p className="text-sm text-muted-foreground">Asking price</p>
                <p className="mt-1 font-display text-4xl font-semibold tracking-[-0.03em] tabular-nums">{Number(p.price) > 0 ? formatINR(p.price) : "On request"}</p>
                <div className="mt-8 grid gap-3">
                  <Button asChild size="lg">
                    <a href={site.phoneHref}>
                      <Phone weight="bold" /> Enquire about this property
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={p.propertyType === "Commercial Property" ? "/commercialproperty#apply" : p.propertyType === "Plot" ? "/plotpurchaseloan#apply" : "/homeloan#apply"}>
                      Get a loan for it
                    </Link>
                  </Button>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-muted-foreground">Listed by the owner. We recommend a legal check before paying any advance; our team can do it for you.</p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
