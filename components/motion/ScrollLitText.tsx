"use client";

import React, { useRef } from "react";
import { m, useScroll, useTransform, MotionValue, useReducedMotion } from "motion/react";

interface ScrollLitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollLitText({ text, className, style }: ScrollLitTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  const words = text.split(" ");

  if (shouldReduce) {
    return (
      <p ref={ref} className={className} style={style}>
        {text}
      </p>
    );
  }

  return (
    <p
      ref={ref}
      style={style}
      className={`flex flex-wrap gap-x-[0.28em] leading-[1.15] ${className || ""}`}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} range={[start, end]} progress={scrollYProgress}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  range,
  progress,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <m.span style={{ opacity }}>{children}</m.span>;
}
