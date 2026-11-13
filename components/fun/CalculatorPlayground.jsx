"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import Scene from "@/components/art/Scene";
import EligibilityCalculator from "@/components/calculators/EligibilityCalculator";
import EmiCalculator from "@/components/calculators/EmiCalculator";
import IdvCalculator from "@/components/calculators/IdvCalculator";
import SipCalculator from "@/components/calculators/SipCalculator";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "eligibility", label: "Eligibility", title: "How much can I borrow?", scene: "calc", href: "/eligibility", Tool: EligibilityCalculator },
  { id: "emi", label: "EMI", title: "What will I pay each month?", scene: "transfer", href: "/homeloan#emi", Tool: EmiCalculator },
  { id: "sip", label: "SIP", title: "What could my SIP grow to?", scene: "growth", href: "/sipcalculator", Tool: SipCalculator },
  { id: "idv", label: "Car IDV", title: "What is my car insured for?", scene: "motor", href: "/idvcalculator", Tool: IdvCalculator },
];

export default function CalculatorPlayground() {
  const [active, setActive] = useState("eligibility");
  const tool = TOOLS.find((t) => t.id === active);
  const { Tool } = tool;

  return (
    <div className="mt-12 overflow-hidden rounded-[2.25rem] border border-border bg-background/90 shadow-[0_50px_120px_-70px_oklch(0.21_0.006_286/0.5)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-3 sm:p-4">
        <div role="tablist" aria-label="Calculators" className="flex flex-wrap gap-1 rounded-full bg-secondary p-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`calc-tab-${t.id}`}
              aria-selected={t.id === active}
              aria-controls="calc-panel"
              onClick={() => setActive(t.id)}
              className={cn(
                "relative h-9 rounded-full px-4 text-sm font-medium transition-colors",
                t.id === active ? "text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.id === active && (
                <motion.span layoutId="calc-pill" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <Link href={tool.href} className="inline-flex items-center gap-1 px-2 text-sm font-medium text-brand-ink hover:underline">
          Open full page <ArrowUpRight weight="bold" className="size-3.5" />
        </Link>
      </div>

      <div id="calc-panel" role="tabpanel" aria-labelledby={`calc-tab-${active}`} className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 lg:col-span-12 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-3">
              <p className="text-2xl font-semibold tracking-[-0.025em] text-balance">{tool.title}</p>
              <Scene name={tool.scene} className="mt-6 hidden h-44 w-auto lg:block" />
            </div>
            <div className="lg:col-span-9">
              <Tool />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
