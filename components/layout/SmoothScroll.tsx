"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  stop: () => {},
  start: () => {},
});

export const useLenisScroll = () => useContext(SmoothScrollContext);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Fast, ultra-responsive, silky smooth kinetic scroll: lerp 0.22 eliminates sluggish inertia
    const lenis = new Lenis({
      lerp: 0.22,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.5,
      smoothWheel: true,
      syncTouch: false,
    });

    setLenisInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  const stop = () => lenisInstance?.stop();
  const start = () => lenisInstance?.start();

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
