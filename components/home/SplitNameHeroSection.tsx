"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { PhotoDTO, mockPhotos } from "@/lib/db/queries";
import { dur, ease } from "@/lib/motion/tokens";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface SplitNameHeroSectionProps {
  photos: PhotoDTO[];
}

/**
 * Pattern P2: Split-Name Hero + Crop Frame (Kristin Watson editorial composition)
 */
export function SplitNameHeroSection({ photos }: SplitNameHeroSectionProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const shouldReduce = useReducedMotion();

  const photoList = photos && photos.length > 0 ? photos : mockPhotos;

  // Cycle through portraits inside crop frame window
  useEffect(() => {
    if (shouldReduce || photoList.length <= 1) return;
    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photoList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [shouldReduce, photoList.length]);

  const activePhoto = photoList[photoIndex % photoList.length] || mockPhotos[0];

  return (
    <section className="relative min-h-[85vh] lg:min-h-[88vh] bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden flex flex-col justify-between py-4 sm:py-6 select-none">
      {/* Subtle atmospheric blue glow matching Image 4 */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/15 rounded-full filter blur-[140px] pointer-events-none"
      />

      {/* Top Bar inside Section */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12">
        <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest">
          • Direction & Form
        </span>
        <span className="font-mono text-[var(--fg-dim)] text-xs">
          [ Studio Study 0{(photoIndex % photoList.length) + 1} ]
        </span>
      </div>

      {/* Main Split Name Canvas with Center Crop Frame */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center w-full">
        {/* Central Stage: The focal photo is the in-flow anchor with ZETONA passing right through its vertical midpoint */}
        <div className="relative flex flex-col items-center justify-center">
          {/* GIANT ZETONA - positioned across the EXACT vertical middle of the focal photo with taller character proportions */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] pointer-events-none z-10">
            <m.h2
              className="font-heavy uppercase text-[#F6F2E6] leading-none select-none w-full flex justify-between items-center text-center font-black px-3 sm:px-6 md:px-8 scale-y-[1.38] origin-center tracking-tight"
              style={{ fontSize: "clamp(2.75rem, 13.8vw, 14.5rem)", fontWeight: 900 }}
              initial={{ y: "25%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: dur.lg, ease: ease.outExpo }}
            >
              <span>Z</span>
              <span>E</span>
              <span>T</span>
              <span>O</span>
              <span>N</span>
              <span className="pr-1 sm:pr-2">A</span>
            </m.h2>
          </div>

          {/* Center Focal Image (in-flow anchor so everything aligns to its exact geometry) */}
          <div className="relative z-20 pointer-events-auto p-1 sm:p-2">
            <div className="relative w-[54vw] sm:w-[34vw] md:w-[21vw] max-w-[230px] md:max-w-[275px] aspect-[4/5] overflow-hidden shadow-2xl bg-[var(--bg-elevated)] ring-1 ring-white/10 rounded-sm">
              <AnimatePresence mode="wait">
                {activePhoto && (
                  <m.div
                    key={activePhoto.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.7, ease: ease.outExpo }}
                  >
                    <Image
                      src={getOptimizedSrc(activePhoto.displayKey, 800)}
                      alt={activePhoto.alt}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: `${(activePhoto.focal?.x ?? 0.5) * 100}% ${(activePhoto.focal?.y != null ? Math.min(activePhoto.focal.y, 0.15) : 0.12) * 100}%`,
                      }}
                      sizes="(min-width:1024px) 25vw, 60vw"
                      priority
                    />
                  </m.div>
                )}
              </AnimatePresence>

              {/* Overlaid blurred ZETONA showing softly through & above the image on both desktop & mobile */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden"
              >
                <div
                  className="w-[92vw] min-w-[92vw] flex justify-between items-center text-center font-heavy uppercase font-black text-[#F6F2E6]/70 filter blur-[2.5px] select-none scale-y-[1.38] origin-center px-3 sm:px-6 md:px-8 mix-blend-plus-lighter tracking-tight"
                  style={{ fontSize: "clamp(2.75rem, 13.8vw, 14.5rem)", fontWeight: 900 }}
                >
                  <span>Z</span>
                  <span>E</span>
                  <span>T</span>
                  <span>O</span>
                  <span>N</span>
                  <span className="pr-1 sm:pr-2">A</span>
                </div>
              </div>

              {/* Dotted Rule Lines */}
              <div className="absolute inset-2 border border-white/40 pointer-events-none z-20" />

              {/* Photoshop-style 4 white corner square handles (Kristin reference) */}
              <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-white pointer-events-none z-30 shadow" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-white pointer-events-none z-30 shadow" />
              <div className="absolute bottom-2 left-2 w-2.5 h-2.5 bg-white pointer-events-none z-30 shadow" />
              <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-white pointer-events-none z-30 shadow" />
            </div>

            {/* Frame metadata label */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] px-1">
              <span className="backdrop-blur-md bg-black/60 border border-white/10 px-2 py-0.5 rounded text-white/90">
                CROP 4:5 [ZETONA_E]
              </span>
              <span className="backdrop-blur-md bg-black/60 border border-white/10 px-2 py-0.5 rounded text-white/90">
                100% FOCUS
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Name & Tagline – _E below the center image on the right edge */}
        <div className="w-full max-w-[92vw] mx-auto flex items-end justify-between mt-3 sm:mt-5 md:mt-6 z-20 px-4 sm:px-6 md:px-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--fg-dim)] pb-2">
            Benin City • Studio & Portraiture
          </span>
          <m.h2
            className="font-heavy uppercase text-[#F6F2E6] tracking-tight leading-none select-none text-right font-black scale-y-[1.38] origin-bottom-right"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)", fontWeight: 900 }}
            initial={{ y: "40%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: dur.lg, ease: ease.outExpo, delay: 0.15 }}
          >
            _E
          </m.h2>
        </div>
      </div>

      {/* Bottom section footer */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-[var(--line)] text-xs font-sans text-[var(--fg-muted)] mx-6 md:mx-12">
        <p>Personality & presence captured with intention.</p>
        <Link
          href="/work"
          className="text-[var(--accent-text)] hover:text-[var(--accent)] font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          Explore all portraits →
        </Link>
      </div>
    </section>
  );
}
