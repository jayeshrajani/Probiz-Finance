"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import Scene from "@/components/art/Scene";
import SliderField from "@/components/calculators/SliderField";
import AnimatedNumber from "@/components/fun/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { emi, formatINRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

// Example rates only; real offers depend on the lender and the borrower.
const GOALS = [
  { id: "home", label: "A home", scene: "home", cost: [1000000, 30000000, 100000, 5000000], rate: 8.5, years: 20, down: 0.2, href: "/homeloan" },
  { id: "car", label: "A car", scene: "car", cost: [300000, 5000000, 50000, 1000000], rate: 9.5, years: 5, down: 0.15, href: "/carloan" },
  { id: "study", label: "Studies", scene: "education", cost: [200000, 10000000, 100000, 1500000], rate: 10.5, years: 10, down: 0, href: "/educationloan" },
  { id: "business", label: "The business", scene: "shop", cost: [200000, 20000000, 100000, 2000000], rate: 14, years: 5, down: 0, href: "/buisnessloan" },
  { id: "personal", label: "A big day", scene: "wallet", cost: [100000, 4000000, 50000, 500000], rate: 12, years: 5, down: 0, href: "/personalloan" },
];

const ZONES = [
  { upTo: 0.3, label: "Comfortable", note: "This EMI leaves healthy room in your monthly budget." },
  { upTo: 0.5, label: "Stretching", note: "Doable for many lenders, but it will feel tight. A longer tenure or co-applicant can help." },
  { upTo: Infinity, label: "Tough", note: "Most lenders would hesitate. Try a smaller amount, a bigger down payment or a co-applicant." },
];

export default function GoalPlanner() {
  const [goalId, setGoalId] = useState("home");
  const goal = GOALS.find((g) => g.id === goalId);
  const [costs, setCosts] = useState(() => Object.fromEntries(GOALS.map((g) => [g.id, g.cost[3]])));
  const [income, setIncome] = useState(100000);

  const cost = costs[goalId];
  const loan = Math.round(cost * (1 - goal.down));
  const monthly = emi(loan, goal.rate, goal.years * 12);
  const ratio = monthly / income;
  const zone = ZONES.find((z) => ratio <= z.upTo);
  const marker = Math.min(ratio / 0.7, 1) * 100;

  return (
    <div className="mt-12">
      <div role="group" aria-label="Choose a goal" className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={g.id === goalId}
            onClick={() => setGoalId(g.id)}
            className={cn(
              "group relative min-w-[9.5rem] snap-start overflow-hidden rounded-[1.5rem] border p-3 pb-4 text-left transition-[border-color,background-color,transform] duration-300 active:scale-[0.98]",
              g.id === goalId ? "border-brand bg-brand-soft" : "border-border bg-background hover:border-foreground/20"
            )}
          >
            <Scene name={g.scene} className="mx-auto h-24 w-full transition-transform duration-500 group-hover:scale-[1.04]" />
            <span className="mt-1 block px-1 font-semibold tracking-[-0.015em]">{g.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="grid content-start gap-7 rounded-[2rem] border border-border bg-background p-6 sm:p-8 lg:col-span-6">
          <SliderField
            label={goal.down ? "Price" : "Amount you need"}
            value={cost}
            min={goal.cost[0]}
            max={goal.cost[1]}
            step={goal.cost[2]}
            format={formatINRShort}
            onChange={(v) => setCosts((c) => ({ ...c, [goalId]: v }))}
          />
          <SliderField label="Your monthly income" value={income} min={20000} max={500000} step={5000} format={formatINRShort} onChange={setIncome} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {goal.down ? `Assumes ${goal.down * 100}% down payment, so a loan of ${formatINRShort(loan)}. ` : ""}
            Example rate {goal.rate}% over {goal.years} years.
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden rounded-[1.5rem] bg-cream lg:block"
            >
              <Scene name={goal.scene} className="mx-auto h-44 w-auto" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col justify-between gap-8 rounded-[2rem] bg-foreground p-6 text-background sm:p-8 lg:col-span-6">
          <div>
            <p className="text-sm text-background/60">Estimated EMI</p>
            <p className="mt-2 font-display text-[clamp(2.5rem,2rem+2vw,3.75rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
              <AnimatedNumber value={monthly} />
            </p>
            <p className="mt-2 text-sm text-background/60">
              That's {Math.round(ratio * 100)}% of your income.
            </p>
          </div>

          <div>
            <div className="relative h-3 rounded-full bg-[linear-gradient(90deg,oklch(0.8_0.12_70)_0%,var(--brand)_55%,oklch(0.58_0.2_35)_100%)]">
              <span className="absolute top-1/2 left-[43%] h-5 w-px -translate-y-1/2 bg-background/50" />
              <span className="absolute top-1/2 left-[71%] h-5 w-px -translate-y-1/2 bg-background/50" />
              <motion.span
                className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-foreground bg-background shadow"
                animate={{ left: `${marker}%` }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-background/50">
              <span>Comfortable</span>
              <span>Stretching</span>
              <span>Tough</span>
            </div>
            <p className="mt-6 text-lg font-semibold tracking-[-0.015em]" aria-live="polite">
              {zone.label}. <span className="font-normal text-background/70">{zone.note}</span>
            </p>
            <Button asChild variant="brand" className="mt-6">
              <Link href={goal.href}>
                Explore this loan <ArrowRight weight="bold" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
