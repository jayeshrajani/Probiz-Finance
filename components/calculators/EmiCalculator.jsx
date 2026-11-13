"use client";

import { useMemo, useState } from "react";
import SliderField from "@/components/calculators/SliderField";
import AnimatedNumber from "@/components/fun/AnimatedNumber";
import { emi, formatINR, formatINRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEFAULTS = { amount: 2500000, rate: 8.5, years: 15, maxAmount: 50000000, maxYears: 30 };

export default function EmiCalculator({ defaults, compact = false, className, footer }) {
  const d = { ...DEFAULTS, ...defaults };
  const [amount, setAmount] = useState(d.amount);
  const [rate, setRate] = useState(d.rate);
  const [years, setYears] = useState(d.years);

  const { monthly, interest, total, principalShare } = useMemo(() => {
    const m = emi(amount, rate, years * 12);
    const t = m * years * 12;
    return { monthly: m, total: t, interest: t - amount, principalShare: t ? (amount / t) * 100 : 100 };
  }, [amount, rate, years]);

  const amountStep = d.maxAmount > 10000000 ? 100000 : d.maxAmount > 2000000 ? 50000 : 10000;

  return (
    <div className={cn("grid gap-8", !compact && "md:grid-cols-[1.1fr_1fr] md:gap-12", className)}>
      <div className="grid content-start gap-7">
        <SliderField label="Loan amount" value={amount} onChange={setAmount} min={amountStep * 2} max={d.maxAmount} step={amountStep} format={formatINRShort} />
        <SliderField label="Interest rate" value={rate} onChange={setRate} min={6} max={24} step={0.05} format={(v) => v.toFixed(2)} suffix="% p.a." />
        <SliderField label="Tenure" value={years} onChange={setYears} min={1} max={d.maxYears} step={1} suffix={years === 1 ? " year" : " years"} />
      </div>

      <div className={cn("flex flex-col justify-between rounded-2xl bg-secondary p-6", compact && "p-5")}>
        <div>
          <p className="text-sm text-muted-foreground">Monthly EMI</p>
          <p className="mt-1 font-display text-[clamp(2rem,1.5rem+2vw,2.75rem)] font-semibold tracking-[-0.03em] tabular-nums">
            <AnimatedNumber value={monthly} className="block" aria-hidden />
            <span className="sr-only" aria-live="polite">
              {formatINR(monthly)}
            </span>
          </p>
        </div>
        <div className="mt-6">
          <div className="flex h-2 overflow-hidden rounded-full" aria-hidden>
            <span className="bg-foreground" style={{ width: `${principalShare}%` }} />
            <span className="flex-1 bg-brand" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-foreground" /> Principal
              </dt>
              <dd className="mt-1 font-semibold tabular-nums">{formatINR(amount)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-brand" /> Interest
              </dt>
              <dd className="mt-1 font-semibold tabular-nums">{formatINR(interest)}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Total payable <span className="font-semibold text-foreground tabular-nums">{formatINR(total)}</span>
          </p>
          {footer}
        </div>
      </div>
    </div>
  );
}
