"use client";

import React from "react";
import { m, useReducedMotion } from "motion/react";
import { stagger, dur, ease } from "@/lib/motion/tokens";

/**
 * ImageReveal: Mask clip-path inset(100% 0 0 0) → inset(0) + inner image scale 1.25 → 1
 * Source: docs/MOTION.md §5
 */
interface ImageRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ImageReveal({ children, delay = 0, className }: ImageRevealProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={`overflow-hidden ${className || ""}`}
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: dur.lg,
        ease: ease.inOutQuart,
        delay,
      }}
    >
      <m.div
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          duration: dur.lg,
          ease: ease.outExpo,
          delay,
        }}
      >
        {children}
      </m.div>
    </m.div>
  );
}
