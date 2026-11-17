import { Check, Phone } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import ProductTile from "@/components/blocks/ProductTile";
import ServiceCard from "@/components/blocks/ServiceCard";
import ApplicationForm from "@/components/forms/ApplicationForm";
import ScoreMeter from "@/components/fun/ScoreMeter";
import SiteLayout from "@/components/site/SiteLayout";
import { serviceBySlug, services } from "@/lib/catalog";
import { useT } from "@/lib/i18n";
import { getService } from "@/lib/services-content";
import { useSiteSettings } from "@/lib/site-settings";

const NEXT = [
  "We call you to understand exactly what you need.",
  "You get a clear quote and timeline before any work starts.",
  "We handle the documents and keep you updated until it's done.",
];

export default function ServicePage({ slug }) {
  const t = useT();
  const meta = serviceBySlug[slug];
  const content = getService(slug);
  const others = services.filter((s) => s.slug !== slug).slice(0, 4);
  const { primary } = useSiteSettings();

  return (
    <SiteLayout title={content.title} description={content.summary} path={`/${slug}`}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_0%,var(--brand-soft),transparent)]" />
        <div className="container-page relative grid items-start gap-10 pt-10 pb-16 md:pt-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0 lg:pb-24">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:pt-2">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }, { label: meta.name }]} />
            <h1 className="display-page mt-6 max-w-[18ch] text-balance">{t(content.headline)}</h1>
            <p className="lede mt-6 max-w-xl text-pretty">{t(content.summary)}</p>
          </div>
          <div id="enquire" className="animate-in fade-in slide-in-from-bottom-4 scroll-mt-24 duration-1000 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <ApplicationForm formKey={slug} productName={meta.name} className="shadow-[0_24px_60px_-40px_oklch(0.21_0.006_286/0.35)]" />
          </div>
          {/* After the form on phones, beside it on desktop. */}
          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">
            {slug === "credit-score-check-service" && (
              <div className="mb-9 lg:mt-8 lg:mb-0">
                <ScoreMeter compact />
              </div>
            )}
            <ol className="grid gap-4 lg:mt-9">
              {NEXT.map((line, i) => (
                <li key={line} className="flex gap-3.5">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold tabular-nums shadow-[0_0_0_1px_var(--border)]">
                    {i + 1}
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{t(line)}</p>
                </li>
              ))}
            </ol>
            <a
              href={primary.href}
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-background px-5 py-3 text-sm shadow-[0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
            >
              <Phone weight="duotone" className="size-5 text-brand-ink" />
              <span>
                {t("Prefer to talk?")} <span className="font-semibold">{primary.display}</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {content.fees.length > 0 && (
        <section className="border-t border-border bg-foreground text-background">
          <div className="container-page grid gap-8 py-14 lg:grid-cols-12 lg:items-start">
            <h2 className="headline lg:col-span-3">{t("Investment and earnings")}</h2>
            <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-9">
              {content.fees.map((f) => {
                const [label, value] = f.split(/:\s(.+)/);
                return (
                  <li key={f} className="border-t border-background/15 pt-4">
                    {value && <p className="text-sm text-background/60">{t(label)}</p>}
                    <p className="mt-1 text-lg font-semibold tracking-[-0.015em]">{t(value || label)}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {content.sections.length > 0 && (
        <section className="section border-t border-border">
          <div className="container-page">
            <h2 className="display-2 max-w-2xl">{t("What we handle.")}</h2>
            {/* A grid, not CSS columns: an opening card must not reshuffle the others between columns. */}
            <div className="mt-12 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {content.sections.map((s) => (
                <div key={s.heading} className="reveal">
                  <ServiceCard section={s} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.why.length > 0 && (
        <section className="border-t border-border bg-brand-soft/60">
          <div className="container-page grid gap-8 py-14 lg:grid-cols-12 lg:items-center">
            <h2 className="headline lg:col-span-3">{t(content.whyTitle)}</h2>
            <ul className="flex flex-wrap gap-2.5 lg:col-span-9">
              {content.why.map((w) => (
                <li key={w} className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm shadow-[0_0_0_1px_var(--border)]">
                  <Check weight="bold" className="size-3.5 text-brand-ink" />
                  {t(w)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="headline">{t("Other services")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <ProductTile key={s.slug} item={s} art />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
