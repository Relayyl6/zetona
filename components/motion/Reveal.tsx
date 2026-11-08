"use client";

import React from "react";
import { m, useReducedMotion, Variants } from "motion/react";
import { viewportConfig, dur, ease } from "@/lib/motion/tokens";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "span" | "p";
}

export function Reveal({
  children,
  delay = 0,
  duration = dur.md,
  className,
  as = "div",
}: RevealProps) {
  const shouldReduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0.2 : duration,
        ease: ease.outExpo,
        delay,
      },
    },
  };

  const MotionComponent = m[as];

  return (
    <MotionComponent
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
