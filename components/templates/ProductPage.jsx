import Link from "next/link";
import { ArrowDown, Check, FileText, Phone } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import Faq from "@/components/blocks/Faq";
import ProductTile from "@/components/blocks/ProductTile";
import EmiCalculator from "@/components/calculators/EmiCalculator";
import SipCalculator from "@/components/calculators/SipCalculator";
import ApplicationForm from "@/components/forms/ApplicationForm";
import SiteLayout from "@/components/site/SiteLayout";
import { productBySlug, products, relatedTo } from "@/lib/catalog";
import { faqsFor } from "@/lib/faqs";
import { forms } from "@/lib/forms";
import { useT } from "@/lib/i18n";
import { site } from "@/lib/site";
import { useSiteSettings } from "@/lib/site-settings";

const GROUPS = {
  property: { label: "Home and property loans", href: "/securedloans" },
  personal: { label: "Personal finance", href: "/securedloans" },
  business: { label: "Business and farm loans", href: "/securedloans" },
  health: { label: "Health and property insurance", href: "/healthInsurance" },
  motor: { label: "Motor insurance", href: "/automobile-insurance" },
  invest: { label: "Investments", href: "/investmentplans" },
};

const APPLY_COPY = {
  loan: {
    next: [
      "An advisor reviews your details and calls you to discuss your options.",
      "We compare offers from our partner banks and NBFCs.",
      "You choose. We handle the paperwork through to disbursal.",
    ],
  },
  card: {
    next: [
      "An advisor reviews your details and calls you.",
      "We suggest cards that match your income and spending.",
      "You choose. We check your documents before they go to the bank.",
    ],
  },
  insurance: {
    next: [
      "An advisor calls to understand who needs cover and your budget.",
      "We send quotes from several insurers, side by side.",
      "You choose. We handle the proposal form and policy issue.",
    ],
  },
  investment: {
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
  const t = useT();
  return (
    <section className="section border-t border-border">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-2 max-w-xl">{t("What you get with Probiz.")}</h2>
          <p className="max-w-sm text-muted-foreground">{t("One advisor from first call to final paperwork, over the phone wherever you are or at our office.")}</p>
        </div>
        <ul className={`mt-12 grid gap-4 sm:grid-cols-2 ${items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {items.map((h, i) => (
            <li key={h.title} className={`reveal flex min-h-60 flex-col justify-between rounded-[1.75rem] p-7 ${TONES[i % TONES.length]}`}>
              <span className="badge inline-flex size-10 items-center justify-center rounded-full font-display text-sm font-semibold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-10">
                <p className="text-xl font-semibold tracking-[-0.02em]">{t(h.title)}</p>
                <p className="muted mt-2 leading-relaxed">{t(h.body)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Documents({ files }) {
  const t = useT();
  return (
    <section className="border-t border-border bg-cream">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-4">
          <h2 className="headline">{t("Keep these handy.")}</h2>
          <p className="mt-3 max-w-sm text-muted-foreground">{t("Uploading is optional when you apply. Your advisor confirms the exact list for your lender.")}</p>
        </div>
        <ul className="flex flex-wrap gap-2.5 lg:col-span-8">
          {files.map((f) => (
            <li key={f.name} className="inline-flex items-center gap-2.5 rounded-full bg-background px-4 py-2.5 text-sm font-medium shadow-[0_0_0_1px_var(--border)]">
              <FileText weight="duotone" className="size-4 text-brand-ink" />
              {t(f.label)}
              {f.showIf && <span className="font-normal text-muted-foreground">{t("if applicable")}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function ProductPage({ slug }) {
  const t = useT();
  const product = productBySlug[slug];
  const { primary } = useSiteSettings();
  const group = GROUPS[product.group];
  const children = product.hub ? products.filter((p) => p.group === product.group && !p.hub && !p.hidden) : [];
  const related = product.hub ? [] : relatedTo(product);
  const applyCopy = APPLY_COPY[product.kind] || APPLY_COPY.loan;
  const hasEmi = product.calculator && typeof product.calculator === "object";
  const files = forms[product.form]?.files || [];

  return (
    <SiteLayout title={product.title} description={product.description} path={`/${slug}`}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_0%,var(--brand-soft),transparent)]" />
        <div className="container-page relative grid items-start gap-10 pt-10 pb-16 md:pt-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0 lg:pb-24">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:pt-2">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, ...(product.hub ? [] : [{ label: group.label, href: group.href }]), { label: product.name }]} />
            <h1 className="display-page mt-6 max-w-[18ch] text-balance">{t(product.headline)}</h1>
            <p className="lede mt-6 max-w-xl text-pretty">{t(product.summary)}</p>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {[t("No credit check to start"), t("One advisor, start to finish"), t("Trusted since {year}", { year: site.since })].map((line) => (
                <li key={line} className="inline-flex items-center gap-2">
                  <Check weight="bold" className="size-3.5 text-brand-ink" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div id="apply" className="animate-in fade-in slide-in-from-bottom-4 scroll-mt-24 duration-1000 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <ApplicationForm
              formKey={product.form}
              preset={product.preset}
              productName={product.name}
              className="shadow-[0_24px_60px_-40px_oklch(0.21_0.006_286/0.35)]"
            />
          </div>
          {/* After the form on phones, beside it on desktop. */}
          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <ol className="grid gap-4 lg:mt-10">
              {applyCopy.next.map((line, i) => (
                <li key={line} className="flex gap-3.5">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold tabular-nums shadow-[0_0_0_1px_var(--border)]">
                    {i + 1}
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{t(line)}</p>
                </li>
              ))}
            </ol>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={primary.href}
                className="inline-flex items-center gap-3 rounded-full bg-background px-5 py-3 text-sm shadow-[0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
              >
                <Phone weight="duotone" className="size-5 text-brand-ink" />
                <span>
                  {t("Prefer to talk?")} <span className="font-semibold">{primary.display}</span>
                </span>
              </a>
              {hasEmi && (
                <a
                  href="#emi"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-brand-ink transition-colors hover:bg-accent"
                >
                  {t("Calculate EMI")} <ArrowDown weight="bold" className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {children.length > 0 && (
        <section className="section border-t border-border">
          <div className="container-page">
            <h2 className="display-2 max-w-2xl">{product.kind === "investment" ? t("Choose the plan that fits.") : t("Choose the cover that fits.")}</h2>
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
              <h2 className="display-2">{t("Work out your EMI.")}</h2>
              <p className="lede mt-4">{t("Move the sliders to see your monthly payment.")}</p>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {t("The rate shown is an example. Your offer depends on your income, credit history and lender.")}
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
            <h2 className="display-2">{t("See what a monthly SIP could grow to.")}</h2>
            <div className="mt-12 rounded-[2rem] border border-border bg-background p-6 sm:p-10">
              <SipCalculator />
            </div>
          </div>
        </section>
      )}

      {files.length > 0 && <Documents files={files} />}

      <Faq items={faqsFor(product)} />

      {related.length > 0 && (
        <section className="section border-t border-border">
          <div className="container-page">
            <div className="flex items-end justify-between gap-6">
              <h2 className="headline">{t("More {group}", { group: t(group.label).toLowerCase() })}</h2>
              <Link href={group.href} className="text-sm font-medium text-brand-ink hover:underline">
                {t("See all")}
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
