import { useEffect, useState } from "react";
import { Check, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import SiteLayout from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import company from "@/content/company.json";
import { getJSON } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings";

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

const details = (j) => [j.location, j.employmentType, j.experience && `Experience: ${j.experience}`, j.vacancies && `Vacancies: ${j.vacancies}`].filter(Boolean);

export default function CareersPage() {
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
          <h1 className="display-page mt-6 max-w-[20ch] text-balance">Build a career in finance across Madhya Pradesh.</h1>
          <p className="lede mt-6 max-w-2xl">{introParagraphs[1]}</p>
        </section>
      </BackgroundPaths>

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2 max-w-[22ch]">Why people join Probiz.</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <li key={p.title} className="rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)]">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-t border-border">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-2">{jobs?.length ? `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}.` : "Open roles."}</h2>
            <p className="mt-4 text-muted-foreground">Quote the job ID in your email subject when you apply, so your CV reaches the right hiring manager.</p>
          </div>
          <div className="lg:col-span-8">
            {!jobs ? (
              <div className="grid gap-4" aria-busy="true" aria-label="Loading open roles">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="rounded-2xl bg-secondary/60 p-6 text-foreground/85">
                {failed ? "We couldn't load open roles just now. Refresh the page, or email us your CV." : "There are no open roles right now. Send us your CV and we'll get in touch when something fits."}
              </p>
            ) : (
          <Accordion type="single" collapsible defaultValue={jobs[0].id}>
            {jobs.map((r) => (
              <AccordionItem key={r.id} value={r.id} className="border-border">
                <AccordionTrigger className="py-6">
                  <span>
                    <span className="block font-mono text-xs tracking-wide text-muted-foreground">
                      {r.jobId} · {r.team}
                    </span>
                    <span className="mt-1 block text-lg font-semibold">{r.title}</span>
                    {r.ctc && <span className="mt-1 block text-sm font-normal text-muted-foreground">{r.ctc}</span>}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pr-0">
                  <p className="text-foreground/85">{r.overview}</p>
                  {details(r).length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {details(r).map((d) => (
                        <li key={d} className="rounded-full bg-secondary px-3 py-1 text-xs">
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6 grid gap-8 sm:grid-cols-2">
                    {[
                      ["What you'll do", r.responsibilities],
                      ["Who we're looking for", r.idealCandidate],
                    ].filter(([, list]) => list.length > 0).map(([title, list]) => (
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
                  <Button asChild className="mt-8">
                    <a href={applyHref(r)}>
                      <EnvelopeSimple weight="bold" /> Apply for {r.jobId}
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
            )}
          </div>
        </div>
      </section>

      {hiringSales && (
      <section className="section border-t border-border bg-secondary/50">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-2">Sales hiring in {cities.length} cities.</h2>
            <p className="mt-4 text-muted-foreground">Two relationship executives per city.</p>
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
      )}

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="display-2">How we hire.</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hiringSteps.map((s, i) => (
              <li key={s.title}>
                <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                <p className="mt-2 font-semibold">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="headline">Don't see your role? Send us your CV anyway.</h2>
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
