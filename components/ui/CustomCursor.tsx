"use client";

import React, { useEffect, useState } from "react";
import { m, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion/tokens";

export function CustomCursor() {
  const shouldReduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [cursorState, setCursorState] = useState<"default" | "view" | "drag" | "expand">("default");

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, spring.soft);
  const springY = useSpring(mouseY, spring.soft);

  useEffect(() => {
    // Only active on desktop with fine pointer
    const isPointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isPointerFine || shouldReduce) return;

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check target cursor dataset
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      const nextType = (target?.dataset.cursor as "view" | "drag" | "expand") || "default";
      setCursorState((prev) => (prev !== nextType ? nextType : prev));
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [mouseX, mouseY, shouldReduce]);

  if (!enabled || shouldReduce || cursorState === "default") {
    return null;
  }

  return (
    <m.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[var(--z-cursor,60)] -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center bg-white text-black font-sans font-medium text-xs shadow-2xl tracking-wider select-none uppercase"
      style={{
        x: springX,
        y: springY,
        width: 72,
        height: 72,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {cursorState === "view" && <span>View ↗</span>}
      {cursorState === "drag" && <span>Drag</span>}
      {cursorState === "expand" && <span>Expand ⤢</span>}
    </m.div>
  );
}
