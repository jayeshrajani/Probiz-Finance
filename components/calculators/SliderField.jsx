"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

// Labelled range slider with a typed number readout; both stay in sync.
export default function SliderField({ label, value, onChange, min, max, step = 1, format, suffix, className }) {
  const id = useId();
  const fill = `${((value - min) / (max - min)) * 100}%`;

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </label>
        <output htmlFor={id} className="text-[0.9375rem] font-semibold tabular-nums tracking-[-0.01em]">
          {format ? format(value) : value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range"
        style={{ "--fill": fill }}
      />
    </div>
  );
}
