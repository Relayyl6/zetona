"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shared hook to track unhandled messages dynamically.
 * Listens to custom event "admin-enquiries-changed", window focus, and polls periodically.
 */
export function useUnhandledCount(initialCount = 0) {
  const [count, setCount] = useState<number>(initialCount);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries/count", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.unhandled === "number") {
          setCount(data.unhandled);
        }
      }
    } catch (err) {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    refreshCount();

    const handleChanged = () => {
      refreshCount();
    };

    window.addEventListener("admin-enquiries-changed", handleChanged);
    window.addEventListener("focus", handleChanged);
    const interval = setInterval(refreshCount, 15000);

    return () => {
      window.removeEventListener("admin-enquiries-changed", handleChanged);
      window.removeEventListener("focus", handleChanged);
      clearInterval(interval);
    };
  }, [refreshCount]);

  return count;
}

/**
 * Helper hook to track URL hash changes for distinguishing #testimonials vs /admin/settings.
 */
function useUrlHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash);

    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return [hash, setHash] as const;
}

/**
 * Desktop navigation bar (Photos, Collections, Messages, Testimonials, Settings)
 * Rendered in the top header on md+ screens.
 */
export function AdminDesktopNav({ initialCount = 0 }: { initialCount?: number }) {
  const pathname = usePathname();
  const unhandledCount = useUnhandledCount(initialCount);
  const [hash, setHash] = useUrlHash();

  const isPhotos = pathname === "/admin" || pathname.startsWith("/admin/photos");
  const isCollections = pathname.startsWith("/admin/collections");
  const isEnquiries = pathname.startsWith("/admin/enquiries");
  const isTestimonials = pathname.startsWith("/admin/settings") && hash === "#testimonials";
  const isSettings = pathname === "/admin/settings" && hash !== "#testimonials";

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--fg-muted)]">
      <Link
        href="/admin"
        onClick={() => setHash("")}
        className={`hover:text-[var(--fg)] transition-colors ${
          isPhotos ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        Photos
      </Link>
      <Link
        href="/admin/collections"
        onClick={() => setHash("")}
        className={`hover:text-[var(--fg)] transition-colors ${
          isCollections ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        Collections
      </Link>
      <Link
        href="/admin/enquiries"
        onClick={() => setHash("")}
        className={`hover:text-[var(--fg)] transition-colors flex items-center gap-1.5 ${
          isEnquiries ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        <span>Messages</span>
        {unhandledCount > 0 && (
          <span className="bg-[var(--accent)] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shadow-sm transition-transform scale-100">
            {unhandledCount}
          </span>
        )}
      </Link>
      <Link
        href="/admin/settings#testimonials"
        onClick={() => setHash("#testimonials")}
        className={`hover:text-[var(--fg)] transition-colors ${
          isTestimonials ? "text-[var(--accent-text)] font-semibold" : ""
        }`}
      >
        Testimonials
      </Link>
      <Link
        href="/admin/settings"
        onClick={() => setHash("")}
        className={`hover:text-[var(--fg)] transition-colors ${
          isSettings ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        Settings
      </Link>
    </nav>
  );
}

/**
 * Mobile secondary top navigation bar.
 * Persistently visible beneath header on mobile so Photos, Collections, Messages, Testimonials, Settings NEVER disappear!
 * Features smooth momentum horizontal scrolling with right-edge breathing space so no item is clipped.
 */
export function AdminMobileSubNav({ initialCount = 0 }: { initialCount?: number }) {
  const pathname = usePathname();
  const unhandledCount = useUnhandledCount(initialCount);
  const [hash, setHash] = useUrlHash();

  const isPhotos = pathname === "/admin" || pathname.startsWith("/admin/photos");
  const isCollections = pathname.startsWith("/admin/collections");
  const isEnquiries = pathname.startsWith("/admin/enquiries");
  const isTestimonials = pathname.startsWith("/admin/settings") && hash === "#testimonials";
  const isSettings = pathname === "/admin/settings" && hash !== "#testimonials";

  return (
    <div
      aria-label="Admin mobile sub-navigation"
      className="md:hidden border-t border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 overflow-x-auto touch-pan-x scroll-smooth no-scrollbar flex items-center gap-2 text-xs font-mono"
    >
      <Link
        href="/admin"
        onClick={() => setHash("")}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
          isPhotos
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm ring-1 ring-[var(--accent)]/50"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] hover:border-white/20"
        }`}
      >
        Photos
      </Link>

      <Link
        href="/admin/collections"
        onClick={() => setHash("")}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
          isCollections
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm ring-1 ring-[var(--accent)]/50"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] hover:border-white/20"
        }`}
      >
        Collections
      </Link>

      <Link
        href="/admin/enquiries"
        onClick={() => setHash("")}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
          isEnquiries
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm ring-1 ring-[var(--accent)]/50"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] hover:border-white/20"
        }`}
      >
        <span>Messages</span>
        {unhandledCount > 0 && (
          <span
            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold shadow-sm ${
              isEnquiries
                ? "bg-white text-[var(--accent)]"
                : "bg-[var(--accent)] text-white"
            }`}
          >
            {unhandledCount}
          </span>
        )}
      </Link>

      <Link
        href="/admin/settings#testimonials"
        onClick={() => setHash("#testimonials")}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
          isTestimonials
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm ring-1 ring-[var(--accent)]/50"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] hover:border-white/20"
        }`}
      >
        Testimonials
      </Link>

      <Link
        href="/admin/settings"
        onClick={() => setHash("")}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
          isSettings
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm ring-1 ring-[var(--accent)]/50"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] hover:border-white/20"
        }`}
      >
        Settings
      </Link>

      {/* Trailing spacer ensures 'Settings' has comfortable padding and is never clipped at the screen edge */}
      <div className="w-4 shrink-0" aria-hidden="true" />
    </div>
  );
}
