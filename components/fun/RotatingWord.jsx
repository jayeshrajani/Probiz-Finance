"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Cycles the first word of a headline. Screen readers get the full sentence once via `label`.
export default function RotatingWord({ words, label, interval = 2600, className }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [reduce, words.length, interval]);

  return (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden className={`relative inline-grid overflow-hidden pb-[0.08em] align-bottom ${className || ""}`}>
        <AnimatePresence initial={false}>
          <motion.span
            key={words[i]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="col-start-1 row-start-1"
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}
