"use client";

import React, { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { dur, ease } from "@/lib/motion/tokens";

interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  avatarSrc: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "test_01",
    quote:
      "Zetona brings a very distinctive eye to every portrait session. What stood out most was the attention to natural light and small, almost unnoticed expressions that ultimately became the strongest images of the shoot. The process was thoughtful, collaborative, and incredibly well considered from beginning to end.",
    author: "LAURENT SHAHA",
    role: "Creative Director",
    location: "Northline Studio",
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "test_02",
    quote:
      "Working with Zetona in Benin City was an extraordinary experience. She has this calm mastery that immediately puts you at ease. The resulting portraits captured an elegance and quiet dignity that went far beyond what we had envisioned for the editorial feature.",
    author: "OSASERE IGHODARO",
    role: "Editorial Lead",
    location: "Edo Contemporary Arts",
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "test_03",
    quote:
      "Every frame felt like fine art. Zetona didn't just document the session; she sculpted atmosphere and contrast with studio light. Our brand campaign was celebrated across Lagos and Accra for its sheer cinematic depth.",
    author: "CHUKWUEMEKA OBI",
    role: "Founder & Curator",
    location: "Atelier V",
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "test_04",
    quote:
      "The precision with lighting and skin tone fidelity is unmatched. She understands the weight of a gaze and the poetry of shadow. We booked two full-day studio sessions and the results were gallery-grade.",
    author: "AMINAT BELLO",
    role: "Fashion Stylist",
    location: "Benin City",
    avatarSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "test_05",
    quote:
      "A photographer who truly listens and creates an intimate, refined atmosphere. Our executive portrait suite received unanimous acclaim from our board and clients alike.",
    author: "KOUAME DIOP",
    role: "Managing Director",
    location: "Pan-African Design Hub",
    avatarSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "test_06",
    quote:
      "Zetona is a generational talent. The sensitivity she brings to natural form and personal storytelling creates images you hold onto for decades.",
    author: "EFE OSAZEE",
    role: "Architect & Collector",
    location: "Benin City, Nigeria",
    avatarSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80",
  },
];

const TESTIMONIAL_DURATION = 5500; // 5.5 seconds per testimonial

/**
 * Pattern P7 / P8: Cinematic Testimonials Section with Interactive Avatars and Timed Progression
 * Source: Image 3 (Kristin Watson reference) & docs/DESIGN.md §6.4
 */
export function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const shouldReduce = useReducedMotion();
  const current = TESTIMONIALS[activeIdx];

  // Auto-advance timer across testimonials
  React.useEffect(() => {
    if (shouldReduce || isPaused) return;

    const timer = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
      setProgressKey((k) => k + 1);
    }, TESTIMONIAL_DURATION);

    return () => clearTimeout(timer);
  }, [activeIdx, isPaused, shouldReduce, progressKey]);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setProgressKey((k) => k + 1);
  };

  return (
    <section className="relative bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden flex flex-col justify-between py-14 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 select-none">
      {/* Cinematic subtle ambient light (pure GPU radial gradient, zero blur filter cost) */}
      <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_70%)]" />

      {/* Main Grid: Label on left, Quote & Avatar controls on right */}
      <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-6xl mx-auto w-full my-auto">
        {/* Left Column: • TESTIMONIALS */}
        <div className="lg:col-span-3">
          <span className="font-condensed uppercase tracking-tight text-[var(--fg)] text-xl sm:text-2xl md:text-3xl flex items-center gap-2">
            <span className="text-[var(--accent-text)]">•</span> TESTIMONIALS
          </span>
          <span className="font-mono text-xs text-[var(--fg-dim)] block mt-1.5 sm:mt-2">
            [ 0{activeIdx + 1} / 0{TESTIMONIALS.length} ]
          </span>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] font-mono text-[var(--fg-dim)]">
            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-[var(--accent)] animate-pulse"}`} />
            <span>{isPaused ? "Paused" : "Auto-playing"}</span>
          </div>
        </div>

        {/* Right Column: Quote + Author + Avatars in Opaque Composite Container */}
        <div className="lg:col-span-9">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="bg-[#101010] border border-white/10 p-5 sm:p-8 md:p-12 rounded-2xl shadow-2xl relative transform-gpu"
          >
            <AnimatePresence mode="wait">
              <m.div
                key={current.id}
                initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduce ? 0 : -12 }}
                transition={{ duration: 0.35, ease: ease.outExpo }}
              >
                {/* Quote Text */}
                <p className="font-sans text-[var(--fg-muted)] text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8">
                  &ldquo;{current.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="mb-6 sm:mb-10">
                  <h4 className="font-condensed uppercase text-[var(--fg)] text-lg sm:text-xl md:text-2xl tracking-wide">
                    {current.author}
                  </h4>
                  <p className="font-sans text-xs text-[var(--fg-dim)] mt-0.5">
                    {current.role}, {current.location}
                  </p>
                </div>
              </m.div>
            </AnimatePresence>

            {/* Avatar thumbnail row with smooth timing indicators going across */}
            <div className="pt-5 sm:pt-6 border-t border-white/10 flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar">
              {TESTIMONIALS.map((t, idx) => {
                const isActive = idx === activeIdx;
                const isPassed = idx < activeIdx;

                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(idx)}
                    aria-label={`View testimonial from ${t.author}`}
                    className="focus:outline-none cursor-pointer flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded overflow-hidden relative transition-all duration-300 ${
                        isActive
                          ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-black scale-105 brightness-100 shadow-xl"
                          : "opacity-40 grayscale hover:opacity-80 hover:grayscale-0"
                      }`}
                    >
                      <Image
                        src={t.avatarSrc}
                        alt={t.author}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Timer progress track going across one avatar to the other */}
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                      {isActive ? (
                        <m.div
                          key={`timer-${progressKey}-${activeIdx}`}
                          className="h-full bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]"
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
