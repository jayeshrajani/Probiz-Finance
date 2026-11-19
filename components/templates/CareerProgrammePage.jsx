import Link from "next/link";
import { ArrowRight, Receipt } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import CareersApply from "@/components/careers/CareersApply";
import { ProgrammeDetails, StepList } from "@/components/careers/ProgrammeParts";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { programmeBySlug, programmes } from "@/lib/careers";
import { useT } from "@/lib/i18n";

export default function CareerProgrammePage({ slug }) {
  const t = useT();
  const p = programmeBySlug[slug];
  const others = programmes.filter((o) => o.slug !== slug);

  return (
    <SiteLayout title={p.title} description={p.who} path={`/Careers/${slug}`}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_0%,var(--brand-soft),transparent)]" />
        <div className="container-page relative grid items-start gap-10 pt-10 pb-16 md:pt-14 lg:grid-cols-12 lg:gap-14 lg:pb-24">
          <div className="lg:col-span-7">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Careers", href: "/Careers" }, { label: p.title }]} />
            <p lang="hi" className="mt-8 inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-ink">
              {p.tag}
            </p>
            <h1 className="display-page mt-4 max-w-[18ch] text-balance">{t(p.title)}</h1>
            <p className="lede mt-6 max-w-xl text-pretty">{t(p.who)}</p>
            <Button asChild size="lg" className="mt-8">
              <a href="#apply">
                {t("Apply now")} <ArrowRight weight="bold" />
              </a>
            </Button>
          </div>
          <div className="rounded-[1.75rem] border border-border bg-background p-6 shadow-[0_24px_60px_-40px_oklch(0.21_0.006_286/0.35)] sm:p-8 lg:col-span-5 lg:mt-10">
            <p className="text-sm text-muted-foreground">{t("Pay / package")}</p>
            <p className="headline mt-2 text-brand-ink">{t(p.pay)}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{t(p.payNote)}</p>
            {p.fee && (
              <p className="mt-5 flex gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-relaxed">
                <Receipt weight="duotone" className="mt-0.5 size-5 shrink-0 text-brand-ink" />
                <span>{t(p.fee)}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section border-t border-border bg-secondary/50">
        <div className="container-page">
          <ProgrammeDetails programme={p} />
        </div>
      </section>

      {p.syllabus && (
        <section className="section border-t border-border">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 className="display-2 lg:col-span-4">{t("What the 7 days cover.")}</h2>
            <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
              {p.syllabus.map((s, i) => (
                <li key={s} className="flex gap-4 border-t border-border py-4">
                  <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                  <span className="font-medium">{t(s)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2">{t("How it works.")}</h2>
          <StepList steps={p.steps} />
        </div>
      </section>

      <CareersApply programme={p} title="Apply now." />

      <section className="container-page py-16">
        <h2 className="headline">{t("Other ways to join")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/Careers/${o.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_0_0_1px_var(--border),0_12px_32px_-16px_rgb(0_0_0/0.18)]"
            >
              <span>
                <span lang="hi" className="text-sm text-muted-foreground">
                  {o.tag}
                </span>
                <span className="mt-1 block text-lg font-semibold">{t(o.title)}</span>
              </span>
              <ArrowRight weight="bold" className="size-5 shrink-0 text-brand-ink transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
