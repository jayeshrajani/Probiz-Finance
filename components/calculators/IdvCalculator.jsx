"use client";

import { useMemo, useState } from "react";
import SliderField from "@/components/calculators/SliderField";
import { NativeSelect } from "@/components/ui/native-select";
import { formatINR } from "@/lib/format";

// IRDAI depreciation schedule used to set a vehicle's IDV.
const AGE_BANDS = [
  { label: "Up to 6 months", rate: 0.05 },
  { label: "6 months to 1 year", rate: 0.15 },
  { label: "1 to 2 years", rate: 0.2 },
  { label: "2 to 3 years", rate: 0.3 },
  { label: "3 to 4 years", rate: 0.4 },
  { label: "4 to 5 years", rate: 0.5 },
  { label: "Older than 5 years", rate: null },
];

export default function IdvCalculator() {
  const [price, setPrice] = useState(800000);
  const [accessories, setAccessories] = useState(0);
  const [band, setBand] = useState(2);

  const rate = AGE_BANDS[band].rate;
  const idv = useMemo(() => (rate === null ? null : (price + accessories) * (1 - rate)), [price, accessories, rate]);

  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
      <div className="grid content-start gap-7">
        <SliderField label="Ex-showroom price" value={price} onChange={setPrice} min={30000} max={5000000} step={10000} format={formatINR} />
        <SliderField label="Fitted accessories" value={accessories} onChange={setAccessories} min={0} max={500000} step={5000} format={formatINR} />
        <div className="grid gap-2">
          <label htmlFor="idv-age" className="text-sm text-muted-foreground">
            Vehicle age
          </label>
          <NativeSelect id="idv-age" value={band} onChange={(e) => setBand(Number(e.target.value))}>
            {AGE_BANDS.map((b, i) => (
              <option key={b.label} value={i}>
                {b.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="flex flex-col justify-between rounded-2xl bg-secondary p-7">
        <div>
          <p className="text-sm text-muted-foreground">Insured declared value</p>
          <p className="mt-1 font-display text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] font-semibold tracking-[-0.035em] tabular-nums" aria-live="polite">
            {idv === null ? "By agreement" : formatINR(idv)}
          </p>
        </div>
        <p className="mt-10 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
          {idv === null
            ? "For vehicles older than five years, IDV is agreed between you and the insurer based on the vehicle's condition."
            : `Depreciation of ${Math.round(rate * 100)}% applied as per the IRDAI schedule. Your insurer may vary this slightly.`}
        </p>
      </div>
    </div>
  );
}
