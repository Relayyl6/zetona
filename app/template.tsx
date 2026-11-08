"use client";

import { m, useReducedMotion } from "motion/react";

/**
 * Page enter animation wrapper.
 * Source: docs/MOTION.md §4.2
 * - Full: hero blur(24px scale 1.08) → 0 / 1 over dur.lg
 * - Reduced motion: 150ms cross-fade only
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, filter: "blur(24px)", scale: 1.04 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </m.div>
  );
}
