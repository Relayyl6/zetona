"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { dur, ease, stagger } from "@/lib/motion/tokens";
import { useLenisScroll } from "@/components/layout/SmoothScroll";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header({
  photoCount = 0,
}: {
  photoCount?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = React.useRef(0);
  const stationaryTimer = React.useRef<NodeJS.Timeout | null>(null);
  const { lenis, stop, start } = useLenisScroll();

  // Universal Headroom & Responsive Sticky Scroll Listener:
  // - Native window listener + Lenis hook ensures 100% reliability on desktop, trackpad, and mobile touch
  // - Immediately slides/pops into view the instant user scrolls UP (< -1px delta)
  // - Disappears immediately when scrolling DOWN (> 2px delta)
  // - Gracefully fades away when stationary / idle in one place (> 2.5s)
  // - Always pinned & visible at top of page (<= 60px) or when mobile drawer is open
  React.useEffect(() => {
    const handleScroll = (forcedY?: number) => {
      const currentY =
        typeof forcedY === "number"
          ? forcedY
          : window.pageYOffset || document.documentElement.scrollTop || 0;

      setIsScrolled(currentY > 20);

      // 1. Always keep header visible at the top of the page
      if (currentY <= 60) {
        if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
        setIsVisible(true);
        lastScrollY.current = currentY;
        return;
      }

      // 2. Always keep header visible if mobile menu drawer is open
      if (menuOpen) {
        if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
        setIsVisible(true);
        lastScrollY.current = currentY;
        return;
      }

      const delta = currentY - lastScrollY.current;

      // Scrolling DOWN -> disappear immediately
      if (delta > 2) {
        if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
        setIsVisible(false);
      }
      // Scrolling UP -> IMMEDIATELY show and stick atop!
      else if (delta < -1) {
        if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
        setIsVisible(true);

        // When stationary/staying in one place, fade away after 2.5s of idle reading
        stationaryTimer.current = setTimeout(() => {
          if (!menuOpen) {
            setIsVisible(false);
          }
        }, 2500);
      }

      lastScrollY.current = currentY;
    };

    // 1. Native window scroll listener (guaranteed on all platforms, touch, mouse, wheel)
    const onWindowScroll = () => handleScroll();
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    // 2. Lenis virtual scroll integration if active
    let lenisUnsub: (() => void) | null = null;
    if (lenis) {
      const onLenis = (l: any) => handleScroll(l.scroll);
      lenis.on("scroll", onLenis);
      lenisUnsub = () => lenis.off("scroll", onLenis);
    }

    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      if (lenisUnsub) lenisUnsub();
      if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
    };
  }, [lenis, menuOpen]);

  // Lock body scroll when full-screen menu is open
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Automatically close mobile menu if viewport resized to desktop (>= 1024px)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && menuOpen) {
        setMenuOpen(false);
        start();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen, start]);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      start();
    } else {
      setMenuOpen(true);
      stop();
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    start();
  };

  return (
    <>
      {/* ──────────────── TOP BAR (STICKY ATOP WITH ELEGANT FADING & FAST HEADROOM) ──────────────── */}
      <motion.header
        initial={false}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -20,
        }}
        transition={{
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          pointerEvents: isVisible ? "auto" : "none",
        }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 transition-[background-color,border-color,padding] duration-200 flex items-center justify-between ${
          isScrolled
            ? "py-3.5 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "py-5 md:py-6 bg-transparent"
        }`}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="pointer-events-auto font-serif text-[#F6F2E6] text-xl tracking-tight hover:opacity-70 transition-opacity"
          onClick={closeMenu}
        >
          {siteConfig.brandName}
        </Link>

        <div className="flex items-center gap-6 pointer-events-auto">
          {/* Desktop nav (Work, Archive, About) — Contact is presented exclusively as the pill CTA button */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
            {NAV_ITEMS.slice(1)
              .filter((item) => item.href !== "/contact")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#F6F2E6] text-[13px] font-sans tracking-wide hover:opacity-60 transition-opacity relative group drop-shadow-sm"
                >
                  {item.label}
                  {item.href === "/work" && photoCount > 0 && (
                    <sup className="text-[var(--fg-muted)] text-[10px] ml-0.5 font-mono">
                      {photoCount}
                    </sup>
                  )}
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#F6F2E6] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                </Link>
              ))}
          </nav>

          {/* Contact CTA – desktop */}
          <Link
            href="/contact"
            className="hidden lg:flex items-center gap-1.5 text-[#F6F2E6] text-[13px] font-sans border border-[var(--line-strong)] bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 hover:bg-[#F6F2E6] hover:text-[#0A0A0A] transition-colors duration-300"
          >
            Contact Me
            <span className="inline-block rotate-[-45deg] transition-transform duration-200 group-hover:rotate-0">
              →
            </span>
          </Link>

          {/* Hamburger Menu Toggle (Mobile/Tablet only – reserved for < lg) */}
          <button
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="lg:hidden p-3 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex flex-col justify-center items-center gap-1.5 hover:border-white transition-colors cursor-pointer shadow-lg relative z-50 pointer-events-auto"
          >
            <span
              className={`block w-5 h-[1.5px] bg-[#F6F2E6] transition-transform duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[4px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-[#F6F2E6] transition-transform duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
              }`}
            />
          </button>
        </div>
      </motion.header>

      {/* ──────────────── FULL-SCREEN MENU OVERLAY ──────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-nav-fullscreen-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-[#0A0A0A] text-[#F6F2E6] overflow-y-auto overscroll-contain flex flex-col"
          >
            <div className="min-h-[100dvh] w-full max-w-xl mx-auto px-6 py-6 sm:px-10 flex flex-col justify-between gap-6">
              {/* Top Bar with Wordmark & Close Button inside Overlay */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="font-serif text-[#F6F2E6] text-xl tracking-tight hover:opacity-70 transition-opacity"
                >
                  {siteConfig.brandName}
                </Link>
                <button
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-[#F6F2E6] hover:text-white transition-colors cursor-pointer shadow-lg"
                >
                  <span className="text-lg leading-none select-none">✕</span>
                </button>
              </div>

              {/* Nav links right in clear view */}
              <nav className="py-4 space-y-3 flex-1 flex flex-col justify-center" aria-label="Full-screen navigation">
                {NAV_ITEMS.map((item, i) => (
                  <div key={item.href} className="border-b border-white/10 pb-3">
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between py-2 text-[#F6F2E6] hover:text-[var(--accent-text)] transition-colors group"
                    >
                      <div className="flex items-baseline gap-4 font-condensed uppercase tracking-tight text-3xl sm:text-4xl md:text-5xl">
                        <span className="text-[var(--fg-dim)] font-mono text-xs sm:text-sm tracking-widest group-hover:text-[var(--accent-text)]">
                          0{i + 1}
                        </span>
                        <span>{item.label}</span>
                        {item.href === "/work" && photoCount > 0 && (
                          <sup className="text-[var(--fg-muted)] text-xs font-mono ml-1">
                            ({photoCount})
                          </sup>
                        )}
                      </div>
                      <span className="font-mono text-base text-[var(--fg-dim)] group-hover:text-[var(--accent-text)] group-hover:translate-x-1.5 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Bottom info in menu */}
              <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans text-[var(--fg-muted)] pb-6 flex-shrink-0">
                <div>
                  <p className="text-[#F6F2E6] font-medium">{siteConfig.descriptor}</p>
                  <p className="text-[var(--fg-dim)] font-mono">{siteConfig.city}, {siteConfig.country}</p>
                </div>
                <div className="flex items-center gap-6 font-mono">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {siteConfig.email}
                  </a>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-text)] hover:underline font-medium"
                  >
                    WhatsApp ↗
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
