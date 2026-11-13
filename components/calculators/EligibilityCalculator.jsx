"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import SliderField from "@/components/calculators/SliderField";
import { Button } from "@/components/ui/button";
import { formatINR, formatINRShort, principalForEmi } from "@/lib/format";

// Same rule as the eligibility API: up to 40% of monthly income can go to EMIs.
const FOIR = 0.4;

export default function EligibilityCalculator() {
  const [income, setIncome] = useState(75000);
  const [existing, setExisting] = useState(0);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { maxEmi, maxLoan } = useMemo(() => {
    const room = Math.max(0, income * FOIR - existing);
    return { maxEmi: room, maxLoan: principalForEmi(room, rate, years * 12) };
  }, [income, existing, rate, years]);

  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
      <div className="grid content-start gap-7">
        <SliderField label="Monthly income" value={income} onChange={setIncome} min={10000} max={1000000} step={5000} format={formatINR} />
        <SliderField label="Existing EMIs per month" value={existing} onChange={setExisting} min={0} max={300000} step={1000} format={formatINR} />
        <SliderField label="Interest rate" value={rate} onChange={setRate} min={6} max={24} step={0.05} format={(v) => v.toFixed(2)} suffix="% p.a." />
        <SliderField label="Tenure" value={years} onChange={setYears} min={1} max={30} suffix={years === 1 ? " year" : " years"} />
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-foreground p-7 text-background">
        <div>
          <p className="text-sm text-background/65">You could borrow up to</p>
          <p className="mt-1 font-display text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] font-semibold tracking-[-0.035em] tabular-nums" aria-live="polite">
            {formatINRShort(maxLoan)}
          </p>
          <p className="mt-3 text-sm text-background/65">
            With an EMI of <span className="font-semibold text-background tabular-nums">{formatINR(maxEmi)}</span> a month.
          </p>
        </div>
        <div className="mt-10">
          {maxEmi === 0 ? (
            <p className="text-sm text-background/75">Your current EMIs already use 40% of your income. Talk to us about consolidating them first.</p>
          ) : (
            <p className="text-sm text-background/75">An estimate based on 40% of income going to EMIs. Lenders also weigh your credit score, age and employment.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="brand">
              <Link href="/homeloan#apply">
                Apply for a home loan <ArrowRight weight="bold" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-background hover:bg-background/10">
              <Link href="/personalloan#apply">Personal loan</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
