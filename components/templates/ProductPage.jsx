import Link from "next/link";
import { ArrowDown, Check, FileText, Phone } from "@phosphor-icons/react";
import HeroArt from "@/components/art/HeroArt";
import { sceneFor } from "@/components/art/Scene";
import ApplySection from "@/components/blocks/ApplySection";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import Faq from "@/components/blocks/Faq";
import ProductTile from "@/components/blocks/ProductTile";
import EmiCalculator from "@/components/calculators/EmiCalculator";
import SipCalculator from "@/components/calculators/SipCalculator";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { productBySlug, products, relatedTo } from "@/lib/catalog";
import { faqsFor } from "@/lib/faqs";
import { forms } from "@/lib/forms";
import { site } from "@/lib/site";

const GROUPS = {
  property: { label: "Home and property loans", href: "/securedloans" },
  personal: { label: "Personal loans", href: "/securedloans" },
  business: { label: "Business and farm loans", href: "/securedloans" },
  health: { label: "Health and property insurance", href: "/healthInsurance" },
  motor: { label: "Motor insurance", href: "/automobile-insurance" },
  invest: { label: "Investments", href: "/investmentplans" },
};

const APPLY_COPY = {
  loan: { title: "Apply in a few minutes.", intro: "Share the basics now. Documents are optional at this stage." },
  card: {
    title: "Apply in a few minutes.",
    intro: "Tell us about your income and we'll match you with the right card.",
    next: [
      "An advisor reviews your details and calls you.",
      "We suggest cards that match your income and spending.",
      "You choose. We check your documents before they go to the bank.",
    ],
  },
  insurance: {
    title: "Get quotes from several insurers.",
    intro: "Six details, and an advisor will send you options to compare.",
    next: [
      "An advisor calls to understand who needs cover and your budget.",
      "We send quotes from several insurers, side by side.",
      "You choose. We handle the proposal form and policy issue.",
    ],
  },
  investment: {
    title: "Talk to an advisor.",
    intro: "Share your details and we'll call to understand your goals.",
    next: [
      "An advisor calls to understand your goals and timeline.",
      "We suggest plans, with costs, lock-ins and risks explained.",
      "You decide. We handle the paperwork.",
    ],
  },
};

const TONES = [
  "bg-foreground text-background [&_.muted]:text-background/65 [&_.badge]:bg-background/10 [&_.badge]:text-brand",
  "bg-brand-soft [&_.muted]:text-muted-foreground [&_.badge]:bg-background [&_.badge]:text-brand-ink",
  "border border-border bg-background [&_.muted]:text-muted-foreground [&_.badge]:bg-secondary [&_.badge]:text-foreground",
  "bg-cream [&_.muted]:text-muted-foreground [&_.badge]:bg-background [&_.badge]:text-brand-ink",
];

function Highlights({ items }) {
  return (
    <section className="section border-t border-border">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-2 max-w-xl">What you get with Probiz.</h2>
          <p className="max-w-sm text-muted-foreground">One advisor from first call to final paperwork, over the phone wherever you are or at our office.</p>
        </div>
        <ul className={`mt-12 grid gap-4 sm:grid-cols-2 ${items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {items.map((h, i) => (
            <li key={h.title} className={`reveal flex min-h-60 flex-col justify-between rounded-[1.75rem] p-7 ${TONES[i % TONES.length]}`}>
              <span className="badge inline-flex size-10 items-center justify-center rounded-full font-display text-sm font-semibold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-10">
                <p className="text-xl font-semibold tracking-[-0.02em]">{h.title}</p>
                <p className="muted mt-2 leading-relaxed">{h.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Documents({ files }) {
  return (
    <section className="border-t border-border bg-cream">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-4">
          <h2 className="headline">Keep these handy.</h2>
          <p className="mt-3 max-w-sm text-muted-foreground">Uploading is optional when you apply. Your advisor confirms the exact list for your lender.</p>
        </div>
        <ul className="flex flex-wrap gap-2.5 lg:col-span-8">
          {files.map((f) => (
            <li key={f.name} className="inline-flex items-center gap-2.5 rounded-full bg-background px-4 py-2.5 text-sm font-medium shadow-[0_0_0_1px_var(--border)]">
              <FileText weight="duotone" className="size-4 text-brand-ink" />
              {f.label}
              {f.showIf && <span className="font-normal text-muted-foreground">if applicable</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function ProductPage({ slug }) {
  const product = productBySlug[slug];
  const group = GROUPS[product.group];
  const children = product.hub ? products.filter((p) => p.group === product.group && !p.hub && !p.hidden) : [];
  const related = product.hub ? [] : relatedTo(product);
  const applyCopy = APPLY_COPY[product.kind] || APPLY_COPY.loan;
  const hasEmi = product.calculator && typeof product.calculator === "object";
  const files = forms[product.form]?.files || [];
  const chips = [...(product.facts || []), ...product.highlights.map((h) => ({ label: h.title }))];

  return (
    <SiteLayout title={product.title} description={product.description} path={`/${slug}`}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_0%,var(--brand-soft),transparent)]" />
        <div className="container-page relative grid items-center gap-12 pt-10 pb-16 md:pt-14 lg:grid-cols-12 lg:gap-16 lg:pb-24">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 lg:col-span-6">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, ...(product.hub ? [] : [{ label: group.label, href: group.href }]), { label: product.name }]} />
            <h1 className="display-page mt-6 max-w-[18ch] text-balance">{product.headline}</h1>
            <p className="lede mt-6 max-w-xl text-pretty">{product.summary}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#apply">{product.kind === "loan" || product.kind === "card" ? "Apply now" : "Get started"}</a>
              </Button>
              {hasEmi ? (
                <Button asChild size="lg" variant="outline">
                  <a href="#emi">
                    Calculate EMI <ArrowDown weight="bold" />
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <a href={site.phoneHref}>
                    <Phone weight="bold" /> Call us
                  </a>
                </Button>
              )}
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["No credit check to start", "One advisor, start to finish", `Trusted since ${site.since}`].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Check weight="bold" className="size-3.5 text-brand-ink" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 lg:col-span-6">
            <HeroArt scene={sceneFor(product)} chips={chips} />
          </div>
        </div>
      </section>

      {children.length > 0 && (
        <section className="section border-t border-border">
          <div className="container-page">
            <h2 className="display-2 max-w-2xl">{product.kind === "investment" ? "Choose the plan that fits." : "Choose the cover that fits."}</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {children.map((c) => (
                <ProductTile key={c.slug} item={c} blurb={c.headline} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Highlights items={product.highlights} />

      {hasEmi && (
        <section id="emi" className="section border-t border-border bg-secondary/50">
          <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <h2 className="display-2">Work out your EMI.</h2>
              <p className="lede mt-4">Move the sliders to see your monthly payment.</p>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                The rate shown is an example. Your offer depends on your income, credit history and lender.
              </p>
            </div>
            <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_40px_100px_-60px_oklch(0.21_0.006_286/0.4)] sm:p-10 lg:col-span-8">
              <EmiCalculator defaults={product.calculator} />
            </div>
          </div>
        </section>
      )}

      {product.calculator === "sip" && (
        <section id="calculator" className="section border-t border-border bg-secondary/50">
          <div className="container-page">
            <h2 className="display-2">See what a monthly SIP could grow to.</h2>
            <div className="mt-12 rounded-[2rem] border border-border bg-background p-6 sm:p-10">
              <SipCalculator />
            </div>
          </div>
        </section>
      )}

      {files.length > 0 && <Documents files={files} />}

      <ApplySection
        title={applyCopy.title}
        intro={applyCopy.intro}
        formKey={product.form}
        preset={product.preset}
        productName={product.name}
        next={applyCopy.next}
      />

      <Faq items={faqsFor(product)} />

      {related.length > 0 && (
        <section className="section border-t border-border">
          <div className="container-page">
            <div className="flex items-end justify-between gap-6">
              <h2 className="headline">More {group.label.toLowerCase()}</h2>
              <Link href={group.href} className="text-sm font-medium text-brand-ink hover:underline">
                See all
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ProductTile key={r.slug} item={r} blurb={r.headline} art={product.kind === "loan"} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
