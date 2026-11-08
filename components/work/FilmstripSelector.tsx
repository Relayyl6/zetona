"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { CollectionDTO, PhotoDTO } from "@/lib/db/queries";
import { dur, ease } from "@/lib/motion/tokens";

interface FilmstripItem {
  id: string;
  title: string;
  category?: string;
  description?: string;
  displayKey: string;
  alt: string;
  href: string;
  focal?: { x: number; y: number };
}

interface FilmstripSelectorProps {
  collections?: CollectionDTO[];
  photos?: PhotoDTO[];
  title?: string;
  badge?: string;
}

export function FilmstripSelector({
  collections,
  photos,
  title = "Selected Work",
  badge = "• Selected Work",
}: FilmstripSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduce = useReducedMotion();

  // Normalize items whether collections or photos are passed
  const items: FilmstripItem[] = React.useMemo(() => {
    if (photos && photos.length > 0) {
      return photos.map((p) => ({
        id: p.id,
        title: p.title || "PORTRAIT",
        category: p.collection?.title?.toUpperCase() || "PORTRAIT",
        description:
          p.caption ||
          "Capturing personality through light, expression, and atmosphere. Each portrait is thoughtfully composed to reveal something genuine—balancing natural emotion with a refined visual style.",
        displayKey: p.displayKey,
        alt: p.alt || p.title || "Photography showcase",
        href: p.collection?.slug ? `/work/${p.collection.slug}` : "/work",
        focal: p.focal,
      }));
    }

    if (collections && collections.length > 0) {
      return collections.map((col) => ({
        id: col.id,
        title: col.title,
        category: "COLLECTION",
        description: col.description || "Curated photographic archive exploring light, silhouette, and human form.",
        displayKey: col.coverPhoto?.displayKey || "",
        alt: col.coverPhoto?.alt || col.title,
        href: `/work/${col.slug}`,
        focal: col.coverPhoto?.focal,
      }));
    }

    return [];
  }, [collections, photos]);

  if (items.length === 0) return null;

  const current = items[activeIndex] || items[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowLeft") {
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <section
      className="relative min-h-screen bg-[var(--bg)] border-t border-[var(--line)] py-20 px-6 md:px-12 flex flex-col justify-between select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Interactive filmstrip portfolio selector"
    >
      {/* Header index label */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest">
            {badge}
          </span>
          <span className="hidden sm:inline font-mono text-[var(--fg-dim)] text-xs">
            / {title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[var(--fg-dim)] text-xs bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded">
            [ 0{activeIndex + 1} / 0{items.length} ]
          </span>
          <Link
            href="/work"
            className="text-xs font-sans text-[var(--fg-muted)] hover:text-[#F6F2E6] transition-colors hidden md:inline-flex items-center gap-1"
          >
            View all collections →
          </Link>
        </div>
      </div>

      {/* Main stage: Image centered + Caption (Pattern P5 from Kristin reference Image 1) */}
      <div className="flex-1 grid lg:grid-cols-12 gap-10 items-center my-auto">
        {/* Left: Large Active Image (Pure GPU opacity/scale transition for zero layout lag) */}
        <div className="lg:col-span-7 lg:col-start-1">
          <div className="aspect-[3/4] relative overflow-hidden bg-[var(--bg-elevated)] max-w-lg mx-auto shadow-2xl rounded-sm ring-1 ring-white/10 transform-gpu">
            <AnimatePresence mode="wait">
              {current.displayKey && (
                <m.div
                  key={current.id}
                  className="absolute inset-0 will-change-[opacity,transform]"
                  initial={
                    shouldReduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.98 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    shouldReduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 1.02 }
                  }
                  transition={{ duration: shouldReduce ? 0.15 : 0.35, ease: ease.outExpo }}
                >
                  <Image
                    src={current.displayKey}
                    alt={current.alt}
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: `${(current.focal?.x ?? 0.5) * 100}% ${(current.focal?.y ?? 0.35) * 100}%`,
                    }}
                    sizes="(min-width:1024px) 45vw, 90vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Caption & details matching Image 1 */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <m.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: ease.outExpo }}
            >
              <span className="font-mono text-[var(--accent-text)] text-xs uppercase tracking-widest mb-3 block">
                {current.category}
              </span>
              <h3
                className="font-condensed uppercase text-[var(--fg)] leading-none tracking-tight mb-5"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
              >
                {current.title}
              </h3>
              {current.description && (
                <p className="text-[var(--fg-muted)] font-sans text-sm md:text-base leading-relaxed mb-8 max-w-md">
                  {current.description}
                </p>
              )}
              
              {/* Pill Button with hardware acceleration */}
              <div>
                <Link
                  href={current.href}
                  className="inline-flex items-center gap-2.5 bg-white/[0.08] border border-white/20 text-[#F6F2E6] text-sm font-sans px-6 py-3 rounded-full hover:bg-white hover:text-[#0A0A0A] hover:border-white transition-all duration-300 shadow-xl group"
                >
                  <span>View Details</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Filmstrip Dock: Hardware-accelerated opaque dock (Zero blur overhead) */}
      <div className="pt-10 border-t border-[var(--line)]">
        <div className="flex justify-center">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-xl p-2.5 shadow-2xl flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full transform-gpu">
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  aria-current={isActive ? "true" : undefined}
                  className="flex flex-col items-center gap-1.5 focus:outline-none group flex-shrink-0 cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 relative overflow-hidden rounded transition-all duration-200 transform-gpu ${
                      isActive
                        ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-black scale-105 brightness-100 shadow-lg"
                        : "opacity-45 hover:opacity-90"
                    }`}
                  >
                    {item.displayKey && (
                      <Image
                        src={item.displayKey}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                        loading="lazy"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
