import { useState } from "react";
import { CaretDown, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { areaCount, hiringAreas } from "@/lib/careers";
import { useT } from "@/lib/i18n";

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function matches(query) {
  const q = norm(query);
  if (!q) return null;
  return hiringAreas
    .map((d) => (norm(d.district).includes(q) ? d : { ...d, areas: d.areas.filter((a) => norm(a).includes(q)) }))
    .filter((d) => d.areas.length > 0);
}

const DistrictName = ({ d, t }) => (
  <>
    <span className="font-semibold">{d.district}</span>
    {d.headOffice && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-ink">{t("Head office")}</span>}
  </>
);

export default function HiringAreas() {
  const t = useT();
  const [query, setQuery] = useState("");
  const found = matches(query);

  return (
    <section id="areas" className="section scroll-mt-20 border-t border-border">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="display-2 max-w-[20ch]">{t("Hiring across all {n} districts of Madhya Pradesh.", { n: hiringAreas.length })}</h2>
            <p className="mt-4 text-muted-foreground">{t("{n} cities, towns and areas. Search for yours.", { n: areaCount })}</p>
          </div>
          <div className="relative lg:col-span-5">
            <label htmlFor="area-search" className="sr-only">
              {t("Search your district, city or town")}
            </label>
            <MagnifyingGlass weight="bold" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="area-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search your district, city or town")} className="pl-10" />
          </div>
        </div>

        <div className="mt-10" aria-live="polite">
          {found && found.length === 0 && (
            <p className="rounded-2xl bg-secondary/60 p-6 text-foreground/85">{t("No match found. Please try another spelling, or contact us.")}</p>
          )}
          {found && found.length > 0 && (
            <ul className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {found.map((d) => (
                <li key={d.district} className="rounded-2xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]">
                  <p className="flex flex-wrap items-center gap-2">
                    <DistrictName d={d} t={t} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{d.areas.join(", ")}</p>
                </li>
              ))}
            </ul>
          )}
          {!found && (
            <ul className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {hiringAreas.map((d) => (
                <li key={d.district}>
                  <details className="group rounded-2xl bg-background shadow-[0_0_0_1px_var(--border)] open:shadow-[0_0_0_1px_var(--border),0_12px_32px_-16px_rgb(0_0_0/0.18)]">
                    <summary className="flex cursor-pointer list-none items-center gap-2 p-4 [&::-webkit-details-marker]:hidden">
                      <MapPin weight="duotone" className="size-4 shrink-0 text-brand-ink" />
                      <DistrictName d={d} t={t} />
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">{d.areas.length}</span>
                      <CaretDown weight="bold" className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{d.areas.join(", ")}</p>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
