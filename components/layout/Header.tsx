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
  const lastShowTimeRef = React.useRef(0);
  const { lenis, stop, start } = useLenisScroll();

  const clearAutoHideTimer = React.useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const showNav = React.useCallback(() => {
    setIsVisible(true);
    lastShowTimeRef.current = Date.now();
    clearAutoHideTimer();

    const getScrollY = () =>
      window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    // When scrolled down (> 60px) and drawer is not open, automatically fade away after 3s of reading
    if (getScrollY() > 60 && !menuOpenRef.current) {
      autoHideTimerRef.current = setTimeout(() => {
        const y = getScrollY();
        if (y > 60 && !menuOpenRef.current && !isHoveredRef.current) {
          setIsVisible(false);
        }
      }, 3000);
    }
  }, [clearAutoHideTimer]);

  const hideNav = React.useCallback(() => {
    if (menuOpenRef.current) return;
    // 800ms cooldown: prevent thumb-lift bounce after a scroll-up swipe from immediately re-hiding the nav
    if (Date.now() - lastShowTimeRef.current < 800) return;
    if (isHoveredRef.current) return;

    clearAutoHideTimer();
    setIsVisible(false);
  }, [clearAutoHideTimer]);

  // Bulletproof Headroom Navigation:
  // - Top of page (<= 60px): ALWAYS visible
  // - Scrolling DOWN: Immediately hides (default state down the page is hidden)
  // - Scrolling UP from ANY point (including footer): Momentarily fades down into view (3s auto-hide)
  // - 800ms cooldown protects against thumb-lift bounce on touch screens
  // - Direct touchmove + wheel hardware hooks ensure 100% responsiveness on Android/iOS/Desktop
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
    let minReachedY = initialY;
    let maxReachedY = initialY;

    // 1. Scroll listener using Peak/Trough distance tracking
    const handleScroll = () => {
      const currentY = getScrollY();
      setIsScrolled(currentY > 20);

      // At the top of the page (<= 60px): ALWAYS visible, cancel any timer
      if (currentY <= 60) {
        clearAutoHideTimer();
        setIsVisible(true);
        minReachedY = currentY;
        maxReachedY = currentY;
        lastY = currentY;
        return;
      }

      if (menuOpenRef.current) {
        lastY = currentY;
        return;
      }

      const delta = currentY - lastY;

      // Scrolling DOWN
      if (delta > 0) {
        if (currentY > maxReachedY) {
          maxReachedY = currentY;
        }
        // User has scrolled down by at least 30px from the highest point
        const downDistance = currentY - minReachedY;
        if (downDistance >= 30) {
          hideNav();
          minReachedY = currentY;
        }
      }
      // Scrolling UP
      else if (delta < 0) {
        if (currentY < minReachedY) {
          minReachedY = currentY;
        }
        // User has scrolled up by at least 15px from the lowest point reached
        const upDistance = maxReachedY - currentY;
        if (upDistance >= 15) {
          showNav();
          maxReachedY = currentY;
        }
      }

      lastY = currentY;
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 2. Mobile touch gesture listener: instantaneous hardware touch reaction
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0]?.clientY || 0;
      const diff = touchY - touchStartY; // positive = dragging finger down = scrolling UP

      const currentY = getScrollY();
      if (currentY <= 60 || menuOpenRef.current) return;

      // Dragging finger DOWN by > 20px = intentional scroll UP
      if (diff > 20) {
        showNav();
        touchStartY = touchY;
      }
      // Dragging finger UP by > 35px = intentional scroll DOWN
      else if (diff < -35) {
        hideNav();
        touchStartY = touchY;
      }
    };

    // 3. Desktop wheel / trackpad listener: instantaneous hardware wheel reaction
    const onWheel = (e: WheelEvent) => {
      const currentY = getScrollY();
      if (currentY <= 60 || menuOpenRef.current) return;

      if (e.deltaY < -15) {
        showNav();
      } else if (e.deltaY > 25) {
        hideNav();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
      clearAutoHideTimer();
    };
  }, [clearAutoHideTimer, hideNav, showNav]);

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
    clearAutoHideTimer();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    const y = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    if (y > 60 && !menuOpenRef.current) {
      clearAutoHideTimer();
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
