"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from "motion/react";
import { PhotoDTO } from "@/lib/db/queries";
import { spring, dur, ease } from "@/lib/motion/tokens";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface CropFrameProps {
  photos: PhotoDTO[];
  className?: string;
}

export function CropFrame({ photos, className = "" }: CropFrameProps) {
  const [index, setIndex] = useState(0);
  const shouldReduce = useReducedMotion();

  // Mouse ease within ±6%
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, spring.soft);
  const springY = useSpring(mouseY, spring.soft);

  useEffect(() => {
    if (shouldReduce || photos.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [shouldReduce, photos.length]);

  const activePhoto = photos[index] || photos[0];

  return (
    <div
      className={`relative p-3 ${className}`}
      onMouseMove={(e) => {
        if (shouldReduce) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 16);
        mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 16);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      <m.div
        style={{ x: springX, y: springY }}
        className="relative aspect-[3/4] w-48 sm:w-60 md:w-72 overflow-hidden shadow-2xl bg-[var(--bg-elevated)]"
      >
        {/* Photos cycling inside transform window */}
        <AnimatePresence mode="wait">
          {activePhoto && (
            <m.div
              key={activePhoto.id}
              className="absolute inset-0"
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)", scale: 1.08 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={shouldReduce ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: ease.outExpo }}
            >
              <Image
                src={getOptimizedSrc(activePhoto.displayKey, 600)}
                alt={activePhoto.alt}
                fill
                className="object-cover"
                style={{
                  objectPosition: `${(activePhoto.focal?.x ?? 0.5) * 100}% ${(activePhoto.focal?.y != null ? Math.min(activePhoto.focal.y, 0.15) : 0.12) * 100}%`,
                }}
                sizes="300px"
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* Four Photoshop-style corner handles */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none" />

        {/* Thin outline selection border */}
        <div className="absolute inset-0 border border-white/40 pointer-events-none" />
      </m.div>
    </div>
  );
}
