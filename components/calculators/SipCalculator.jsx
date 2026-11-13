"use client";

import { useMemo, useState } from "react";
import SliderField from "@/components/calculators/SliderField";
import { formatINR, formatINRShort, sipFutureValue } from "@/lib/format";

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { invested, value, gains } = useMemo(() => {
    const inv = monthly * years * 12;
    const fv = sipFutureValue(monthly, rate, years);
    return { invested: inv, value: fv, gains: fv - inv };
  }, [monthly, rate, years]);

  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
      <div className="grid content-start gap-7">
        <SliderField label="Monthly investment" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} format={formatINR} />
        <SliderField label="Expected return" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="% p.a." />
        <SliderField label="Time period" value={years} onChange={setYears} min={1} max={40} suffix={years === 1 ? " year" : " years"} />
      </div>
      <div className="flex flex-col justify-between rounded-2xl bg-secondary p-7">
        <div>
          <p className="text-sm text-muted-foreground">Estimated value</p>
          <p className="mt-1 font-display text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] font-semibold tracking-[-0.035em] tabular-nums" aria-live="polite">
            {formatINRShort(value)}
          </p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-5 text-sm">
          <div>
            <dt className="text-muted-foreground">You invest</dt>
            <dd className="mt-1 font-semibold tabular-nums">{formatINR(invested)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Estimated gains</dt>
            <dd className="mt-1 font-semibold tabular-nums text-brand-ink">{formatINR(gains)}</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Returns are not guaranteed. Mutual fund investments are subject to market risks.
        </p>
      </div>
    </div>
  );
}
