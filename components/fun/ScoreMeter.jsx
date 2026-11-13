"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const MIN = 300;
const MAX = 900;
const BANDS = [
  { from: 300, to: 549, label: "Needs work", color: "oklch(0.86 0.04 60)", tip: "Pay every EMI and card bill on time from now on; recent months count most. Lenders who consider lower scores often ask for a co-applicant or collateral." },
  { from: 550, to: 649, label: "Fair", color: "oklch(0.83 0.11 68)", tip: "Keep card spends under about 30% of your limit, and avoid applying to many lenders at once. Each application is a hard enquiry." },
  { from: 650, to: 749, label: "Good", color: "oklch(0.76 0.16 58)", tip: "Most lenders will consider you. Nudging the score higher can still unlock a better rate." },
  { from: 750, to: 900, label: "Excellent", color: "var(--brand)", tip: "You're in the range lenders like most. Use it to negotiate the rate and processing fee." },
];

const CX = 160;
const CY = 160;
const R = 128;

// θ runs 0 (left) to 180 (right) across the top half.
function point(score, r = R) {
  const t = (((score - MIN) / (MAX - MIN)) * 180 * Math.PI) / 180;
  return [CX - r * Math.cos(t), CY - r * Math.sin(t)];
}

function arc(from, to) {
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export default function ScoreMeter() {
  const [score, setScore] = useState(680);
  const id = useId();
  const band = BANDS.find((b) => score <= b.to);
  const angle = ((score - MIN) / (MAX - MIN)) * 180 - 90;

  return (
    <div className="grid items-center gap-10 rounded-[2rem] border border-border bg-background p-6 sm:p-10 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <svg viewBox="0 0 320 190" className="w-full" aria-hidden>
          {BANDS.map((b) => (
            <path key={b.label} d={arc(b.from + 3, b.to - 3)} fill="none" stroke={b.color} strokeWidth="26" opacity={b === band ? 1 : 0.45} style={{ transition: "opacity 300ms" }} />
          ))}
          <motion.g style={{ originX: 0.5, originY: 1 }} initial={false} animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 140, damping: 16 }}>
            <path d={`M${CX - 5} ${CY} L${CX} ${CY - R + 26} L${CX + 5} ${CY} Z`} fill="var(--foreground)" />
          </motion.g>
          <circle cx={CX} cy={CY} r="13" fill="var(--foreground)" />
          <circle cx={CX} cy={CY} r="5" fill="var(--brand)" />
          <text x={CX - R} y={CY + 26} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.5">
            300
          </text>
          <text x={CX + R} y={CY + 26} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.5">
            900
          </text>
        </svg>
        <p className="-mt-2 text-center font-display text-5xl font-semibold tracking-[-0.04em] tabular-nums">{score}</p>
        <label htmlFor={id} className="sr-only">
          Your credit score
        </label>
        <input
          id={id}
          type="range"
          min={MIN}
          max={MAX}
          step={5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="range mt-6"
          style={{ "--fill": `${((score - MIN) / (MAX - MIN)) * 100}%` }}
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">Drag to your score, or a guess.</p>
      </div>

      <div aria-live="polite">
        <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-ink">{band.label}</p>
        <p className="mt-5 text-xl leading-relaxed font-medium tracking-[-0.015em] text-pretty">{band.tip}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/credit-score-check-service">
              Get your report checked <ArrowRight weight="bold" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/eligibility">Check eligibility</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
