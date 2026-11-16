import { useEffect, useState } from "react";
import { Briefcase, Check, Clock, EnvelopeSimple, ListChecks, MapPin, Phone, Target, UsersThree } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import SiteLayout from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import company from "@/content/company.json";
import { getJSON } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { localePropsWith } from "@/lib/i18n-static";
import { useSiteSettings } from "@/lib/site-settings";

export const getStaticProps = localePropsWith("company");

function useOpenJobs() {
  const [state, setState] = useState({ jobs: null, failed: false });
  useEffect(() => {
    let live = true;
    getJSON("jobs").then(({ ok, data }) => {
      if (live) setState(ok && Array.isArray(data.data) ? { jobs: data.data, failed: false } : { jobs: [], failed: true });
    });
    return () => {
      live = false;
    };
  }, []);
  return state;
}

const facts = (j, t) =>
  [
    [MapPin, j.location],
    [Briefcase, j.employmentType],
    [Clock, j.experience && t("{experience} experience", { experience: j.experience })],
    [UsersThree, j.vacancies && t("Openings: {n}", { n: j.vacancies })],
  ].filter(([, label]) => label);

export default function CareersPage() {
  const t = useT();
  const { introParagraphs, cities, perks, hiringSteps } = company.careers;
  const { primary, contactEmail, emailHref } = useSiteSettings();
  const { jobs, failed } = useOpenJobs();
  const hiringSales = jobs?.some((j) => j.team.toLowerCase() === "sales");
  const applyHref = (j) => `${emailHref}?subject=${encodeURIComponent(`Application: ${j.jobId} - ${j.title}`)}`;

  return (
    <SiteLayout title="Careers" description="Probiz Finance is hiring across Madhya Pradesh. See open roles, job IDs and how to apply." path="/Careers">
      <BackgroundPaths className="min-h-[520px] justify-start bg-transparent text-brand-ink">
        <section className="container-page relative py-12 text-foreground md:py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Careers" }]} />
          <h1 className="display-page mt-6 max-w-[20ch] text-balance">{t("Build a career in finance across Madhya Pradesh.")}</h1>
          <p className="lede mt-6 max-w-2xl">{t(introParagraphs[1])}</p>
        </section>
      </BackgroundPaths>

      <section className="section border-t border-border">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="display-2">
              {jobs?.length
                ? jobs.length === 1
                  ? t("{n} open role.", { n: jobs.length })
                  : t("{n} open roles.", { n: jobs.length })
                : t("Open roles.")}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("Quote the job ID in your email subject when you apply, so your CV reaches the right hiring manager.")}</p>
          </div>
          <div className="mt-10">
            {!jobs ? (
              <div className="grid gap-4" aria-busy="true" aria-label={t("Loading open roles")}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="rounded-2xl bg-secondary/60 p-6 text-foreground/85">
                {failed ? t("We couldn't load open roles just now. Refresh the page, or email us your CV.") : t("There are no open roles right now. Send us your CV and we'll get in touch when something fits.")}
              </p>
            ) : (
          <Accordion type="single" collapsible defaultValue={jobs[0].id} className="grid gap-4">
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
                      {r.ctc && (
                        <span className="w-fit shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-foreground">{r.ctc}</span>
                      )}
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
            )}
          </div>
        </div>
      </section>

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2 max-w-[22ch]">{t("Why people join Probiz.")}</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <li key={p.title} className="rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)]">
                <p className="font-semibold">{t(p.title)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(p.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {hiringSales && (
      <section className="section border-t border-border bg-secondary/50">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-2">{t("Sales hiring in {n} cities.", { n: cities.length })}</h2>
            <p className="mt-4 text-muted-foreground">{t("Two relationship executives per city.")}</p>
          </div>
          <ul className="flex flex-wrap content-start gap-2 lg:col-span-8">
            {cities.map((c) => (
              <li key={c} className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-2 text-sm shadow-[0_0_0_1px_var(--border)]">
                <MapPin weight="duotone" className="size-3.5 text-muted-foreground" /> {t(c)}
              </li>
            ))}
          </ul>
        </div>
      </section>
      )}

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2">{t("How we hire.")}</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hiringSteps.map((s, i) => (
              <li key={s.title}>
                <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                <p className="mt-2 font-semibold">{t(s.title)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="headline">{t("Don't see your role? Send us your CV anyway.")}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={`${emailHref}?subject=Job application`}>
              <EnvelopeSimple weight="bold" /> {contactEmail}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={primary.href}>
              <Phone weight="bold" /> {primary.display}
            </a>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
