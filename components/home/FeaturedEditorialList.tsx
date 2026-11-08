"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { PhotoDTO } from "@/lib/db/queries";
import { spring, dur, ease } from "@/lib/motion/tokens";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface SessionItem {
  id: string;
  title: string;
  year: string;
  href: string;
  photo: PhotoDTO;
}

interface FeaturedEditorialListProps {
  items: SessionItem[];
}

/**
 * Pattern P6: Hover-Reveal List with Cursor-Tracking Preview (from Image 5 / reference frames 07-09)
 */
export function FeaturedEditorialList({ items }: FeaturedEditorialListProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(0);
  const shouldReduce = useReducedMotion();

  const activeItem = hoveredIdx !== null ? items[hoveredIdx] : items[0];

  return (
    <section
      className="relative min-h-screen bg-[var(--bg)] border-t border-[var(--line)] px-6 md:px-12 py-24 select-none overflow-hidden"
    >
      {/* Section Header (matching Kristin reference exactly) */}
      <div className="flex items-center justify-between mb-16">
        <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest">
          • MY AWARDS
        </span>
        <span className="font-mono text-[var(--fg-dim)] text-xs backdrop-blur-md bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded">
          [ 2019 — 2026 ]
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Huge Condensed List */}
        <div className="lg:col-span-7 space-y-2">
          {items.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.id}
                onMouseEnter={() => {
                  if (hoveredIdx !== idx) setHoveredIdx(idx);
                }}
                className="group cursor-pointer py-1"
              >
                <div
                  onClick={(e) => {
                    // Mobile/Tablet tap: show picture in-place without immediately leaving the screen
                    if (hoveredIdx !== idx) {
                      e.preventDefault();
                      setHoveredIdx(idx);
                    }
                  }}
                  className="flex items-baseline justify-between transition-opacity duration-200 select-none"
                  style={{
                    opacity: hoveredIdx === null || isHovered ? 1 : 0.35,
                  }}
                >
                  <div className="flex items-baseline gap-2.5 sm:gap-3">
                    {/* Active em-dash indicator */}
                    <span
                      className={`font-condensed text-[var(--fg)] text-2xl sm:text-3xl md:text-5xl transition-all duration-200 ${
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                      }`}
                    >
                      —
                    </span>
                    <h3
                      className={`font-condensed uppercase tracking-tight transition-transform duration-200 ${
                        isHovered
                          ? "translate-x-1 sm:translate-x-2 text-[var(--fg)]"
                          : "text-[var(--fg-muted)] group-hover:text-[var(--fg)]"
                      }`}
                      style={{ fontSize: "clamp(1.6rem, 4vw, 4.5rem)", lineHeight: 1.05 }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Bracketed year */}
                  <span className="font-mono text-[11px] sm:text-xs text-[var(--fg-dim)] ml-4 flex-shrink-0">
                    [ {item.year} ]
                  </span>
                </div>

                {/* Mobile-only inline preview when tapped with smooth hardware accordion */}
                <div
                  className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                    isHovered ? "max-h-[30rem] opacity-100 mt-3 mb-5" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="aspect-[4/5] w-full max-w-sm rounded overflow-hidden relative shadow-xl">
                    <Image
                      src={getOptimizedSrc(item.photo.displayKey, 800)}
                      alt={item.photo.alt}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: `${(item.photo.focal?.x ?? 0.5) * 100}% ${(item.photo.focal?.y != null ? Math.min(item.photo.focal.y, 0.15) : 0.12) * 100}%`,
                      }}
                      sizes="(max-width: 1024px) 90vw, 400px"
                    />
                  </div>

                  {/* Dedicated button to navigate to /work only when the user explicitly chooses */}
                  <div className="mt-3 flex items-center justify-between max-w-sm">
                    <span className="font-mono text-xs text-[var(--fg-dim)]">[ {item.year} ]</span>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#F6F2E6] bg-white/10 hover:bg-white hover:text-black border border-white/20 px-3.5 py-1.5 rounded-full transition-colors"
                    >
                      View in Work →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Pre-rendered GPU-Composited Image Stack (Zero decode latency, zero hover lag) */}
        <div className="hidden lg:block lg:col-span-5 relative pointer-events-none">
          <div className="sticky top-32 transform-gpu">
            <div className="aspect-[3/4] w-80 xl:w-96 overflow-hidden shadow-2xl bg-[var(--bg-elevated)] ring-1 ring-white/10 rounded-sm relative will-change-transform transform-gpu">
              {items.map((item, idx) => {
                const isActive = hoveredIdx === idx;
                return (
                  <div
                    key={item.id}
                    className={`absolute inset-0 transition-[opacity,transform] duration-250 ease-out will-change-[opacity,transform] ${
                      isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[0.98] z-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={getOptimizedSrc(item.photo.displayKey, 800)}
                      alt={item.photo.alt}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: `${(item.photo.focal?.x ?? 0.5) * 100}% ${(item.photo.focal?.y != null ? Math.min(item.photo.focal.y, 0.15) : 0.12) * 100}%`,
                      }}
                      sizes="400px"
                      priority={idx < 4}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-white flex justify-between pointer-events-none">
                      <span className="bg-black/85 px-2 py-0.5 rounded border border-white/15 shadow-md">
                        {item.title}
                      </span>
                      <span className="bg-black/85 px-2 py-0.5 rounded border border-white/15 shadow-md">
                        [ {item.year} ]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
