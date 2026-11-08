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
 * Desktop navigation bar (Photos, Collections, Messages, Testimonials, Settings)
 * Rendered in the top header on md+ screens.
 */
export function AdminDesktopNav({ initialCount = 0 }: { initialCount?: number }) {
  const pathname = usePathname();
  const unhandledCount = useUnhandledCount(initialCount);

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--fg-muted)]">
      <Link
        href="/admin"
        className={`hover:text-[var(--fg)] transition-colors ${
          pathname === "/admin" ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        Photos
      </Link>
      <Link
        href="/admin/collections"
        className={`hover:text-[var(--fg)] transition-colors ${
          pathname.startsWith("/admin/collections") ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        Collections
      </Link>
      <Link
        href="/admin/enquiries"
        className={`hover:text-[var(--fg)] transition-colors flex items-center gap-1.5 ${
          pathname.startsWith("/admin/enquiries") ? "text-[var(--fg)] font-semibold" : ""
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
        className={`hover:text-[var(--fg)] transition-colors ${
          pathname.startsWith("/admin/settings") ? "text-[var(--fg)]" : ""
        }`}
      >
        Testimonials
      </Link>
      <Link
        href="/admin/settings"
        className={`hover:text-[var(--fg)] transition-colors ${
          pathname === "/admin/settings" ? "text-[var(--fg)] font-semibold" : ""
        }`}
      >
        Settings
      </Link>
    </nav>
  );
}

/**
 * Mobile secondary top navigation bar.
 * Persistently visible on mobile so Photos, Collections, Messages, Testimonials, Settings NEVER disappear!
 */
export function AdminMobileSubNav({ initialCount = 0 }: { initialCount?: number }) {
  const pathname = usePathname();
  const unhandledCount = useUnhandledCount(initialCount);

  return (
    <div
      aria-label="Admin mobile sub-navigation"
      className="md:hidden border-t border-[var(--line)] bg-[var(--bg)]/95 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs font-mono"
    >
      <Link
        href="/admin"
        className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
          pathname === "/admin"
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)]"
        }`}
      >
        Photos
      </Link>
      <Link
        href="/admin/collections"
        className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
          pathname.startsWith("/admin/collections")
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)]"
        }`}
      >
        Collections
      </Link>
      <Link
        href="/admin/enquiries"
        className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
          pathname.startsWith("/admin/enquiries")
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)]"
        }`}
      >
        <span>Messages</span>
        {unhandledCount > 0 && (
          <span
            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              pathname.startsWith("/admin/enquiries")
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
        className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
          pathname.startsWith("/admin/settings")
            ? "bg-[var(--accent)]/15 text-[var(--accent-text)] border border-[var(--accent)]/40 font-semibold"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)]"
        }`}
      >
        Testimonials
      </Link>
      <Link
        href="/admin/settings"
        className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
          pathname === "/admin/settings"
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)]"
        }`}
      >
        Settings
      </Link>
    </div>
  );
}

/**
 * Mobile persistent bottom navigation bar.
 * Contains all 5 sections (Photos, Collections, Messages, Testimonials, Settings).
 */
export function AdminBottomNav({ initialCount = 0 }: { initialCount?: number }) {
  const pathname = usePathname();
  const unhandledCount = useUnhandledCount(initialCount);

  return (
    <nav
      aria-label="Admin mobile navigation bottom bar"
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--line)] bg-[var(--bg-elevated)]/95 backdrop-blur-md px-2 py-2.5 flex items-center justify-around z-40 text-[11px] font-medium text-[var(--fg-muted)] shadow-2xl"
    >
      <Link
        href="/admin"
        className={`flex flex-col items-center gap-1 transition-colors ${
          pathname === "/admin" ? "text-[var(--accent-text)] font-semibold" : "hover:text-[var(--fg)]"
        }`}
      >
        <span className="text-base leading-none">📷</span>
        <span>Photos</span>
      </Link>
      <Link
        href="/admin/collections"
        className={`flex flex-col items-center gap-1 transition-colors ${
          pathname.startsWith("/admin/collections")
            ? "text-[var(--accent-text)] font-semibold"
            : "hover:text-[var(--fg)]"
        }`}
      >
        <span className="text-base leading-none">📁</span>
        <span>Collections</span>
      </Link>
      <Link
        href="/admin/enquiries"
        className={`flex flex-col items-center gap-1 relative transition-colors ${
          pathname.startsWith("/admin/enquiries")
            ? "text-[var(--accent-text)] font-semibold"
            : "hover:text-[var(--fg)]"
        }`}
      >
        <span className="text-base leading-none">✉️</span>
        <span>Messages</span>
        {unhandledCount > 0 && (
          <span className="absolute -top-1.5 right-1 bg-[var(--accent)] text-white text-[9px] font-mono min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shadow-md">
            {unhandledCount}
          </span>
        )}
      </Link>
      <Link
        href="/admin/settings#testimonials"
        className={`flex flex-col items-center gap-1 transition-colors ${
          pathname.startsWith("/admin/settings")
            ? "text-[var(--accent-text)] font-semibold"
            : "hover:text-[var(--fg)]"
        }`}
      >
        <span className="text-base leading-none">💬</span>
        <span>Reviews</span>
      </Link>
      <Link
        href="/admin/settings"
        className={`flex flex-col items-center gap-1 transition-colors ${
          pathname === "/admin/settings" ? "text-[var(--accent-text)] font-semibold" : "hover:text-[var(--fg)]"
        }`}
      >
        <span className="text-base leading-none">⚙️</span>
        <span>Settings</span>
      </Link>
    </nav>
  );
}
