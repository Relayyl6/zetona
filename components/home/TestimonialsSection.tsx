"use client";

import React, { useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { TestimonialDTO, mockTestimonials } from "@/lib/db/queries";
import { ease } from "@/lib/motion/tokens";

interface TestimonialsSectionProps {
  testimonials?: TestimonialDTO[];
}

const TESTIMONIAL_DURATION = 6000; // 6 seconds per testimonial

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Pattern P7 / P8: Cinematic Testimonials Section with Big Typographic Initials Monograms
 * Bespoke entrance animations, blur-to-sharp crossfades, and admin editable data.
 */
export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const shouldReduce = useReducedMotion();

  const list = testimonials && testimonials.length > 0 ? testimonials : mockTestimonials;
  const current = list[activeIdx % list.length];

  // Auto-advance timer across testimonials
  React.useEffect(() => {
    if (shouldReduce || isPaused || list.length <= 1) return;

    const timer = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % list.length);
      setProgressKey((k) => k + 1);
    }, TESTIMONIAL_DURATION);

    return () => clearTimeout(timer);
  }, [activeIdx, isPaused, shouldReduce, progressKey, list.length]);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setProgressKey((k) => k + 1);
  };

  if (!list || list.length === 0) return null;

  return (
    <section className="relative bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden flex flex-col justify-between py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 select-none">
      {/* Cinematic subtle atmospheric glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.08),rgba(255,255,255,0.02)_40%,transparent_70%)]"
      />

      {/* Main Grid: Label on left, Quote & Monogram controls on right */}
      <m.div
        initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: ease.outExpo }}
        className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto w-full my-auto"
      >
        {/* Left Column: • TESTIMONIALS */}
        <div className="lg:col-span-3">
          <span className="font-condensed uppercase tracking-tight text-[var(--fg)] text-xl sm:text-2xl md:text-3xl flex items-center gap-2">
            <span className="text-[var(--accent-text)]">•</span> TESTIMONIALS
          </span>
          <span className="font-mono text-xs text-[var(--fg-dim)] block mt-1.5 sm:mt-2">
            [ 0{((activeIdx) % list.length) + 1} / 0{list.length} ]
          </span>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] font-mono text-[var(--fg-dim)]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-[var(--accent)] animate-pulse"}`}
            />
            <span>{isPaused ? "Paused" : "Auto-playing"}</span>
          </div>
        </div>

        {/* Right Column: Quote + Author + Big Initials Monograms */}
        <div className="lg:col-span-9">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="bg-[#101010] border border-white/10 p-6 sm:p-10 md:p-14 rounded-2xl shadow-2xl relative transform-gpu"
          >
            {/* Watermark Quote Icon */}
            <div
              aria-hidden="true"
              className="absolute top-4 right-6 sm:top-6 sm:right-10 text-6xl sm:text-8xl font-serif text-white/[0.04] pointer-events-none select-none font-bold"
            >
              “
            </div>

            <AnimatePresence mode="wait">
              <m.div
                key={current.id}
                initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: ease.outExpo }}
              >
                {/* Author Monogram Badge & Headline */}
                <div className="flex items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#242424] to-[#121212] border border-[var(--accent)]/40 flex items-center justify-center font-serif text-base sm:text-lg font-bold text-[var(--accent-text)] shadow-md ring-1 ring-white/10 flex-shrink-0">
                    {getInitials(current.author)}
                  </div>
                  <div>
                    <h4 className="font-condensed uppercase text-[var(--fg)] text-lg sm:text-xl md:text-2xl tracking-wide">
                      {current.author}
                    </h4>
                    <p className="font-sans text-xs sm:text-sm text-[var(--fg-dim)] mt-0.5">
                      {current.role}
                      {current.location ? ` · ${current.location}` : ""}
                    </p>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="font-serif italic text-[var(--fg)] text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 sm:mb-12 font-light">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </m.div>
            </AnimatePresence>

            {/* Bottom Row: Compact Initials Switcher with Progress Track */}
            <div className="pt-5 sm:pt-6 border-t border-white/10 flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
              {list.map((t, idx) => {
                const isActive = idx === (activeIdx % list.length);
                const isPassed = idx < (activeIdx % list.length);
                const initials = getInitials(t.author);

                return (
                  <m.button
                    key={t.id}
                    onClick={() => handleSelect(idx)}
                    whileHover={shouldReduce ? {} : { scale: 1.06, y: -1 }}
                    whileTap={shouldReduce ? {} : { scale: 0.95 }}
                    aria-label={`View testimonial from ${t.author}`}
                    className="focus:outline-none cursor-pointer flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    {/* Compact Refined Initials Badge */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center font-serif text-xs sm:text-xs md:text-sm font-semibold tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-b from-[#252525] to-[#141414] text-[var(--accent-text)] ring-1.5 ring-[var(--accent)] shadow-md scale-105 border border-[var(--accent)]/50"
                          : "bg-white/[0.04] text-white/40 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Timer progress track going across one avatar to the other */}
                    <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                      {isActive ? (
                        <m.div
                          key={`timer-${progressKey}-${activeIdx}`}
                          className="h-full bg-[var(--accent)] rounded-full shadow-[0_0_6px_var(--accent)]"
                          initial={{ width: "0%" }}
                          animate={{ width: isPaused ? undefined : "100%" }}
                          transition={{
                            duration: TESTIMONIAL_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPassed ? "w-full bg-[var(--accent)]/40" : "w-0 bg-transparent"
                          }`}
                        />
                      )}
                    </div>
                  </m.button>
                );
              })}
            </div>
          </div>
        </div>
      </m.div>
    </section>
  );
}
