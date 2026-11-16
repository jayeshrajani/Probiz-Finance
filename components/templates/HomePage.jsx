import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calculator, Car, Check, Gauge, PiggyBank, ShieldCheck, Wallet } from "@phosphor-icons/react";
import Scene from "@/components/art/Scene";
import EmiCalculator from "@/components/calculators/EmiCalculator";
import CalculatorPlayground from "@/components/fun/CalculatorPlayground";
import GoalPlanner from "@/components/fun/GoalPlanner";
import MythFlip from "@/components/fun/MythFlip";
import RotatingWord from "@/components/fun/RotatingWord";
import ScoreMeter from "@/components/fun/ScoreMeter";
import DotField from "@/components/kokonutui/dot-field";
import { Compare, MeetProbiz, WhoWeHelp } from "@/components/sections/HomeStory";
import SiteLayout from "@/components/site/SiteLayout";
import { organizationJsonLd } from "@/components/site/Seo";
import SocialLinks from "@/components/site/SocialLinks";
import { Button } from "@/components/ui/button";
import { hrefFor, productBySlug, products, services } from "@/lib/catalog";
import { useT } from "@/lib/i18n";
import { site } from "@/lib/site";

const steps = [
  { title: "Tell us what you need", body: "A few questions about the loan, your income and the property, if there is one. It takes about ten minutes." },
  { title: "Compare real offers", body: "We place your file with the partner banks and NBFCs most likely to say yes, and show you rates and fees side by side." },
  { title: "Apply with help", body: "Upload documents online. An advisor checks them before they reach the lender, so fewer things come back for corrections." },
  { title: "Get your funds", body: "We follow up with the lender through sanction and disbursal, and stay on call for registry, notary and e-stamp work." },
];

const count = (groups) => products.filter((p) => groups.includes(p.group) && !p.hidden && !p.hub).length;
const pick = (slugs) => slugs.map((s) => productBySlug[s]);

const DOORS = [
  { title: "Loans", body: "Home, business, personal, car, gold and more.", scene: "home", href: "/securedloans", n: count(["property", "personal", "business"]), quick: pick(["homeloan", "buisnessloan", "personalloan"]) },
  { title: "Insurance", body: "Health, family, motor and property cover, compared.", scene: "health", href: "/healthInsurance", n: count(["health", "motor"]), quick: pick(["familyinsurance", "carinsurance", "bikeinsurance"]) },
  { title: "Invest", body: "SIPs, pension, child and tax-saving plans.", scene: "growth", href: "/investmentplans", n: count(["invest"]), quick: pick(["sip", "pensionplans", "taxsavinginvestment"]) },
  { title: "Services", body: "CA, registry, e-stamp, marketing and more.", scene: "docs", href: "/ca-services", n: services.length, quick: services.slice(0, 3).map((s) => ({ ...s, href: `/${s.slug}` })) },
];

const QUICK_TOOLS = [
  { href: "/checkfreescore", name: "Free CIBIL score", icon: Gauge },
  { href: "/eligibility", name: "Loan eligibility", icon: Wallet },
  { href: "/homeloan#emi", name: "EMI calculator", icon: Calculator },
  { href: "/sipcalculator", name: "SIP calculator", icon: PiggyBank },
  { href: "/idvcalculator", name: "Car IDV value", icon: Car },
  { href: "/carinsurancecalculator", name: "Car insurance premium", icon: ShieldCheck },
];

function SectionHead({ eyebrow, title, body, className }) {
  const t = useT();
  return (
    <div className={className}>
      {eyebrow && <p className="text-sm font-medium text-brand-ink">{t(eyebrow)}</p>}
      <h2 className="display-2 mt-3 max-w-2xl text-balance">{t(title)}</h2>
      {body && <p className="lede mt-4 max-w-xl">{t(body)}</p>}
    </div>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_88%_20%,var(--brand-soft),transparent),radial-gradient(40%_40%_at_0%_100%,oklch(0.97_0.004_286),transparent)]" />
      <div className="container-page relative grid items-center gap-14 pt-10 pb-20 md:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-28">
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 py-1 pr-3.5 pl-1 text-sm font-medium">
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-brand-ink">{t("Across India")}</span>
            {t("Loans, insurance and paperwork since {year}", { year: site.since })}
          </p>
          <h1 className="display-1 mt-7">
            <RotatingWord words={["Borrow", "Insure", "Invest", "Grow"]} label="Borrow, insure and invest with confidence." className="text-brand-ink" />
            <span aria-hidden className="block">{t("with confidence.")}</span>
          </h1>
          <p className="lede mt-6 max-w-lg text-pretty">
            {t("Home, business and personal loans from leading banks, plus insurance and investments, with the paperwork handled by one team wherever you are.")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/eligibility">{t("Check loan eligibility")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#explore">
                {t("Explore products")} <ArrowRight weight="bold" />
              </a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {["Low CIBIL considered", "Cash income considered"].map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check weight="bold" className="size-3.5 text-brand-ink" />
                {t(item)}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("Free tools, no sign-up")}</p>
            <ul className="mt-3 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
              {QUICK_TOOLS.map(({ href, name, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex h-full items-center gap-2.5 rounded-xl border border-border bg-background/80 px-3 py-2.5 text-sm font-medium transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-ink"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-foreground/80 transition-colors group-hover:bg-background group-hover:text-brand-ink">
                      <Icon weight="duotone" className="size-4.5" />
                    </span>
                    <span className="leading-tight">{t(name)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <SocialLinks className="mt-8" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 lg:col-span-6">
          <div className="relative rounded-[2.5rem] bg-[linear-gradient(160deg,var(--brand-soft),var(--cream)_60%)] p-4 pt-32 sm:p-8 sm:pt-36">
            <Scene name="home" className="pointer-events-none absolute -top-6 right-0 h-48 w-auto sm:-top-8 sm:right-4 sm:h-56" />
            <div className="art-float art-float-3 absolute top-10 left-6 hidden items-center gap-2 rounded-2xl bg-background/95 px-4 py-3 text-sm font-medium shadow-[0_18px_40px_-24px_oklch(0.21_0.006_286/0.45)] sm:flex">
              <span className="size-2 rounded-full bg-brand" /> {t("Move the sliders")}
            </div>
            <div className="relative rounded-[1.75rem] border border-border bg-background p-5 shadow-[0_40px_100px_-56px_oklch(0.21_0.006_286/0.5)] sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-semibold tracking-[-0.015em]">{t("What would your EMI be?")}</p>
                <Link href="/homeloan#apply" className="text-sm font-medium text-brand-ink hover:underline">
                  {t("Apply")}
                </Link>
              </div>
              <EmiCalculator compact defaults={{ amount: 3000000, rate: 8.5, years: 20 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Doors() {
  const t = useT();
  return (
    <section id="explore" className="section border-t border-border">
      <div className="container-page">
        <SectionHead eyebrow="Everything in one place" title="One team for loans, cover and paperwork." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DOORS.map((d) => (
            <article key={d.title} className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_oklch(0.21_0.006_286/0.35)]">
              <div className="relative aspect-[4/3] bg-[linear-gradient(170deg,var(--brand-soft),var(--cream))]">
                <Scene name={d.scene} className="absolute inset-0 m-auto h-[92%] w-[92%] transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium tabular-nums">{t("{n} options", { n: d.n })}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-semibold tracking-[-0.025em]">
                  <Link href={d.href} className="after:absolute after:inset-0">
                    {t(d.title)}
                  </Link>
                </h3>
                <p className="mt-2 text-muted-foreground">{t(d.body)}</p>
                <ul className="relative z-10 mt-5 flex flex-wrap gap-2 sm:gap-1.5">
                  {d.quick.map((q) => (
                    <li key={q.slug}>
                      <Link href={hrefFor(q)} className="inline-flex rounded-full bg-secondary px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors hover:bg-brand-soft hover:text-brand-ink sm:px-3 sm:py-1.5">
                        {t(q.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Planner() {
  return (
    <section className="section border-t border-border bg-cream">
      <div className="container-page">
        <SectionHead eyebrow="Try it" title="What are you planning for?" body="Pick a goal and move the sliders. We'll show what the EMI might look like against your income." />
        <GoalPlanner />
      </div>
    </section>
  );
}

function HardCases() {
  const t = useT();
  return (
    <section className="section border-t border-border">
      <div className="container-page">
        <SectionHead eyebrow="Where we're different" title="We take on the files others turn down." />
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <article className="reveal relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-foreground p-8 text-background md:col-span-2 md:p-10">
            <Scene name="score" bare className="pointer-events-none absolute -right-6 -bottom-10 hidden h-72 w-auto md:block" />
            <p className="relative text-sm text-background/60">{t("Low CIBIL score")}</p>
            <div className="relative mt-16 md:max-w-[60%]">
              <p className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">{t("A low score is a starting point, not a rejection.")}</p>
              <p className="mt-4 text-background/70">{t("We structure applications for borrowers with low or challenged credit, and tell you honestly what will help.")}</p>
            </div>
          </article>
          <article className="reveal flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-brand-soft p-8">
            <p className="text-sm text-brand-ink">{t("Cash income")}</p>
            <Scene name="shop" className="mx-auto my-2 h-32 w-auto" />
            <p className="text-xl font-semibold leading-snug tracking-[-0.02em]">{t("Shop owners and traders paid in cash are considered too.")}</p>
          </article>
          <article className="reveal flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border p-8">
            <p className="text-sm text-muted-foreground">{t("Complex property papers")}</p>
            <Scene name="docs" className="mx-auto my-2 h-32 w-auto" />
            <p className="text-xl font-semibold leading-snug tracking-[-0.02em]">{t("Unclear titles or legal complications, reviewed with our legal team.")}</p>
          </article>
          <article className="reveal grid gap-8 overflow-hidden rounded-[1.75rem] bg-secondary p-8 md:col-span-2 md:grid-cols-[auto_1fr_auto] md:items-end md:p-10">
            <p className="font-display text-[clamp(4rem,3rem+4vw,6.5rem)] font-semibold leading-[0.85] tracking-[-0.05em] text-foreground/90">{site.since}</p>
            <p className="max-w-sm text-muted-foreground md:pb-2">
              {t("The year we started, in Indore. Today we help borrowers across India, and the same team handles registry, notary and e-stamp work too.")}
            </p>
            <Scene name="city" bare className="-mb-10 hidden h-48 w-auto self-end lg:block" />
          </article>
        </div>
      </div>
    </section>
  );
}

function Score() {
  return (
    <section className="section border-t border-border bg-secondary/50">
      <div className="container-page">
        <SectionHead eyebrow="Credit score" title="Where does your score sit?" body="Slide to your CIBIL score, or a guess, to see what lenders make of it and what helps next." className="mb-12" />
        <ScoreMeter />
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useT();
  return (
    <section className="section border-t border-border">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-medium text-brand-ink">{t("How it works")}</p>
            <h2 className="display-2 mt-3 max-w-md">{t("From first call to disbursal.")}</h2>
            <p className="lede mt-5 max-w-sm">{t("Four steps, one advisor, and no chasing the bank yourself.")}</p>
            <Scene name="consult" className="mt-8 hidden h-56 w-auto lg:block" />
          </div>
        </div>
        <ol className="lg:col-span-7">
          {steps.map((s, i) => (
            <li key={s.title} className="reveal grid grid-cols-[3.5rem_1fr] gap-4 border-t border-border py-9 first:border-t-0 first:pt-0">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-soft font-display text-lg font-semibold tabular-nums text-brand-ink">{i + 1}</span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em]">{t(s.title)}</h3>
                <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">{t(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Myths() {
  return (
    <section className="section border-t border-border bg-cream">
      <div className="container-page">
        <SectionHead eyebrow="Myth or fact" title="Money myths, busted." body="Tap a card to see the fact behind six common money myths." />
        <MythFlip className="mt-12" />
      </div>
    </section>
  );
}

function Tools() {
  return (
    <section id="calculators" className="border-t border-border">
      <DotField spacing={18} className="block min-h-0 bg-cream text-brand/50">
        <div className="section relative text-foreground">
          <div className="container-page">
            <SectionHead eyebrow="Free calculators" title="Play with the numbers." body="Four calculators, no sign-up and no phone number. Tap the dots around them, they ripple." />
            <CalculatorPlayground />
          </div>
        </div>
      </DotField>
    </section>
  );
}

function Services() {
  const t = useT();
  return (
    <section className="section border-t border-border">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-sm font-medium text-brand-ink">{t("Beyond loans")}</p>
          <h2 className="display-2 mt-3">{t("More than loans.")}</h2>
          <p className="lede mt-5 max-w-sm">{t("Chartered accountants, legal documentation and marketing for the businesses we fund.")}</p>
        </div>
        <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="group flex items-start gap-4 border-b border-border py-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground/75 transition-colors group-hover:bg-brand-soft group-hover:text-brand-ink">
                    <Icon weight="duotone" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold tracking-[-0.015em]">{t(s.name)}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{t(s.blurb)}</span>
                  </span>
                  <ArrowUpRight weight="bold" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <SiteLayout path="/" jsonLd={organizationJsonLd}>
      <Hero />
      <Doors />
      <MeetProbiz />
      <Tools />
      <WhoWeHelp />
      <HardCases />
      <Planner />
      <Score />
      <Compare />
      <HowItWorks />
      <Myths />
      <Services />
    </SiteLayout>
  );
}
