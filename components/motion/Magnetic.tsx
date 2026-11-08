"use client";

import React, { useRef } from "react";
import { m, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion/tokens";

/**
 * Magnetic button wrapper: attracts element toward cursor within a threshold.
 * Source: docs/MOTION.md §5 & §4.8
 * Desktop/fine pointer only. Touch: no effect.
 */
interface MagneticProps {
  children: React.ReactNode;
  range?: number; // px around which magnetic activates, default 80
  strength?: number; // max translation px, default 8
  className?: string;
}

export function Magnetic({
  children,
  range = 80,
  strength = 8,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shouldReduce = useReducedMotion();

  const springX = useSpring(x, spring.soft);
  const springY = useSpring(y, spring.soft);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduce) return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < range) {
      x.set((dx / range) * strength);
      y.set((dy / range) * strength);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </m.div>
  );
}
