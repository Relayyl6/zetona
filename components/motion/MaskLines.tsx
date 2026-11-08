"use client";

import React from "react";
import { m, useReducedMotion } from "motion/react";
import { stagger, dur, ease } from "@/lib/motion/tokens";

interface MaskLinesProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  staggerDelay?: number;
  delay?: number;
}

export function MaskLines({
  children,
  className,
  style,
  as: Tag = "div",
  staggerDelay = stagger.items,
  delay = 0,
}: MaskLinesProps) {
  const shouldReduce = useReducedMotion();
  const lines = children.split("\n").filter(Boolean);

  if (shouldReduce) {
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <m.span
            className="block"
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: dur.md,
              ease: ease.outExpo,
              delay: delay + i * staggerDelay,
            }}
          >
            {line}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}
