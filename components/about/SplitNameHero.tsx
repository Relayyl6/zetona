"use client";

import React from "react";
import { m, useReducedMotion } from "motion/react";
import { PhotoDTO } from "@/lib/db/queries";
import { CropFrame } from "./CropFrame";
import { siteConfig } from "@/lib/site-config";
import { dur, ease } from "@/lib/motion/tokens";

interface SplitNameHeroProps {
  photos: PhotoDTO[];
}

export function SplitNameHero({ photos }: SplitNameHeroProps) {
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative min-h-[85vh] bg-[var(--bg)] flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none">
      {/* Top name part */}
      <div className="overflow-hidden">
        <m.h1
          className="font-condensed uppercase text-[var(--fg)] leading-none scale-y-[1.25] origin-bottom-left tracking-tight"
          style={{ fontSize: "var(--fs-mega)" }}
          initial={{ y: shouldReduce ? 0 : "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: dur.lg, ease: ease.outExpo }}
        >
          ZETONA
        </m.h1>
      </div>

      {/* Center transform crop box */}
      <div className="flex justify-center items-center my-auto z-10">
        <CropFrame photos={photos} />
      </div>

      {/* Bottom name part */}
      <div className="overflow-hidden text-right">
        <m.div
          className="font-condensed uppercase text-[var(--fg)] leading-none scale-y-[1.25] origin-top-right tracking-tight"
          style={{ fontSize: "var(--fs-mega)" }}
          initial={{ y: shouldReduce ? 0 : "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: dur.lg, ease: ease.outExpo, delay: 0.15 }}
        >
          _E
        </m.div>
      </div>
    </section>
  );
}
