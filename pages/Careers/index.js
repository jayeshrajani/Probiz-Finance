import Link from "next/link";
import { useEffect, useState } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { ArrowRight, Briefcase, Check, Clock, EnvelopeSimple, ListChecks, MapPin, Target, UsersThree } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import CareersApply from "@/components/careers/CareersApply";
import HiringAreas from "@/components/careers/HiringAreas";
import { CheckList, StepList } from "@/components/careers/ProgrammeParts";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import SiteLayout from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getJSON } from "@/lib/api";
import { joiningSteps, programmeBySlug, programmes, whyProbiz } from "@/lib/careers";
import { useT } from "@/lib/i18n";
import { localePropsWith } from "@/lib/i18n-static";
import { useSiteSettings } from "@/lib/site-settings";

export const getStaticProps = localePropsWith("company");

function useOpenJobs() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    let live = true;
    getJSON("jobs").then(({ ok, data }) => {
      if (live && ok && Array.isArray(data.data)) setJobs(data.data);
    });
    return () => {
      live = false;
    };
  }, []);
  return jobs;
}

const facts = (j, t) =>
  [
    [MapPin, j.location],
    [Briefcase, j.employmentType],
    [Clock, j.experience && t("{experience} experience", { experience: j.experience })],
    [UsersThree, j.vacancies && t("Openings: {n}", { n: j.vacancies })],
  ].filter(([, label]) => label);

// Jobs published from the admin panel; the section stays hidden while there are none.
function OpenRoles({ jobs }) {
  const t = useT();
  const { emailHref } = useSiteSettings();
  const applyHref = (j) => `${emailHref}?subject=${encodeURIComponent(`Application: ${j.jobId} - ${j.title}`)}`;
  return (
    <section className="section border-t border-border">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="display-2">{jobs.length === 1 ? t("{n} open role.", { n: jobs.length }) : t("{n} open roles.", { n: jobs.length })}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">{t("Quote the job ID in your email subject when you apply, so your CV reaches the right hiring manager.")}</p>
        </div>
        <Accordion type="single" collapsible className="mt-10 grid gap-4">
          {jobs.map((r) => (
            <AccordionItem
              key={r.id}
              value={r.id}
              className="rounded-2xl border-0 bg-background px-5 shadow-[0_0_0_1px_var(--border)] transition-shadow data-[state=open]:shadow-[0_0_0_1px_var(--border),0_12px_32px_-16px_rgb(0_0_0/0.18)] md:px-8"
            >
              <AccordionTrigger className="py-6 md:py-7">
                <span className="block min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-mono tracking-wide text-muted-foreground">{r.jobId}</span>
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 font-medium text-brand-ink">{r.team}</span>
                  </span>
                  <span className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <span className="text-lg font-semibold text-foreground md:text-xl">{r.title}</span>
                    {r.ctc && <span className="w-fit shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-foreground">{r.ctc}</span>}
                  </span>
                  {facts(r, t).length > 0 && (
                    <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-normal text-muted-foreground">
                      {facts(r, t).map(([Icon, label]) => (
                        <span key={label} className="inline-flex items-center gap-1.5">
                          <Icon weight="duotone" className="size-4 shrink-0" /> {label}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pr-0 pb-6 md:pb-8">
                <div className="border-t border-border pt-6">
                  {r.overview && <p className="max-w-3xl text-foreground/85">{r.overview}</p>}
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      [ListChecks, "What you'll do", r.responsibilities],
                      [Target, "Who we're looking for", r.idealCandidate],
                    ]
                      .filter(([, , list]) => list?.length > 0)
                      .map(([Icon, title, list]) => (
                        <div key={title} className="rounded-xl bg-secondary/50 p-5">
                          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Icon weight="duotone" className="size-4 text-brand-ink" /> {t(title)}
                          </p>
                          <ul className="mt-4 grid gap-2.5">
                            {list.map((x) => (
                              <li key={x} className="flex gap-2.5 text-sm text-foreground/85">
                                <Check weight="bold" className="mt-1 size-3.5 shrink-0 text-brand-ink" /> {x}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                  <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("Email your CV with")} <span className="font-mono text-foreground">{r.jobId}</span> {t("in the subject line.")}
                    </p>
                    <Button asChild className="w-fit">
                      <a href={applyHref(r)}>
                        <EnvelopeSimple weight="bold" /> {t("Apply for {jobId}", { jobId: r.jobId })}
                      </a>
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default function CareersPage() {
  const t = useT();
  const jobs = useOpenJobs();
  // One choice drives both the audience tabs and the form's "I am applying as".
  const [slug, setSlug] = useState(programmes[0].slug);

  return (
    <SiteLayout
      title="Careers"
      description="Build your career in the banking industry with ProBiz Finance. Openings for loan connectors, experienced professionals and freshers across all 55 districts of Madhya Pradesh."
      path="/Careers"
    >
      <BackgroundPaths className="min-h-[520px] justify-start bg-transparent text-brand-ink">
        <section className="container-page relative py-12 text-foreground md:py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Careers" }]} />
          <h1 className="display-page mt-6 max-w-[22ch] text-balance">
            <span lang="hi" className="block text-brand-ink">
              हमारे साथ जुड़िए
            </span>
            {t("Build your career in the banking industry.")}
          </h1>
          <p className="lede mt-6 max-w-2xl">
            {t("We are a DSA working with leading banks and NBFCs, helping families and businesses get home, business and personal loans. Whether you have years of experience or are just starting out, there is a place for you.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#apply">
                {t("Apply now")} <ArrowRight weight="bold" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#areas">
                <MapPin weight="bold" /> {t("Find your city")}
              </a>
            </Button>
          </div>
        </section>
      </BackgroundPaths>

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2">{t("Three ways to join.")}</h2>
          <TabsPrimitive.Root value={slug} onValueChange={setSlug} className="mt-10">
            <TabsPrimitive.List aria-label={t("Choose how you want to join")} className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-1.5">
              {programmes.map((p) => (
                <TabsPrimitive.Trigger
                  key={p.slug}
                  value={p.slug}
                  className="rounded-xl px-2 py-3 text-center text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-brand/25 focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-4 sm:text-base"
                >
                  {t(p.role)}
                  <span lang="hi" className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {p.tag}
                  </span>
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>
            {programmes.map((p) => (
              <TabsPrimitive.Content key={p.slug} value={p.slug} className="mt-6 outline-none">
                <div className="grid gap-8 rounded-[1.75rem] bg-background p-6 shadow-[0_0_0_1px_var(--border)] sm:p-8 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-7">
                    <h3 className="headline">{t(p.title)}</h3>
                    <p className="mt-3 text-muted-foreground">{t(p.who)}</p>
                    <CheckList items={p.get} className="mt-6 grid gap-3 sm:grid-cols-2" />
                  </div>
                  <div className="flex flex-col justify-between gap-6 rounded-2xl bg-secondary/60 p-6 lg:col-span-5">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("Pay / package")}</p>
                      <p className="headline mt-2 text-brand-ink">{t(p.pay)}</p>
                      <p className="mt-2 text-sm text-foreground/85">{t(p.payNote)}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <a href="#apply">
                          {t("Apply now")} <ArrowRight weight="bold" />
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/Careers/${p.slug}`}>{t("Full details")}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsPrimitive.Content>
            ))}
          </TabsPrimitive.Root>
        </div>
      </section>

      <section className="section border-t border-border bg-secondary/50">
        <div className="container-page">
          <h2 className="display-2 max-w-[22ch]">{t("Why work with ProBiz.")}</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyProbiz.map((p) => (
              <li key={p.title} className="rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)]">
                <p className="font-semibold">{t(p.title)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(p.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2">{t("How joining works.")}</h2>
          <StepList steps={joiningSteps} />
        </div>
      </section>

      <HiringAreas />

      {jobs.length > 0 && <OpenRoles jobs={jobs} />}

      <CareersApply programme={programmeBySlug[slug]} onProgrammeChange={setSlug} title="Join ProBiz Finance." />
    </SiteLayout>
  );
}
