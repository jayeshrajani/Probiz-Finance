"use client";

import Link from "next/link";
import { useRef } from "react";
import { useInView } from "motion/react";
import { ArrowRight, Check, X } from "@phosphor-icons/react";
import Scene from "@/components/art/Scene";
import AnimatedNumber from "@/components/fun/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { products, services } from "@/lib/catalog";
import { site } from "@/lib/site";

const productCount = products.filter((p) => !p.hidden && !p.hub).length;
const plain = (v) => Math.round(v).toString();

function Counter({ value, suffix = "", label }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-15% 0px" });
  return (
    <div ref={ref} className="border-t border-border pt-5">
      <p className="font-display text-[clamp(2.5rem,2rem+2vw,3.75rem)] leading-none font-semibold tracking-[-0.045em] tabular-nums">
        <AnimatedNumber value={seen ? value : 0} format={plain} aria-hidden />
        <span className="sr-only">{value}</span>
        {suffix && <span className="text-brand">{suffix}</span>}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function MeetProbiz() {
  const years = new Date().getFullYear() - site.since;
  return (
    <section className="section border-t border-border">
      <div className="container-page grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-sm font-medium text-brand-ink">Meet Probiz</p>
          <h2 className="display-2 mt-3 max-w-[18ch] text-balance">One advisor with a bank's worth of options.</h2>
          <div className="mt-8 grid max-w-2xl gap-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              ProBiz Management Services started in Indore in {site.since} with secured loans and financial consultation, and now works
              with borrowers across India. We work as a DSA: we don't lend our own money, we match you with the bank or NBFC most likely
              to approve you and handle the file until the money arrives.
            </p>
            <p>
              In 2021 Shubham Gehlot joined as Co-Founder and Director, bringing ten years across corporate sales, consulting, real
              estate and finance. Since then we've added personal and car loans, credit cards, insurance, investments, and the
              legal and CA work that usually sits around a loan.
            </p>
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/about">
                Our story <ArrowRight weight="bold" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/Careers">We're hiring</Link>
            </Button>
          </div>
        </div>
        <div className="grid content-between gap-10 lg:col-span-5">
          <Scene name="city" className="mx-auto hidden h-56 w-auto lg:block" />
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <Counter value={years} suffix="+" label="Years in business" />
            <Counter value={productCount} label="Loans, covers and plans to compare" />
            <Counter value={services.length} label="Services beyond the loan itself" />
            <Counter value={1} label="Advisor for your whole file" />
          </div>
        </div>
      </div>
    </section>
  );
}

const PEOPLE = [
  { title: "Salaried professionals", body: "Personal loans, home loans and credit cards on your salary slips.", scene: "wallet", href: "/personalloan" },
  { title: "Shop owners and traders", body: "Business loans that count cash income and GST returns.", scene: "shop", href: "/buisnessloan" },
  { title: "First-time home buyers", body: "Plot, flat and construction loans, with the legal checks done.", scene: "home", href: "/homeloan" },
  { title: "Farmers", body: "Kisan credit cards and loans against farmland.", scene: "farm", href: "/kisancreditcard" },
  { title: "Students and parents", body: "Education loans for India and abroad.", scene: "education", href: "/educationloan" },
  { title: "Families", body: "Health and motor cover compared across insurers.", scene: "health", href: "/healthInsurance" },
];

export function WhoWeHelp() {
  return (
    <section className="section border-t border-border">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-brand-ink">Who we help</p>
            <h2 className="display-2 mt-3 max-w-2xl text-balance">Built for the way India earns.</h2>
          </div>
          <p className="max-w-sm text-muted-foreground">Salary, cash, crops or a business: we know which lenders take which kind of income.</p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PEOPLE.map((p, i) => (
            <li key={p.title}>
              <Link
                href={p.href}
                className={`group flex h-full items-center gap-5 rounded-[1.75rem] p-5 pr-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-36px_oklch(0.21_0.006_286/0.4)] ${
                  i % 3 === 1 ? "bg-brand-soft" : i % 3 === 2 ? "bg-cream" : "bg-secondary/70"
                }`}
              >
                <Scene name={p.scene} bare className="h-24 w-28 shrink-0 transition-transform duration-500 group-hover:scale-105" />
                <span className="min-w-0">
                  <span className="block text-lg font-semibold tracking-[-0.02em]">{p.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{p.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const ROWS = [
  ["Which lenders to approach", "Guess, and apply to several", "Shortlisted for your profile"],
  ["Paperwork", "Back and forth with the branch", "Checked before it reaches the lender"],
  ["Credit enquiries", "One per application", "Only where approval is likely"],
  ["Low score or cash income", "Often a flat no", "Lenders who consider it"],
  ["Registry, notary, e-stamp", "Separate people to find", "Same team, same office"],
];

export function Compare() {
  return (
    <section className="section border-t border-border bg-secondary/50">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-sm font-medium text-brand-ink">Why use an advisor</p>
          <h2 className="display-2 mt-3 text-balance">On your own, or with Probiz.</h2>
          <p className="lede mt-5">Same banks, same products. The difference is who does the legwork.</p>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-background lg:col-span-8">
          <div className="grid grid-cols-2 border-b border-border bg-secondary/60 text-sm font-medium sm:grid-cols-[1.1fr_1fr_1fr]">
            <span className="hidden p-4 sm:block sm:px-6" />
            <span className="p-4 text-muted-foreground sm:px-6">On your own</span>
            <span className="p-4 text-brand-ink sm:px-6">With Probiz</span>
          </div>
          {ROWS.map(([topic, alone, us]) => (
            <div key={topic} className="grid grid-cols-2 border-b border-border text-sm last:border-0 sm:grid-cols-[1.1fr_1fr_1fr] sm:text-[0.9375rem]">
              <span className="col-span-2 p-4 pb-0 font-medium sm:col-span-1 sm:px-6 sm:pb-4">{topic}</span>
              <span className="flex gap-2 p-4 text-muted-foreground sm:px-6">
                <X weight="bold" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" /> {alone}
              </span>
              <span className="flex gap-2 p-4 sm:px-6">
                <Check weight="bold" className="mt-0.5 size-3.5 shrink-0 text-brand-ink" /> {us}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
