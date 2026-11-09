"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to fetch dynamic unhandled enquiries count.
 * Refreshes on window focus, custom 'admin-enquiries-changed' event,
 * and periodic poll.
 */
function useUnhandledEnquiriesCount(initialCount: number = 0) {
  const [count, setCount] = useState(initialCount);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries/count");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.unhandled === "number") {
          setCount(data.unhandled);
        }
      }
    } catch {
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
 * Custom hook to fetch pending client reviews count requiring approval.
 */
function usePendingReviewsCount() {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials/count");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.pendingCount === "number") {
          setCount(data.pendingCount);
        }
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    refreshCount();

    const handleChanged = () => refreshCount();
    window.addEventListener("admin-testimonials-changed", handleChanged);
    window.addEventListener("focus", handleChanged);
    const interval = setInterval(refreshCount, 20000);

    return () => {
      window.removeEventListener("admin-testimonials-changed", handleChanged);
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
 */
export function AdminNav({ initialCount = 0 }: { initialCount?: number } = {}) {
  const pathname = usePathname();
  const [hash, setHash] = useUrlHash();
  const unhandledCount = useUnhandledEnquiriesCount(initialCount);
  const pendingReviewsCount = usePendingReviewsCount();

  const isPhotos = pathname === "/admin" || pathname.startsWith("/admin/photos");
  const isCollections = pathname.startsWith("/admin/collections");
  const isEnquiries = pathname.startsWith("/admin/enquiries");
  const isTestimonials = pathname.startsWith("/admin/settings") && hash === "#testimonials";
  const isSettings = pathname.startsWith("/admin/settings") && hash !== "#testimonials";

  return (
    <nav className="flex items-center gap-6 text-sm text-[var(--fg-muted)]">
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
        className={`hover:text-[var(--fg)] transition-colors flex items-center gap-1.5 ${
          isTestimonials ? "text-[var(--accent-text)] font-semibold" : ""
        }`}
      >
        <span>Testimonials</span>
        {pendingReviewsCount > 0 && (
          <span className="bg-amber-400 text-black text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shadow-sm">
            {pendingReviewsCount}
          </span>
        )}
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
 */
export function AdminMobileNav({ initialCount = 0 }: { initialCount?: number } = {}) {
  const pathname = usePathname();
  const [hash, setHash] = useUrlHash();
  const unhandledCount = useUnhandledEnquiriesCount(initialCount);
  const pendingReviewsCount = usePendingReviewsCount();

  const isPhotos = pathname === "/admin" || pathname.startsWith("/admin/photos");
  const isCollections = pathname.startsWith("/admin/collections");
  const isEnquiries = pathname.startsWith("/admin/enquiries");
  const isTestimonials = pathname.startsWith("/admin/settings") && hash === "#testimonials";
  const isSettings = pathname.startsWith("/admin/settings") && hash !== "#testimonials";

  return (
    <div
      role="navigation"
      aria-label="Admin Navigation"
      className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 px-4 text-xs font-mono border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md sticky top-14 z-30 shadow-md"
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
        className={`shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
          isTestimonials
            ? "bg-[var(--accent)] text-white font-semibold shadow-sm ring-1 ring-[var(--accent)]/50"
            : "text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] hover:border-white/20"
        }`}
      >
        <span>Testimonials</span>
        {pendingReviewsCount > 0 && (
          <span
            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold shadow-sm ${
              isTestimonials
                ? "bg-amber-300 text-black"
                : "bg-amber-400 text-black"
            }`}
          >
            {pendingReviewsCount}
          </span>
        )}
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
      <div className="w-2 shrink-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
}

// Aliases for compatibility
export const AdminDesktopNav = AdminNav;
export const AdminMobileSubNav = AdminMobileNav;

