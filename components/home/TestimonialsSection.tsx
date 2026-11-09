"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { TestimonialDTO, mockTestimonials } from "@/lib/db/queries";
import { ease } from "@/lib/motion/tokens";
import { useLenisScroll } from "@/components/layout/SmoothScroll";

interface TestimonialsSectionProps {
  testimonials?: TestimonialDTO[];
}

const TESTIMONIAL_DURATION = 6000; // 6 seconds per testimonial

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Pattern P7 / P8: Cinematic Testimonials Section with Big Typographic Initials Monograms
 * Bespoke entrance animations, blur-to-sharp crossfades, admin editable data,
 * and deep-linked "Leave a Review" modal pane (/#leaveareview).
 */
export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const shouldReduce = useReducedMotion();
  const { stop, start } = useLenisScroll();

  // "Leave a review" modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [website, setWebsite] = useState(""); // Honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const list = testimonials && testimonials.length > 0 ? testimonials : mockTestimonials;
  const current = list[activeIdx % list.length];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deep-link support: Automatically open review pane directly in view when visiting /#leaveareview or /#review
  useEffect(() => {
    const handleHash = () => {
      if (typeof window === "undefined") return;
      const h = window.location.hash.toLowerCase();
      if (h === "#leaveareview" || h === "#review" || h === "#leave-a-review") {
        setIsReviewOpen(true);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Lock background scroll & pause Lenis while review modal is open so nothing jumps or scrolls
  useEffect(() => {
    if (isReviewOpen) {
      stop();
      document.body.style.overflow = "hidden";
    } else {
      start();
      document.body.style.overflow = "";
    }
    return () => {
      start();
      document.body.style.overflow = "";
    };
  }, [isReviewOpen, stop, start]);

  // Keyboard navigation & accessibility (close on Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isReviewOpen) {
        setIsReviewOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isReviewOpen]);

  // Auto-advance timer across testimonials
  useEffect(() => {
    if (shouldReduce || isPaused || isReviewOpen || list.length <= 1) return;

    const timer = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % list.length);
      setProgressKey((k) => k + 1);
    }, TESTIMONIAL_DURATION);

    return () => clearTimeout(timer);
  }, [activeIdx, isPaused, isReviewOpen, shouldReduce, progressKey, list.length]);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setProgressKey((k) => k + 1);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !quote.trim()) {
      setErrorMsg("Please enter your name and review.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim(),
          role: role.trim() || "Client",
          location: location.trim() || null,
          email: email.trim() || null,
          quote: quote.trim(),
          rating,
          website, // honeypot
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!list || list.length === 0) return null;

  const reviewModal = (
    <AnimatePresence>
      {isReviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReviewOpen(false);
          }}
        >
          <m.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: ease.outExpo }}
            className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain bg-[#141414] border border-white/15 rounded-2xl p-4 sm:p-7 shadow-2xl text-left my-auto space-y-3.5"
          >

            {submitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent-text)] text-2xl font-bold font-mono">
                  ✓
                </div>
                <h3 id="review-modal-title" className="text-xl sm:text-2xl font-serif text-[var(--fg)]">
                  Thank You, {author.trim()}!
                </h3>
                <p className="text-xs sm:text-sm font-sans text-[var(--fg-muted)] leading-relaxed max-w-sm mx-auto">
                  Your review has been submitted. Zetona reviews every testimonial before publishing it to the live portfolio.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewOpen(false);
                      setSubmitted(false);
                      setAuthor("");
                      setRole("");
                      setLocation("");
                      setEmail("");
                      setQuote("");
                    }}
                    className="w-full sm:w-auto bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-mono uppercase tracking-wider px-6 py-3 sm:py-2.5 rounded-full transition-colors cursor-pointer font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 sm:space-y-3.5">
                {/* Header row with integrated Close button */}
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--accent-text)] uppercase tracking-wider block">
                      • Client Feedback
                    </span>
                    <h3 id="review-modal-title" className="text-lg sm:text-2xl font-serif text-[var(--fg)] leading-tight mt-0.5">
                      Share Your Experience
                    </h3>
                    <p className="text-[11px] sm:text-xs font-sans text-[var(--fg-muted)] mt-0.5">
                      Leave your review to be featured on Zetona&apos;s site.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-[var(--fg)] flex items-center justify-center text-xs font-mono transition-colors cursor-pointer shrink-0 touch-manipulation"
                    aria-label="Close review dialog"
                  >
                    ✕
                  </button>
                </div>

                {/* Honeypot hidden input */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <div className="bg-red-950/60 border border-red-500/40 text-red-300 text-xs p-2.5 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                {/* Rating selection (compact horizontal row) */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider">
                    Rating *
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-xl sm:text-2xl transition-transform active:scale-90 hover:scale-110 focus:outline-none cursor-pointer touch-manipulation"
                        aria-label={`${star} star rating`}
                      >
                        <span
                          className={
                            (hoverRating ? star <= hoverRating : star <= rating)
                              ? "text-amber-400"
                              : "text-white/20"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Session in 2 columns (even on mobile) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Osasere I."
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-[16px] sm:text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--fg-dim)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                      Session / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Portrait / Studio"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-[16px] sm:text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--fg-dim)] transition-colors"
                    />
                  </div>
                </div>

                {/* Location & Email in 2 columns (even on mobile) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Benin City"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-[16px] sm:text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--fg-dim)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                      Email (Private)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-[16px] sm:text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--fg-dim)] transition-colors"
                    />
                  </div>
                </div>

                {/* Review Textarea */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Share your experience working with Zetona..."
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg p-2.5 text-[16px] sm:text-xs text-[var(--fg)] font-serif leading-relaxed focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--fg-dim)] resize-none transition-colors min-h-[75px]"
                  />
                </div>

                {/* Submit row: always visible */}
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <span className="text-[10px] font-mono text-[var(--fg-dim)] text-center sm:text-left order-2 sm:order-1">
                    Approved by Zetona before publishing.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !author.trim() || !quote.trim()}
                    className="w-full sm:w-auto bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-mono uppercase tracking-wider px-6 py-2.5 sm:py-2.5 rounded-full transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 font-semibold shadow-lg order-1 sm:order-2 shrink-0 active:scale-95"
                  >
                    {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    <span>{isSubmitting ? "Submitting..." : "Submit Review →"}</span>
                  </button>
                </div>
              </form>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <section
      id="testimonials"
      className="relative bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden flex flex-col justify-between py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 select-none"
    >
      {/* Anchor targets for deep linking */}
      <div id="leaveareview" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />
      <div id="review" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />

      {/* Cinematic subtle atmospheric glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.08),rgba(255,255,255,0.02)_40%,transparent_70%)]"
      />

      {/* Main Grid: Label on left, Quote & Monogram controls on right */}
      <m.div
        initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: ease.outExpo }}
        className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto w-full my-auto"
      >
        {/* Left Column: • TESTIMONIALS + Leave a review CTA */}
        <div className="lg:col-span-3">
          <span className="font-condensed uppercase tracking-tight text-[var(--fg)] text-xl sm:text-2xl md:text-3xl flex items-center gap-2">
            <span className="text-[var(--accent-text)]">•</span> TESTIMONIALS
          </span>
          <span className="font-mono text-xs text-[var(--fg-dim)] block mt-1.5 sm:mt-2">
            [ 0{((activeIdx) % list.length) + 1} / 0{list.length} ]
          </span>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] font-mono text-[var(--fg-dim)]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-[var(--accent)] animate-pulse"}`}
            />
            <span>{isPaused ? "Paused" : "Auto-playing"}</span>
          </div>

          {/* Leave a review button positioned beneath testimonials info */}
          <div className="mt-6 sm:mt-8 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-[var(--accent)] hover:text-white border border-white/10 hover:border-[var(--accent)] text-xs font-mono text-[var(--fg)] transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <span className="text-[var(--accent-text)] group-hover:text-white transition-colors">★</span>
              <span>Leave a review</span>
              <span className="transition-transform group-hover:translate-x-0.5 text-[var(--accent-text)] group-hover:text-white">→</span>
            </button>
            <p className="text-[11px] font-mono text-[var(--fg-dim)] mt-2 leading-relaxed">
              Shot with Zetona? Share your experience with us.
            </p>
          </div>
        </div>

        {/* Right Column: Quote + Author + Big Initials Monograms */}
        <div className="lg:col-span-9">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="bg-[#101010] border border-white/10 p-6 sm:p-10 md:p-14 rounded-2xl shadow-2xl relative transform-gpu"
          >
            {/* Watermark Quote Icon */}
            <div
              aria-hidden="true"
              className="absolute top-4 right-6 sm:top-6 sm:right-10 text-6xl sm:text-8xl font-serif text-white/[0.04] pointer-events-none select-none font-bold"
            >
              “
            </div>

            <AnimatePresence mode="wait">
              <m.div
                key={current.id}
                initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: ease.outExpo }}
              >
                {/* Author Monogram Badge & Headline */}
                <div className="flex items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#242424] to-[#121212] border border-[var(--accent)]/40 flex items-center justify-center font-serif text-base sm:text-lg font-bold text-[var(--accent-text)] shadow-md ring-1 ring-white/10 flex-shrink-0">
                    {getInitials(current.author)}
                  </div>
                  <div>
                    <h4 className="font-condensed uppercase text-[var(--fg)] text-lg sm:text-xl md:text-2xl tracking-wide">
                      {current.author}
                    </h4>
                    <p className="font-sans text-xs sm:text-sm text-[var(--fg-dim)] mt-0.5">
                      {current.role}
                      {current.location ? ` · ${current.location}` : ""}
                    </p>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="font-serif italic text-[var(--fg)] text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 sm:mb-12 font-light">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </m.div>
            </AnimatePresence>

            {/* Bottom Row: Compact Initials Switcher with Progress Track */}
            <div className="pt-5 sm:pt-6 border-t border-white/10 flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
              {list.map((t, idx) => {
                const isActive = idx === (activeIdx % list.length);
                const isPassed = idx < (activeIdx % list.length);
                const initials = getInitials(t.author);

                return (
                  <m.button
                    key={t.id}
                    onClick={() => handleSelect(idx)}
                    whileHover={shouldReduce ? {} : { scale: 1.06, y: -1 }}
                    whileTap={shouldReduce ? {} : { scale: 0.95 }}
                    aria-label={`View testimonial from ${t.author}`}
                    className="focus:outline-none cursor-pointer flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    {/* Compact Refined Initials Badge */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center font-serif text-xs sm:text-xs md:text-sm font-semibold tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-b from-[#252525] to-[#141414] text-[var(--accent-text)] ring-1.5 ring-[var(--accent)] shadow-md scale-105 border border-[var(--accent)]/50"
                          : "bg-white/[0.04] text-white/40 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Timer progress track going across one avatar to the other */}
                    <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                      {isActive ? (
                        <m.div
                          key={`timer-${progressKey}-${activeIdx}`}
                          className="h-full bg-[var(--accent)] rounded-full shadow-[0_0_6px_var(--accent)]"
                          initial={{ width: "0%" }}
                          animate={{ width: isPaused ? undefined : "100%" }}
                          transition={{
                            duration: TESTIMONIAL_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPassed ? "w-full bg-[var(--accent)]/40" : "w-0 bg-transparent"
                          }`}
                        />
                      )}
                    </div>
                  </m.button>
                );
              })}
            </div>
          </div>
        </div>
      </m.div>

      {/* Portal to document.body ensures the modal is strictly attached to the root viewport and pops up directly in view */}
      {mounted && typeof document !== "undefined"
        ? createPortal(reviewModal, document.body)
        : null}
    </section>
  );
}
