"use client";

import React, { useRef } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Parallax wrapper: y = useTransform(scrollYProgress, [0,1], [-speed, +speed])
 * Source: docs/MOTION.md §5
 */
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // px range, default 60
  className?: string;
}

export function Parallax({ children, speed = 60, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <m.div style={{ y }}>{children}</m.div>
    </div>
  );
}
