"use client";

import { motion, useReducedMotion } from "motion/react";

const COLORS = ["var(--brand)", "var(--foreground)", "oklch(0.85 0.1 70)", "var(--brand-ink)"];
const PIECES = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.2;
  const dist = 70 + ((i * 37) % 60);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 30, r: ((i * 53) % 360) - 180, color: COLORS[i % COLORS.length], round: i % 3 === 0 };
});

// One-shot celebratory burst. Deterministic layout keeps server and client markup identical.
export default function Confetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 z-10">
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          className={p.round ? "absolute size-2 rounded-full" : "absolute h-3 w-1.5 rounded-[2px]"}
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 90], opacity: [1, 1, 0], rotate: p.r, scale: 1 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], times: [0, 0.45, 1] }}
        />
      ))}
    </span>
  );
}
