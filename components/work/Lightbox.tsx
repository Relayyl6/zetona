"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { PhotoDTO } from "@/lib/db/queries";
import { useLenisScroll } from "@/components/layout/SmoothScroll";
import { dur, ease } from "@/lib/motion/tokens";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface LightboxProps {
  photos: PhotoDTO[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const { stop, start } = useLenisScroll();
  const shouldReduce = useReducedMotion();

  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < photos.length;
  const currentPhoto = isOpen ? photos[currentIndex] : null;

  useEffect(() => {
    if (isOpen) {
      stop();
    } else {
      start();
    }
    return () => start();
  }, [isOpen, stop, start]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((currentIndex! + 1) % photos.length);
      if (e.key === "ArrowLeft") onNavigate((currentIndex! - 1 + photos.length) % photos.length);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && currentPhoto && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label={currentPhoto.alt || "Photograph preview"}
          className="fixed inset-0 z-[var(--z-lightbox,80)] bg-[var(--bg)]/95 flex flex-col justify-between p-6 md:p-10 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduce ? 0.15 : dur.sm, ease: ease.outExpo }}
        >
          {/* Top Bar: Counter & Close */}
          <div className="flex items-center justify-between text-xs font-mono text-[var(--fg-muted)]">
            <span aria-live="polite">
              [ 0{currentIndex + 1} / {photos.length < 10 ? `0${photos.length}` : photos.length} ]
            </span>
            <button
              onClick={onClose}
              aria-label="Close lightbox"
              className="p-2 text-[var(--fg)] hover:text-[var(--accent)] transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Image Container with contain fit */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={getOptimizedSrc(currentPhoto.displayKey, 1800)}
                alt={currentPhoto.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Left / Right click navigation zones */}
            <button
              onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
              aria-label="Previous photograph"
              className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-start text-[var(--fg-muted)] hover:text-[var(--fg)] text-2xl px-4 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => onNavigate((currentIndex + 1) % photos.length)}
              aria-label="Next photograph"
              className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end text-[var(--fg-muted)] hover:text-[var(--fg)] text-2xl px-4 transition-colors"
            >
              ›
            </button>
          </div>

          {/* Bottom Caption */}
          <div className="flex items-baseline justify-between text-xs font-sans text-[var(--fg-muted)]">
            <div>
              {currentPhoto.title && (
                <p className="text-[var(--fg)] font-medium">{currentPhoto.title}</p>
              )}
              {currentPhoto.caption && <p className="mt-0.5">{currentPhoto.caption}</p>}
            </div>
            <p className="text-[var(--fg-dim)] text-[11px] font-mono">
              Use ← / → keys to navigate
            </p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
