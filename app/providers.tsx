"use client";

import React from "react";
import { LazyMotion, domMax, MotionConfig } from "motion/react";
import { ease } from "@/lib/motion/tokens";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      <MotionConfig
        reducedMotion="user"
        transition={{
          ease: ease.outExpo,
          duration: 0.35,
        }}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  );
}
