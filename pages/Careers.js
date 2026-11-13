import { Check, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import SiteLayout from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import company from "@/content/company.json";
import { site } from "@/lib/site";

export default function CareersPage() {
  const { introParagraphs, roles, cities } = company.careers;

  return (
    <SiteLayout title="Careers" description="Probiz Finance is hiring relationship executives and channel managers across Madhya Pradesh." path="/Careers">
      <BackgroundPaths className="min-h-[520px] justify-start bg-transparent text-brand-ink">
        <section className="container-page relative py-12 text-foreground md:py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Careers" }]} />
          <h1 className="display-page mt-6 max-w-[20ch] text-balance">Build a career in lending across Madhya Pradesh.</h1>
          <p className="lede mt-6 max-w-2xl">{introParagraphs[1]}</p>
        </section>
      </BackgroundPaths>

      <section className="section border-t border-border">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-2">Open roles.</h2>
            <p className="mt-4 text-muted-foreground">Structured training, products from many banks, and a fast-track growth path.</p>
          </div>
          <Accordion type="single" collapsible defaultValue={roles[0].title} className="lg:col-span-8">
            {roles.map((r) => (
              <AccordionItem key={r.title} value={r.title} className="border-border">
                <AccordionTrigger className="py-6">
                  <span>
                    <span className="block text-lg font-semibold">{r.title}</span>
                    <span className="mt-1 block text-sm font-normal text-muted-foreground">{r.ctc}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pr-0">
                  <p className="text-foreground/85">{r.overview}</p>
                  <div className="mt-6 grid gap-8 sm:grid-cols-2">
                    {[
                      ["What you'll do", r.responsibilities],
                      ["Who we're looking for", r.idealCandidate],
                    ].map(([title, list]) => (
                      <div key={title}>
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <ul className="mt-3 grid gap-2">
                          {list.map((x) => (
                            <li key={x} className="flex gap-2.5 text-sm">
                              <Check weight="bold" className="mt-1 size-3.5 shrink-0 text-brand-ink" /> {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="section border-t border-border bg-secondary/50">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-2">Hiring in {cities.length} cities.</h2>
            <p className="mt-4 text-muted-foreground">Two executives per city.</p>
          </div>
          <ul className="flex flex-wrap content-start gap-2 lg:col-span-8">
            {cities.map((c) => (
              <li key={c} className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-2 text-sm shadow-[0_0_0_1px_var(--border)]">
                <MapPin weight="duotone" className="size-3.5 text-muted-foreground" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="headline">Interested? Send us your CV or call.</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={`mailto:${site.email}?subject=Job application`}>
              <EnvelopeSimple weight="bold" /> {site.email}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={site.phoneHref}>
              <Phone weight="bold" /> {site.phoneDisplay}
            </a>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
