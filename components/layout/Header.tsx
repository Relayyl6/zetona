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
  const menuOpenRef = React.useRef(menuOpen);
  React.useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const isHoveredRef = React.useRef(false);
  const autoHideTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { lenis, stop, start } = useLenisScroll();

  // Bulletproof Headroom Navigation:
  // - Top of page (<= 60px): ALWAYS visible
  // - Scrolling DOWN: Immediately hides (default state down the page is hidden)
  // - Scrolling UP from ANY point (including footer): Momentarily fades down into view (2.8s auto-hide)
  // - Hovering on desktop keeps it visible while interacting
  React.useEffect(() => {
    const getScrollY = () =>
      window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    // Check initial position on mount: if already scrolled down, default to hidden
    const initialY = getScrollY();
    if (initialY > 60) {
      setIsVisible(false);
      setIsScrolled(true);
    } else {
      setIsVisible(true);
      setIsScrolled(initialY > 20);
    }

    let lastY = initialY;
    let accumulatedDown = 0;
    let accumulatedUp = 0;

    const clearTimer = () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
    };

    const triggerMomentaryShow = () => {
      setIsVisible(true);
      clearTimer();
      // Auto-hide after 2.8s of stationary reading when not at top and menu not open
      autoHideTimerRef.current = setTimeout(() => {
        const y = getScrollY();
        if (y > 60 && !menuOpenRef.current && !isHoveredRef.current) {
          setIsVisible(false);
        }
      }, 2800);
    };

    const handleScrollUpdate = () => {
      const currentY = getScrollY();
      setIsScrolled(currentY > 20);

      // 1. At top of page (<= 60px): ALWAYS visible, no auto-hide
      if (currentY <= 60) {
        clearTimer();
        setIsVisible(true);
        accumulatedDown = 0;
        accumulatedUp = 0;
        lastY = currentY;
        return;
      }

      // 2. Mobile drawer menu open: keep visible
      if (menuOpenRef.current) {
        setIsVisible(true);
        lastY = currentY;
        return;
      }

      const delta = currentY - lastY;

      // 3. Scrolling DOWN (delta > 0):
      // HIDE immediately on intentional downward scroll.
      // Default state while browsing down the page is hidden.
      if (delta > 0) {
        accumulatedUp = 0;
        accumulatedDown += delta;
        if (accumulatedDown >= 8) {
          clearTimer();
          if (!isHoveredRef.current) {
            setIsVisible(false);
          }
          accumulatedDown = 0;
        }
      }
      // 4. Scrolling UP (delta < 0):
      // ANY motion of scrolling up brings it back momentarily (fades down into view)!
      else if (delta < 0) {
        accumulatedDown = 0;
        accumulatedUp += Math.abs(delta);
        if (accumulatedUp >= 10) {
          triggerMomentaryShow();
          accumulatedUp = 0;
        }
      }

      lastY = currentY;
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScrollUpdate();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimer();
    };
  }, []);

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

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    const y = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    if (y > 60 && !menuOpenRef.current) {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = setTimeout(() => {
        const currentY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        if (currentY > 60 && !menuOpenRef.current && !isHoveredRef.current) {
          setIsVisible(false);
        }
      }, 2500);
    }
  };

  return (
    <>
      {/* ──────────────── TOP BAR (STICKY ATOP WITH ELEGANT FADING & FAST HEADROOM) ──────────────── */}
      <motion.header
        initial={false}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -35,
        }}
        transition={{
          duration: 0.25,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 transition-[background-color,border-color,padding] duration-200 flex items-center justify-between ${
          isScrolled
            ? "py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "py-4 sm:py-5 md:py-6 bg-transparent"
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
            <div className="min-h-[100dvh] w-full max-w-4xl lg:max-w-5xl mx-auto px-6 py-6 sm:px-10 md:px-16 flex flex-col justify-between gap-6 md:gap-8">
              {/* Top Bar with Wordmark & Close Button inside Overlay */}
              <div className="flex items-center justify-between pb-4 md:pb-6 border-b border-white/10 flex-shrink-0">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="font-serif text-[#F6F2E6] text-xl md:text-2xl tracking-tight hover:opacity-70 transition-opacity"
                >
                  {siteConfig.brandName}
                </Link>
                <button
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-[#F6F2E6] hover:text-white transition-colors cursor-pointer shadow-lg"
                >
                  <span className="text-lg md:text-xl leading-none select-none">✕</span>
                </button>
              </div>

              {/* Nav links right in clear view */}
              <nav className="py-4 md:py-8 space-y-3 md:space-y-4 flex-1 flex flex-col justify-center" aria-label="Full-screen navigation">
                {NAV_ITEMS.map((item, i) => (
                  <div key={item.href} className="border-b border-white/10 pb-3 md:pb-4">
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between py-2 text-[#F6F2E6] hover:text-[var(--accent-text)] transition-colors group"
                    >
                      <div className="flex items-baseline gap-4 md:gap-6 font-condensed uppercase tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                        <span className="text-[var(--fg-dim)] font-mono text-xs sm:text-sm md:text-base tracking-widest group-hover:text-[var(--accent-text)]">
                          0{i + 1}
                        </span>
                        <span>{item.label}</span>
                        {item.href === "/work" && photoCount > 0 && (
                          <sup className="text-[var(--fg-muted)] text-xs md:text-sm font-mono ml-1">
                            ({photoCount})
                          </sup>
                        )}
                      </div>
                      <span className="font-mono text-base md:text-xl text-[var(--fg-dim)] group-hover:text-[var(--accent-text)] group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Bottom info in menu */}
              <div className="border-t border-white/10 pt-5 md:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs md:text-sm font-sans text-[var(--fg-muted)] pb-6 md:pb-8 flex-shrink-0">
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
