"use client";

import React from "react";
import Image from "next/image";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface FocalPointPickerProps {
  imageUrl: string;
  focalX: number;
  focalY: number;
  onChange: (focal: { x: number; y: number }) => void;
}

export function FocalPointPicker({
  imageUrl,
  focalX,
  focalY,
  onChange,
}: FocalPointPickerProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onChange({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider">
          Focal Point (Tap the subject&apos;s face)
        </label>
        <span className="text-xs font-mono text-[var(--fg-dim)]">
          X: {(focalX * 100).toFixed(0)}% · Y: {(focalY * 100).toFixed(0)}%
        </span>
      </div>

      <div
        onClick={handleClick}
        className="relative aspect-[3/4] max-w-sm overflow-hidden bg-[var(--bg-elevated)] border border-[var(--line)] cursor-crosshair group rounded-md"
      >
        <Image
          src={getOptimizedSrc(imageUrl, 800)}
          alt="Set focal point"
          fill
          className="object-cover select-none pointer-events-none"
        />

        {/* Reticle target indicator */}
        <div
          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/20 pointer-events-none shadow-lg transition-all duration-150"
          style={{
            left: `${focalX * 100}%`,
            top: `${focalY * 100}%`,
          }}
        >
          <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
      <p className="mt-2 text-xs font-sans text-[var(--fg-dim)]">
        Focal point keeps faces centered across all crop presets and responsive screens.
      </p>
    </div>
  );
}
