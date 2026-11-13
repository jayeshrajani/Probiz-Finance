"use client";

import { useState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const MYTHS = [
  {
    myth: "Checking my own credit score lowers it.",
    fact: "Checking your own score is a soft enquiry and has no effect. Only a lender's check, when you formally apply, is a hard enquiry.",
  },
  {
    myth: "A low CIBIL score means no lender will approve me.",
    fact: "Some lenders do consider lower scores, often with a co-applicant, collateral or a higher rate. The right match matters.",
  },
  {
    myth: "Closing old credit cards improves my score.",
    fact: "Closing a card reduces your total limit, which can push up utilisation and lower your score. Long, clean history helps.",
  },
  {
    myth: "Only salaried people get loans.",
    fact: "Self-employed and cash-income borrowers can qualify too, using ITRs, bank statements and business proof.",
  },
  {
    myth: "Prepaying a home loan always costs a penalty.",
    fact: "RBI rules bar prepayment penalties for individuals on floating-rate loans. Fixed-rate loans may still carry a charge.",
  },
  {
    myth: "Health insurance pays for everything from day one.",
    fact: "Most policies have waiting periods for pre-existing conditions and some treatments. Read them before you buy.",
  },
];

function Card({ item }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <li className="[perspective:1400px]">
      <button
        type="button"
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
        className="flip-inner relative block h-64 w-full text-left"
        data-flipped={flipped}
      >
        <span aria-hidden={flipped} className="flip-face absolute inset-0 flex flex-col justify-between rounded-[1.75rem] border border-border bg-background p-7">
          <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Myth</span>
          <span className="text-xl leading-snug font-semibold tracking-[-0.02em] text-balance">{item.myth}</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <ArrowsClockwise weight="bold" className="size-3.5" /> Tap for the truth
          </span>
        </span>
        <span aria-hidden={!flipped} className="flip-face flip-back absolute inset-0 flex flex-col justify-between rounded-[1.75rem] bg-foreground p-7 text-background">
          <span className="inline-flex w-fit rounded-full bg-brand px-3 py-1 text-xs font-semibold tracking-wide text-brand-foreground uppercase">Fact</span>
          <span className="text-[1.0625rem] leading-relaxed text-background/85">{item.fact}</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-background/50">
            <ArrowsClockwise weight="bold" className="size-3.5" /> Flip back
          </span>
        </span>
      </button>
    </li>
  );
}

export default function MythFlip({ className }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {MYTHS.map((m) => (
        <Card key={m.myth} item={m} />
      ))}
    </ul>
  );
}
