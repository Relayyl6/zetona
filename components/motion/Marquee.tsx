"use client";

import React, { useRef, useState, useEffect } from "react";
import { m, useReducedMotion, useMotionValue, useSpring, animate } from "motion/react";
import { viewportConfig, ease } from "@/lib/motion/tokens";

/**
 * Marquee: Infinite horizontal loop, speed tied to scroll velocity.
 * Source: docs/MOTION.md §5
 * Pauses on hover, when page is hidden, and when off-screen.
 */
interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // base pixels per second
  gap?: number; // px
  className?: string;
  direction?: "left" | "right";
}

export function Marquee({
  children,
  speed = 60,
  gap = 48,
  className,
  direction = "left",
}: MarqueeProps) {
  const shouldReduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const widthRef = useRef<number>(0);

  useEffect(() => {
    if (shouldReduce) return;
    if (!containerRef.current) return;

    const content = containerRef.current.children[0] as HTMLElement;
    if (!content) return;

    const updateWidth = () => {
      widthRef.current = content.offsetWidth + gap;
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);

    function loop(ts: number) {
      if (paused || document.hidden) {
        lastTimeRef.current = null;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;
      const delta = direction === "left" ? -speed * dt : speed * dt;
      let next = x.get() + delta;
      if (direction === "left" && next <= -widthRef.current) next += widthRef.current;
      if (direction === "right" && next >= 0) next -= widthRef.current;
      x.set(next);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    const handleVisibility = () => {
      if (document.hidden) lastTimeRef.current = null;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", updateWidth);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [shouldReduce, paused, speed, gap, direction, x]);

  if (shouldReduce) {
    return (
      <div className={`overflow-x-auto ${className || ""}`}>
        <div className="flex" style={{ gap }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden select-none ${className || ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      ref={containerRef}
      aria-hidden="true"
    >
      <m.div
        className="flex whitespace-nowrap"
        style={{ x, gap }}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
      </m.div>
    </div>
  );
}
