import Link from "next/link";
import { ArrowRight, Eye, Handshake, ShieldCheck } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import HalftoneBackground from "@/components/kokonutui/halftone-background";
import InkBackground from "@/components/kokonutui/ink-background";
import TopoBackground from "@/components/kokonutui/topo-background";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import company from "@/content/company.json";
import { site } from "@/lib/site";

const timeline = [
  { year: "2013", text: "ProBiz Finance is founded in Indore, focused on secured loans and financial consultation." },
  { year: "2021", text: "Shubham Gehlot joins as Co-Founder and Director, bringing ten years across corporate sales, consulting, real estate and finance." },
  { year: "Since", text: "Unsecured loans, car loans, credit cards, project funding, real estate, legal assistance and investment planning join the offering." },
  { year: "Today", text: "One team for loans, insurance, investments and paperwork, online at probizfinance.com." },
];

const values = [
  { Icon: Eye, title: "Transparent", body: "Rates, fees and the fine print explained before you sign anything." },
  { Icon: ShieldCheck, title: "Reliable", body: "One advisor who follows your file through to disbursal or policy issue." },
  { Icon: Handshake, title: "Client-focused", body: "Advice built around your income and goals, not around a lender's targets." },
];

export default function AboutPage() {
  const paragraphs = company.about.paragraphs;

  return (
    <SiteLayout title="About Us" description="ProBiz Finance (ProBiz Management Services Pvt. Ltd.) has helped individuals and businesses with loans and financial advice since 2013." path="/about">
      <div className="container-page pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </div>

      <InkBackground
        as="h1"
        text="Trusted since 2013."
        accent="oklch(0.733 0.186 52)"
        className="mt-2 min-h-[520px] bg-transparent text-foreground [--bg-ink:var(--foreground)] [--bg-paper:var(--background)] sm:min-h-[640px]"
      >
        <div className="max-w-2xl text-center">
          <p className="text-xl font-semibold tracking-[-0.02em] text-balance sm:text-2xl">Financial advice for families and businesses across India.</p>
          <p className="lede mt-4 text-pretty">{paragraphs[0]}</p>
          <p className="mt-6 text-sm text-muted-foreground">Drag across the page to write with the ink.</p>
        </div>
      </InkBackground>

      <section className="border-t border-border">
        <TopoBackground labels className="block min-h-0 bg-cream text-brand">
          <div className="section relative text-foreground">
            <div className="container-page grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-sm font-medium text-brand-ink">Our journey</p>
                <h2 className="display-2 mt-3">How we got here.</h2>
              </div>
              <ol className="grid gap-3 lg:col-span-8">
                {timeline.map((t) => (
                  <li key={t.year} className="reveal grid gap-2 rounded-[1.5rem] border border-border/70 bg-background/85 p-6 backdrop-blur-sm sm:grid-cols-[7rem_1fr] sm:gap-8 sm:p-7">
                    <span className="font-display text-2xl font-semibold tracking-[-0.03em] text-brand-ink">{t.year}</span>
                    <p className="max-w-xl leading-relaxed text-foreground/75">{t.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </TopoBackground>
      </section>

      <section className="border-t border-border">
        <HalftoneBackground cell={10} className="min-h-[640px] bg-background text-foreground [--bg-ink:var(--brand)]">
          <div className="container-page relative py-20">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-brand-ink">What we stand for</p>
              <h2 className="display-2 mt-3">Plain advice, done properly.</h2>
              <ul className="mt-10 grid gap-6">
                {values.map(({ Icon, title, body }) => (
                  <li key={title} className="flex gap-4 rounded-2xl bg-background/80 p-1 backdrop-blur-sm">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                      <Icon weight="duotone" className="size-5" />
                    </span>
                    <span>
                      <span className="block text-lg font-semibold tracking-[-0.015em]">{title}</span>
                      <span className="mt-1 block leading-relaxed text-muted-foreground">{body}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">Talk to us</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-background">
                  <Link href="/Careers">
                    Work with us <ArrowRight weight="bold" />
                  </Link>
                </Button>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                {site.address}. Hover the dots to look closer.
              </p>
            </div>
          </div>
        </HalftoneBackground>
      </section>
    </SiteLayout>
  );
}
