"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useReducedMotion, useMotionValue, useSpring } from "motion/react";
import { PhotoDTO } from "@/lib/db/queries";
import { collagePresets, CollageSlot } from "@/lib/collage-presets";
import { stagger, dur, ease, spring } from "@/lib/motion/tokens";
import { Magnetic } from "@/components/motion/Magnetic";

interface CollageHeroProps {
  photos: PhotoDTO[];
  headline?: string;
  subline?: string;
  cta?: string;
  ctaHref?: string;
}

const IDLE_AMPLITUDE = 7; // px

function buildImageSrc(photo: PhotoDTO): string {
  if (photo.displayKey.startsWith("http")) return photo.displayKey;
  return photo.displayKey;
}

export function CollageHero({
  photos,
  headline = "Beautiful moments\nof beautiful people.",
  subline = "Studio & portrait photography, Benin City.",
  cta = "View the work",
  ctaHref = "/work",
}: CollageHeroProps) {
  const shouldReduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for desktop parallax tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, spring.soft);
  const springY = useSpring(mouseY, spring.soft);

  // Always use preset A for predictable framing
  const preset = collagePresets[0];
  const slots = preset.slots;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const aspectMap: Record<CollageSlot["aspect"], string> = {
    "3/4": "aspect-[3/4]",
    "4/5": "aspect-[4/5]",
    "1/1": "aspect-square",
    "16/9": "aspect-video",
    "2/3": "aspect-[2/3]",
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] md:min-h-screen bg-[var(--bg)] overflow-hidden flex flex-col justify-between"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Photography portfolio hero"
    >
      {/* ──────────────── DESKTOP COLLAGE (HIDDEN ON MOBILE) ──────────────── */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        {slots.map((slot, i) => {
          const photo = photos[i % photos.length];
          return (
            <CollageCard
              key={slot.id}
              slot={slot}
              photo={photo}
              index={i}
              shouldReduce={shouldReduce}
              springX={springX}
              springY={springY}
              aspectClass={aspectMap[slot.aspect]}
            />
          );
        })}
      </div>

      {/* ──────────────── HERO HEADLINE (ALWAYS CENTERED & ON TOP) ──────────────── */}
      <div className="relative z-30 flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-6 md:py-0 pointer-events-auto">
        <HeroText headline={headline} cta={cta} ctaHref={ctaHref} />
      </div>

      {/* Gentle bottom edge gradient transition on desktop pulling images softly back from next section */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent pointer-events-none z-10" />

      {/* ──────────────── MOBILE RESPONSIVE SCROLLABLE CAROUSEL (BIG IMPACT EDITORIAL CARDS) ──────────────── */}
      <div className="md:hidden relative z-20 pb-12 pt-6">
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory">
          {photos.slice(0, 6).map((photo, i) => (
            <div
              key={photo.id}
              className="w-[84vw] flex-shrink-0 snap-center aspect-[4/5] relative overflow-hidden rounded-md bg-[var(--bg-elevated)] shadow-2xl ring-1 ring-white/10"
            >
              <Image
                src={buildImageSrc(photo)}
                alt={photo.alt}
                fill
                className="object-cover"
                style={{
                  objectPosition: `${(photo.focal?.x ?? 0.5) * 100}% ${(photo.focal?.y ?? 0.35) * 100}%`,
                }}
                sizes="85vw"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Glassmorphic Card Meta on Mobile */}
              <div className="absolute top-3 right-3 font-mono text-[11px] text-white/90 backdrop-blur-xl bg-black/60 border border-white/15 px-2.5 py-1 rounded shadow-lg">
                0{i + 1} / 0{Math.min(photos.length, 6)}
              </div>

              {photo.title && (
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="font-mono text-[10px] uppercase text-[var(--accent-text)] tracking-wider block mb-1">
                    Editorial Feature
                  </span>
                  <p className="text-white text-base font-serif tracking-wide">{photo.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4">
          <span className="font-mono text-[10px] text-[var(--fg-dim)] uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full">
            <span>←</span> swipe to explore <span>→</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function CollageCard({
  slot,
  photo,
  index,
  shouldReduce,
  springX,
  springY,
  aspectClass,
}: {
  slot: CollageSlot;
  photo: PhotoDTO;
  index: number;
  shouldReduce: boolean | null;
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
  aspectClass: string;
}) {
  const [hovered, setHovered] = useState(false);
  const periodSec = (6000 + slot.id * 800) / 1000;
  const amplitude = shouldReduce ? 0 : IDLE_AMPLITUDE;

  return (
    <m.div
      className="absolute pointer-events-auto"
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${slot.widthVw}vw`,
        zIndex: slot.z,
        x: shouldReduce ? 0 : (springX as unknown as any),
        rotate: shouldReduce ? 0 : `${slot.rotate ?? 0}deg`,
        willChange: "transform, opacity",
      }}
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 1.08, y: 20 }}
      animate={
        shouldReduce
          ? {}
          : {
              opacity: 1,
              scale: 1,
              y: [0, -amplitude, 0, amplitude, 0],
            }
      }
      transition={{
        opacity: { duration: dur.md, ease: ease.outExpo, delay: 0.05 + index * stagger.cards },
        scale: { duration: dur.md, ease: ease.outExpo },
        y: {
          repeat: Infinity,
          duration: periodSec,
          ease: "easeInOut",
          delay: (slot.id * 0.4) % periodSec,
        },
      }}
      whileHover={shouldReduce ? {} : { scale: 1.06, rotate: "0deg", zIndex: 30 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className={`${aspectClass} overflow-hidden relative shadow-2xl bg-[var(--bg-elevated)] ring-1 ring-white/5`}>
        <Image
          src={buildImageSrc(photo)}
          alt={slot.isLcp ? photo.alt : ""}
          fill
          className={`object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
          style={{
            objectPosition: `${(photo.focal?.x ?? 0.5) * 100}% ${(photo.focal?.y ?? 0.35) * 100}%`,
          }}
          priority={slot.isLcp}
          sizes="(min-width:1024px) 20vw, 30vw"
        />
      </div>
    </m.div>
  );
}

function HeroText({
  headline,
  cta,
  ctaHref,
}: {
  headline: string;
  cta: string;
  ctaHref: string;
}) {
  const shouldReduce = useReducedMotion();

  // Strictly TWO lines as explicitly required by the client:
  // Line 1: "Beautiful moments"
  // Line 2: "of beautiful people."
  let line1 = "Beautiful moments";
  let line2 = "of beautiful people.";

  if (headline) {
    const cleaned = headline.replace(/\r\n/g, "\n").trim();
    const parts = cleaned.split("\n").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 2) {
      line1 = parts[0];
      line2 = parts[1];
    } else {
      const words = cleaned.replace(/\n+/g, " ").split(/\s+/);
      if (words.length >= 4) {
        line1 = words.slice(0, 2).join(" ");
        line2 = words.slice(2).join(" ");
      } else if (words.length >= 2) {
        const mid = Math.ceil(words.length / 2);
        line1 = words.slice(0, mid).join(" ");
        line2 = words.slice(mid).join(" ");
      } else {
        line1 = cleaned;
        line2 = "";
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 z-30 pointer-events-auto">
      {/* Serif Headline with high visual contrast – strictly two lines, larger and commanding */}
      <h1
        className="font-serif text-[var(--fg)] leading-[0.92] drop-shadow-2xl select-none text-center tracking-tight"
        style={{ fontSize: "clamp(3.2rem, 9.4vw, 9.8rem)" }}
      >
        <span className="block overflow-hidden py-1">
          <m.span
            className="block whitespace-nowrap"
            initial={{ y: shouldReduce ? 0 : "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: shouldReduce ? 0.2 : dur.md,
              ease: ease.outExpo,
              delay: shouldReduce ? 0 : 0.6,
            }}
          >
            {line1}
          </m.span>
        </span>

        {line2 && (
          <span className="block overflow-hidden py-1">
            <m.span
              className="block whitespace-nowrap"
              initial={{ y: shouldReduce ? 0 : "110%" }}
              animate={{ y: 0 }}
              transition={{
                duration: shouldReduce ? 0.2 : dur.md,
                ease: ease.outExpo,
                delay: shouldReduce ? 0 : 0.72,
              }}
            >
              {line2}
            </m.span>
          </span>
        )}
      </h1>

      {/* Pill Button CTA */}
      <m.div
        className="mt-8 sm:mt-10 flex justify-center"
        initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.sm, ease: ease.outExpo, delay: shouldReduce ? 0 : 1.2 }}
      >
        <Magnetic>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2.5 border border-white/20 bg-white/[0.06] backdrop-blur-xl text-[#F6F2E6] text-sm font-sans px-8 py-3.5 rounded-full hover:bg-white hover:text-[#0A0A0A] hover:border-white transition-all duration-300 shadow-2xl group"
          >
            <span>{cta}</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </Magnetic>
      </m.div>
    </div>
  );
}
