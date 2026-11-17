"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Briefcase, Car, Coins, Heart, House, PiggyBank, ShieldCheck, Star } from "@phosphor-icons/react";
import Confetti from "@/components/fun/Confetti";
import { cn } from "@/lib/utils";

// Fixed positions keep server and client markup identical.
const STICKERS = [
  { Icon: House, tone: "bg-brand/15 text-brand-ink", pos: "left-[4%] top-[3%] sm:left-[5%] sm:top-[10%]", rotate: -8, delay: 0 },
  { Icon: Car, tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300", pos: "right-[5%] top-[5%] sm:right-[6%] sm:top-[12%]", rotate: 7, delay: 0.6 },
  { Icon: PiggyBank, tone: "bg-rose-500/15 text-rose-600 dark:text-rose-300", pos: "left-[7%] bottom-[2%] sm:left-[8%] sm:bottom-[12%]", rotate: 10, delay: 1.1 },
  { Icon: ShieldCheck, tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", pos: "right-[6%] bottom-[3%] sm:right-[9%] sm:bottom-[14%]", rotate: -6, delay: 0.3 },
  { Icon: Briefcase, tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300", pos: "left-[22%] top-[4%]", rotate: 5, delay: 0.9, wide: true },
  { Icon: Coins, tone: "bg-amber-400/20 text-amber-700 dark:text-amber-300", pos: "right-[22%] bottom-[5%]", rotate: -10, delay: 1.4, wide: true },
  { Icon: Star, tone: "bg-amber-400/20 text-amber-600 dark:text-amber-300", pos: "right-[25%] top-[6%]", rotate: 12, delay: 0.4, wide: true, small: true },
  { Icon: Heart, tone: "bg-rose-500/15 text-rose-500 dark:text-rose-300", pos: "left-[26%] bottom-[6%]", rotate: -12, delay: 1.7, wide: true, small: true },
];

// Bobs in place; drag it around or tap it for a little burst of confetti.
function Sticker({ s, reduce }) {
  const [bursts, setBursts] = useState(0);
  return (
    <motion.div
      aria-hidden
      className={cn("absolute z-0", s.pos, s.wide && "hidden lg:block")}
      initial={{ rotate: s.rotate }}
      animate={reduce ? undefined : { y: [0, -12, 0], rotate: [s.rotate, s.rotate + 5, s.rotate] }}
      transition={{ duration: 3.6 + s.delay, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
    >
      <motion.div
        drag={!reduce}
        dragSnapToOrigin
        dragElastic={0.7}
        whileHover={reduce ? undefined : { scale: 1.12, rotate: s.rotate > 0 ? -10 : 10 }}
        whileTap={reduce ? undefined : { scale: 0.88 }}
        whileDrag={{ scale: 1.15, cursor: "grabbing" }}
        onTap={() => setBursts((n) => n + 1)}
        className={cn(
          "relative grid cursor-grab touch-none place-items-center rounded-2xl bg-background shadow-[0_18px_40px_-18px_oklch(0.21_0.006_286/0.45)] ring-1 ring-border select-none",
          s.small ? "size-12" : "size-12 sm:size-16"
        )}
      >
        <span className={cn("grid place-items-center rounded-xl", s.tone, s.small ? "size-8" : "size-8 sm:size-11")}>
          <s.Icon weight="duotone" className={s.small ? "size-4.5" : "size-4.5 sm:size-6"} />
        </span>
        {bursts > 0 && <Confetti key={bursts} />}
      </motion.div>
    </motion.div>
  );
}

// Letters hop in a wave once, and again one by one under the pointer. Non-Latin scripts move per word so
// conjuncts stay intact. Text is visible before JS loads; only the motion waits for hydration.
function BouncyHeadline({ text, highlight, reduce }) {
  const perLetter = /^[\x20-\x7E]*$/.test(text);
  const start = highlight ? text.indexOf(highlight) : -1;
  const hot = (at) => start >= 0 && at >= start && at < start + highlight.length;
  let offset = 0;
  let n = 0;
  const piece = (content, at, key) => {
    const i = n++;
    return (
      <motion.span
        key={key}
        className={cn("inline-block", hot(at) && "text-brand")}
        animate={reduce ? undefined : { y: [0, -18, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.3 + i * 0.05 }}
      >
        <motion.span
          className="inline-block"
          whileHover={reduce ? undefined : { y: -16, rotate: i % 2 ? 10 : -10, transition: { type: "spring", stiffness: 520, damping: 7 } }}
        >
          {content}
        </motion.span>
      </motion.span>
    );
  };

  return (
    <h1 className="display-1 text-balance" aria-label={text}>
      {text.split(/(\s+)/).map((word, w) => {
        const at = offset;
        offset += word.length;
        if (/^\s+$/.test(word)) return " ";
        return (
          <span key={w} aria-hidden className="inline-block whitespace-nowrap">
            {perLetter ? Array.from(word).map((ch, c) => piece(ch, at + c, c)) : piece(word, at, 0)}
          </span>
        );
      })}
    </h1>
  );
}

export default function JollyHero({ title, highlight, children, className }) {
  const reduce = useReducedMotion();
  return (
    <section className={cn("relative isolate flex items-center justify-center overflow-hidden px-6 py-28 sm:py-20", className)}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:22px_22px] opacity-70" />
      <div aria-hidden className="absolute top-[-10%] left-[15%] -z-10 size-[28rem] rounded-full bg-brand/12 blur-3xl" />
      <div aria-hidden className="absolute right-[10%] bottom-[-15%] -z-10 size-[24rem] rounded-full bg-sky-400/12 blur-3xl" />

      {STICKERS.map((s, i) => (
        <Sticker key={i} s={s} reduce={reduce} />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center">
        <BouncyHeadline text={title} highlight={highlight} reduce={reduce} />
        <svg aria-hidden viewBox="0 0 240 16" className="mt-3 h-4 w-56 text-brand" fill="none">
          <motion.path
            d="M2 9 C 22 1, 42 15, 62 8 S 102 1, 122 8 S 162 15, 182 8 S 222 1, 238 8"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
          />
        </svg>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
