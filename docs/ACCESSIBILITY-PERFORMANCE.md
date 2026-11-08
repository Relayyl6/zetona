# ACCESSIBILITY-PERFORMANCE.md

Budgets and rules that keep a heavily animated site usable and fast. Related: [MOTION.md](./MOTION.md) §3 · [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) §9 · [TESTING.md](./TESTING.md).

---

## 1. Performance budgets

Measured on **Lighthouse mobile, simulated Slow 4G, 4× CPU slowdown** and verified on a real mid-range Android over throttled data.

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | ≤ 2.5 s (Home), ≤ 2.0 s (others) | LCP = largest collage card / hero image |
| INP | ≤ 200 ms | |
| CLS | ≤ 0.05 | Reserve every image's aspect ratio |
| TBT | ≤ 200 ms | |
| Lighthouse Performance | ≥ 90 (inner pages), **≥ 85 Home** allowed if documented | Home carries more motion |
| Lighthouse A11y / Best Practices / SEO | ≥ 95 / ≥ 95 / 100 | |
| JS shipped, Home (gzip) | ≤ 170 KB first load | `m` + `domMax` lazy, Lenis dynamic |
| Total above-the-fold image bytes (Home, mobile) | ≤ 350 KB | 4 priority cards @ ≤ 70 KB AVIF/WebP |
| Fonts | ≤ 3 families, ≤ 6 files, ≤ 120 KB total, `display: swap`, preload only LCP face | |

## 2. Loading strategy

- **Priority images:** only the 3-4 largest above-the-fold collage cards get `priority`/`fetchPriority="high"`; the rest `loading="lazy"` with blur-up.
- **Preconnect** to `media.<domain>`; no third-party origins on first paint (Clerk/Turnstile load only where used).
- Defer decorative JS: `CustomCursor`, `Preloader`, Lenis, `Marquee` via `next/dynamic` after `requestIdleCallback`.
- **Collage on mobile** renders 6 cards; slots 7-10 are not mounted (not just hidden).
- Streaming + static HTML: public pages are static, so TTFB is edge-fast.
- Prefetch only `Work` and `Contact` from Home.
- Save-Data: skip preloader, 4 collage cards, lower quality (q 70).
- Network reality: test with **~1.5 Mbps / 300 ms RTT** profile; the first view must be meaningful within ~3 s.

## 3. Hero image budget (Home)

| Slot | Intrinsic width served (mobile / desktop) | Max bytes |
|------|------------------------------------------|-----------|
| Large portrait | 640 / 1100 | 60 / 110 KB |
| Medium | 480 / 800 | 45 / 80 KB |
| Small | 320 / 560 | 25 / 45 KB |
Quality 70-75 for collage cards; 82-86 in the gallery/lightbox.

## 4. Accessibility (WCAG 2.2 AA)

| Area | Requirement |
|------|-------------|
| Structure | Landmarks (`header/nav/main/footer`), one `h1`, logical headings, skip link |
| Keyboard | All interactive elements reachable and operable; visible 2 px `--accent` focus ring (offset 3); no keyboard traps (menu & lightbox trap focus **and** release it) |
| Focus mgmt | Opening lightbox/menu moves focus inside; closing restores to the trigger |
| Images | Photos: meaningful `alt` (required). Decorative duplicates (collage cards that repeat gallery photos): `alt=""`. Blur-up/backdrop images `aria-hidden` |
| Colour | Text contrast ≥ 4.5:1 (3:1 for large text/UI). See DESIGN §3.1 for blue usage rules |
| Motion | `prefers-reduced-motion` honoured everywhere; pause control for any auto-playing content > 5 s; no flashing |
| Targets | ≥ 44 × 44 px for touch; spacing between adjacent targets ≥ 8 px |
| Forms | Real `<label>`s (floating label is visual only), `aria-describedby` for errors, `aria-live="polite"` status for submit result, `autocomplete` attributes, 16 px inputs |
| Custom widgets | Selector: buttons with `aria-current`/roving tabindex; Toggle: `aria-pressed`; Lightbox: `role="dialog" aria-modal="true"` with label, `aria-live` counter |
| Scroll-lit text | Full text present in DOM at full opacity for AT; visual dim is presentational only |
| Hover-only content | Never essential; tap/focus equivalents exist (preview on focus for list rows) |
| Language | `lang="en"` (or `en-NG`) |
| Zoom/reflow | Works at 200% zoom and 320 px width without horizontal scroll (except galleries designed to) |
| Text resizing | `rem`-based type; no fixed-height text containers |
| Target audit | `axe` zero serious/critical on Home, Work, a Collection, Archive, About, Contact, Admin |

## 5. Reduced-motion implementation

Single source: `useReducedMotion()` + `<MotionConfig reducedMotion="user">` + CSS `@media (prefers-reduced-motion: reduce)` for any CSS animations. Each ⚡ component documents and tests its substitute ([MOTION.md](./MOTION.md) §7). Provide a visible **"Reduce motion" toggle** in the footer `[SUGGESTED]` that sets a `data-motion="reduced"` flag (persisted) for people whose OS setting isn't on but who find the site too busy.

## 6. Device matrix to test manually

| Device class | Why |
|--------------|-----|
| Low/mid Android (Chrome), ~4 GB RAM | Likely majority of visitors |
| iPhone Safari (current & -1) | Canvas/WebP/viewport quirks |
| Desktop Chrome / Safari / Firefox / Edge | Pointer effects |
| Tablet (iPad Safari) | Hybrid pointer/touch |
| Slow network (3G/4G throttle) | Real-world connectivity |

## 7. Monitoring

- Real-user Core Web Vitals via Cloudflare Web Analytics.
- Lighthouse CI on every PR against preview; budget failures block merge.
- Monthly manual check on a real mid-range Android.

## 8. Regression traps (watch these)

- Adding an image without `sizes` (downloads desktop-size on mobile).
- A blurred full-size background (GPU spike): use the tiny pre-blurred source.
- `position: sticky` + `overflow: hidden` ancestors breaking pinned sections.
- iOS 100vh bugs: use `100svh`/`dvh`.
- Lenis conflicting with native scroll inside modals/lightbox: stop on open.
- Framer layout animations on large lists (> 36 items).
