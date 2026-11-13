import { Check, Phone } from "@phosphor-icons/react";
import HeroArt from "@/components/art/HeroArt";
import { sceneFor } from "@/components/art/Scene";
import ApplySection from "@/components/blocks/ApplySection";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import ProductTile from "@/components/blocks/ProductTile";
import ScoreMeter from "@/components/fun/ScoreMeter";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { serviceBySlug, services } from "@/lib/catalog";
import { getService } from "@/lib/services-content";
import { site } from "@/lib/site";

const NEXT = [
  "We call you to understand exactly what you need.",
  "You get a clear quote and timeline before any work starts.",
  "We handle the documents and keep you updated until it's done.",
];

export default function ServicePage({ slug }) {
  const meta = serviceBySlug[slug];
  const content = getService(slug);
  const others = services.filter((s) => s.slug !== slug).slice(0, 4);

  return (
    <SiteLayout title={`${content.title} in Indore`} description={content.summary} path={`/${slug}`}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_0%,var(--brand-soft),transparent)]" />
        <div className="container-page relative grid items-center gap-12 pt-10 pb-16 md:pt-14 lg:grid-cols-12 lg:gap-16 lg:pb-24">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 lg:col-span-6">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }, { label: meta.name }]} />
            <h1 className="display-page mt-6 max-w-[20ch] text-balance">{content.headline}</h1>
            <p className="lede mt-6 max-w-xl text-pretty">{content.summary}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#enquire">Send an enquiry</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={site.phoneHref}>
                  <Phone weight="bold" /> Call us
                </a>
              </Button>
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 lg:col-span-6">
            {content.fees.length ? (
              <div className="rounded-[2rem] bg-foreground p-8 text-background sm:p-10">
                <p className="text-sm text-background/60">Investment and earnings</p>
                <ul className="mt-6 grid gap-5">
                  {content.fees.map((f) => {
                    const [label, value] = f.split(/:\s(.+)/);
                    return (
                      <li key={f} className="border-t border-background/15 pt-4 first:border-0 first:pt-0">
                        <p className="text-sm text-background/60">{value ? label : ""}</p>
                        <p className="mt-1 text-lg font-semibold tracking-[-0.015em]">{value || label}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <HeroArt scene={sceneFor(meta)} chips={content.why.filter((w) => w.length < 40).map((label) => ({ label }))} />
            )}
          </div>
        </div>
      </section>

      {slug === "credit-score-check-service" && (
        <section className="section border-t border-border bg-secondary/50">
          <div className="container-page">
            <h2 className="display-2 mb-12 max-w-2xl">Where does your score sit?</h2>
            <ScoreMeter />
          </div>
        </section>
      )}

      {content.sections.length > 0 && (
        <section className="section border-t border-border">
          <div className="container-page">
            <h2 className="display-2 max-w-2xl">What we handle.</h2>
            <div className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
              {content.sections.map((s) => (
                <article key={s.heading} className="reveal mb-5 break-inside-avoid rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-semibold tracking-[-0.015em]">{s.heading}</h3>
                  {s.intro && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.intro}</p>}
                  {s.items?.length > 0 && (
                    <ul className="mt-4 grid gap-2.5">
                      {s.items.map((item) => (
                        <li key={item.title} className="flex gap-2.5 text-sm leading-relaxed">
                          <Check weight="bold" className="mt-1 size-3.5 shrink-0 text-brand-ink" />
                          <span>
                            {item.description ? <span className="font-medium">{item.title}. </span> : item.title}
                            {item.description && <span className="text-muted-foreground">{item.description}</span>}
                            {item.bullets?.length > 0 && (
                              <span className="mt-1 block text-muted-foreground">{item.bullets.join(", ")}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.why.length > 0 && (
        <section className="border-t border-border bg-brand-soft/60">
          <div className="container-page grid gap-8 py-14 lg:grid-cols-12 lg:items-center">
            <h2 className="headline lg:col-span-3">{content.whyTitle}</h2>
            <ul className="flex flex-wrap gap-2.5 lg:col-span-9">
              {content.why.map((w) => (
                <li key={w} className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm shadow-[0_0_0_1px_var(--border)]">
                  <Check weight="bold" className="size-3.5 text-brand-ink" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ApplySection
        id="enquire"
        title="Tell us what you need."
        intro="Leave your details and an advisor will call you back."
        formKey={slug}
        productName={meta.name}
        next={NEXT}
      />

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="headline">Other services</h2>
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
