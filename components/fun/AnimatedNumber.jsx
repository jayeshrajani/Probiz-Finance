"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { formatINR } from "@/lib/format";

// Tweens between values instead of jumping, so slider changes read as continuous.
export default function AnimatedNumber({ value, format = formatINR, className, ...rest }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [mv, value]);

  return (
    <motion.span className={className} {...rest}>
      {text}
    </motion.span>
  );
}
