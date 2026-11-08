"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CollectionDTO } from "@/lib/db/queries";
import { BlurBackdrop } from "@/components/ui/BlurBackdrop";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskLines } from "@/components/motion/MaskLines";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface CinematicSectionProps {
  collection: CollectionDTO;
  year?: string;
}

export function CinematicSection({
  collection,
  year = "2026",
}: CinematicSectionProps) {
  const photo = collection.coverPhoto;
  if (!photo) return null;

  return (
    <section className="relative min-h-screen flex flex-col justify-between p-6 md:p-12 overflow-hidden border-t border-[var(--line)]">
      {/* Blurred background photo (Pattern P7 from frames 10-12) */}
      <BlurBackdrop photo={photo} brightness={0.55} />

      {/* Top meta */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest">
          • Featured Story
        </span>
        <span className="font-mono text-[var(--fg-dim)] text-xs">
          [ {year} ]
        </span>
      </div>

      {/* Center sharp inset image */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
        <Link
          href={`/work/${collection.slug}`}
          data-cursor="view"
          className="group block relative"
        >
          <ImageReveal>
            <div className="w-[72vw] sm:w-[50vw] md:w-[35vw] max-w-md aspect-[3/4] relative overflow-hidden shadow-2xl bg-[var(--bg-elevated)] ring-1 ring-white/10">
              <Image
                src={getOptimizedSrc(photo.displayKey, 1000)}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{
                  objectPosition: `${(photo.focal?.x ?? 0.5) * 100}% ${(photo.focal?.y != null ? Math.min(photo.focal.y, 0.15) : 0.12) * 100}%`,
                }}
                sizes="(min-width:1024px) 35vw, 70vw"
              />
            </div>
          </ImageReveal>
        </Link>
      </div>

      {/* Bottom title & link */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <MaskLines
            as="h2"
            className="font-condensed uppercase text-[var(--fg)] leading-none"
            style={{ fontSize: "var(--fs-h1)" }}
          >
            {collection.title}
          </MaskLines>
          {collection.description && (
            <p className="mt-2 text-[var(--fg-muted)] font-sans text-sm max-w-md">
              {collection.description}
            </p>
          )}
        </div>
        <Link
          href={`/work/${collection.slug}`}
          className="text-sm font-sans text-[var(--accent-text)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-2 group"
        >
          Explore gallery
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
