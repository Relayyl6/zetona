# MOTION.md: The Animation Bible

"Maximise animation" is the brief. This file turns it into a **system**, so the site feels
choreographed rather than chaotic, and stays fast and accessible.

Engine: **Motion for React** (`motion/react`, formerly Framer Motion). Smooth scroll: **Lenis**.
Related: [DESIGN.md](./DESIGN.md) · [PAGES.md](./PAGES.md) · [COMPONENTS.md](./COMPONENTS.md) ·
[ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md) · [INSPIRATION-ANALYSIS.md](./INSPIRATION-ANALYSIS.md).

> Verify import paths and APIs against the **installed** `motion` version before coding
> (AGENTS.md §3). Snippets below show intent and structure.

---

## 1. Philosophy: "maximal but choreographed"

1. **Every section has one hero motion** and at most two supporting ones.
2. **Everything enters.** Nothing pops in. Text, images, lines and buttons have an entrance.
3. **Depth through parallax.** Layers move at different speeds; this is the main source of "premium".
4. **Pointer = presence.** On desktop the page responds to the cursor (collage tilt, crop frame, preview tracking).
5. **Scroll = narrative.** Scroll progress drives colour reveals, counters, pinning and transitions.
6. **Consistent physics.** One easing family, three durations, two springs. Never invent ad-hoc values.
7. **Respect the user.** Reduced motion → crossfades only. Low power → simplify. See §3.

---

## 2. Motion tokens (`lib/motion/tokens.ts`: the *only* place values live)

```ts
export const ease = {
  outExpo:   [0.16, 1, 0.3, 1],     // entrances, reveals (default)
  inOutQuart:[0.76, 0, 0.24, 1],    // page curtain, menu, clip-path wipes
  outQuint:  [0.22, 1, 0.36, 1],    // hovers
  linear:    [0, 0, 1, 1],          // scroll-linked values
} as const;

export const dur = { xs: 0.2, sm: 0.45, md: 0.8, lg: 1.2, xl: 1.8 } as const;

export const spring = {
  soft:   { type: "spring", stiffness: 120, damping: 20, mass: 0.8 },  // cursor followers
  snappy: { type: "spring", stiffness: 380, damping: 32 },             // buttons, toggles
  layout: { type: "spring", stiffness: 260, damping: 30 },             // shared-element
} as const;

export const stagger = { chars: 0.018, words: 0.06, items: 0.08, cards: 0.11 } as const;
export const viewport = { once: true, margin: "0px 0px -12% 0px", amount: 0.2 } as const;
```

Setup: wrap the app once:

```tsx
// app/providers.tsx ("use client")
<LazyMotion features={domMax} strict>          {/* domMax needed for layout/drag */}
  <MotionConfig reducedMotion="user" transition={{ ease: ease.outExpo }}>
    <SmoothScroll>{children}</SmoothScroll>     {/* Lenis, disabled when reduced */}
  </MotionConfig>
</LazyMotion>
```

Use the lightweight `m` component (`import * as m from "motion/react-m"`) everywhere to keep the bundle small.

---

## 3. Fallback & performance rules (apply to **every** effect)

| Condition | Detection | Behaviour |
|-----------|-----------|-----------|
| **Reduced motion** | `useReducedMotion()` + `MotionConfig reducedMotion="user"` | No parallax, no pinning, no marquee, no cursor follow, no autoplay. Entrances become 200 ms opacity fades. Scroll-lit text shows fully lit. Counters show final numbers. Page transition = fade. Lenis off. |
| **Touch / coarse pointer** | `(hover: none), (pointer: coarse)` | No custom cursor, no pointer-tilt. Replace hover reveals with tap. Keep scroll parallax (lighter amplitude ×0.6). |
| **Low-power / low-memory** | `navigator.deviceMemory ≤ 4` or `hardwareConcurrency ≤ 4` or `Save-Data` header/`navigator.connection.saveData` | "Lite motion": collage reduced to 6 cards, no backdrop blur (use darkened image), no marquee, springs → tweens, parallax amplitude ×0.4. |
| **No JS** | SSR HTML | Content visible. Initial states are applied by JS, not CSS `opacity:0`, to avoid invisible content. |
| **Tab hidden** | `document.visibilityState` | Pause autoplay, marquee and rAF loops. |
| **Off-screen** | `useInView` | Pause/skip animations for sections not in view. |

**Hard performance rules**

- Animate **transform, opacity, clip-path** (and `filter` only on small, static-position elements). Never animate `width/height/top/left/margin`.
- `will-change: transform` only on elements currently animating; remove after (Motion handles most).
- **Max 12 simultaneously moving image layers** in the viewport on desktop, **8 on mobile**.
- Large blurs (`blur(40px)`): render **once** on a *pre-blurred small image* (a 64 px-wide thumbnail scaled up) instead of CSS-blurring a 2000 px image on every frame. See §6.8.
- All scroll-linked values use `useScroll` + `useTransform` (no `scroll` listeners, no `setState` per frame).
- Keep each animated client component small; do not hydrate decorative motion above the fold before first paint (use `next/dynamic` with `ssr:false` for cursor and Lenis).
- Target **60 fps on a mid-range Android** (e.g. 4 GB RAM class). Profile with Chrome Performance + CPU 4× throttle.
- INP < 200 ms: no animation work in click handlers; kick off, don't block.

---

## 4. Global systems

### 4.1 Smooth scroll (Lenis)
- `lerp: 0.1`, `smoothWheel: true`, `syncTouch: false` (leave native momentum on touch).
- Disabled under reduced motion; exposes `useLenis()` so lightbox/menu can `stop()`/`start()` scrolling.
- Drives Motion via `useScroll` (works with native scroll position, so no extra bridging needed).

### 4.2 Page transitions (blur-to-sharp, from frames 15-16)

Goal: leaving a page → a curtain/blur; entering → destination hero un-blurs and the headline slides up.

Implementation options (pick per installed Next.js capabilities, document the choice in DECISIONS):

1. **Preferred, progressive enhancement:** View Transitions API (`document.startViewTransition`, or Next's built-in support if available in the installed version). CSS `::view-transition-old/new(root)` animates `filter: blur(0→24px)` + `opacity`; named transitions (`view-transition-name`) morph a tapped collection cover into the destination hero.
2. **Fallback:** `app/template.tsx` client wrapper that plays an *enter* animation on mount (hero `filter: blur(24px) scale(1.08)` → `0 / 1` over `dur.lg`), plus a full-screen `--bg` curtain (`clip-path` wipe, `inOutQuart`, 0.6 s) triggered by a custom `<TransitionLink>` before `router.push`.
- Do **not** rely on `AnimatePresence` exit animations across App Router route changes without a proven approach (it unmounts too early). Keep exit = curtain.
- Reduced motion: 150 ms cross-fade only.

### 4.3 Preloader (first visit only, optional, ≤ 1.2 s)

Brand wordmark fades/slides in on black, a thin blue line fills 0 → 100% as the 4 LCP images decode, then **the curtain lifts (clip-path up)** revealing the collage already in place.
- Skip on repeat visits (`sessionStorage` flag) and under reduced motion/Save-Data.
- Never block more than 1.2 s; if images aren't ready, release anyway.

### 4.4 Custom cursor ("View" badge, frames 10-12)

- `useMotionValue(x,y)` + `useSpring(…, spring.soft)` for lag; `position:fixed; pointer-events:none; z-index var(--z-cursor)`.
- States via a context (`data-cursor="view|drag|expand|none"` attributes on targets, read by `mouseover` delegation): scale 0 → 1 with `spring.snappy`; label morphs.
- Pointer-fine only; mount through `dynamic(() => import(...), { ssr:false })`.

### 4.5 Header behaviour
- Hides on scroll-down, shows on scroll-up (`useScroll().scrollY` velocity, 16 px threshold), `y: -100% ↔ 0`, `dur.sm`.
- Over image heroes: `mix-blend-mode: difference` + cream text.
- Active-link underline uses `layoutId="nav-underline"` so it **slides between links**.

### 4.6 Menu overlay (mobile & Home hamburger)
- Open: panel `clip-path: inset(0 0 100% 0)` → `inset(0)` (`inOutQuart`, 0.7 s). Links rise from `y: 110%` inside `overflow:hidden` masks, `stagger.items`. Mono numerals fade in. Hamburger two lines morph to ✕ (rotate ±45°, 0.35 s).
- Close: reverse, 0.5 s. Focus trapped; `Esc` closes; scroll locked via Lenis.stop().

### 4.7 Smooth-link hover (underline draw)
`scaleX 0→1` with `transform-origin` left on enter and right on leave (classic "draw out" underline), `dur.sm`, `outQuint`.

### 4.8 Buttons
- **Pill:** fill layer `y:100% → 0%` (circle-ish `border-radius` morph) on hover; label colour swaps; arrow icon slides in `x:-8 → 0`. Press: `scale .97` via `whileTap` (`spring.snappy`).
- **Magnetic option (desktop):** within 80 px, button translates toward cursor ≤ 8 px (`useSpring`). Applied to the Home CTA and footer CTA only.

---

## 5. Reveal primitives (`components/motion/*`)

| Primitive | Behaviour | Defaults |
|-----------|-----------|----------|
| `<Reveal>` | Fade + `y: 24 → 0` on enter viewport | `dur.md`, `outExpo` |
| `<MaskLines>` | Text split into lines; each line rises from `y:110%` in an `overflow:hidden` wrapper | `stagger.items` 0.08 |
| `<SplitChars>` | Per-character rise for **giant** type only (≤ 24 chars to protect perf) | `stagger.chars` |
| `<ImageReveal>` | Mask `clip-path: inset(100% 0 0 0) → inset(0)` + inner image `scale 1.25 → 1` | `dur.lg`, `inOutQuart` clip / `outExpo` scale |
| `<Parallax speed>` | `y = useTransform(scrollYProgress,[0,1],[-s,+s])` | speed ∈ [20,160] px |
| `<ScrollLitText>` | Per-word opacity `0.2 → 1` driven by section scroll (P3) | See §6.3 |
| `<CountUp>` | `animate(0, n, {duration: 1.6, ease: outExpo})` when in view | Hidden until stats exist |
| `<Marquee>` | Infinite x loop, speed = base + scroll velocity (`useVelocity` → `useSpring`) | Pause on hover/hidden |
| `<Magnetic>` | Pointer attraction wrapper | ≤ 8 px |

---

## 6. Page choreography & signature effects

### 6.1 Home: Floating Collage Hero (the star)

**Load sequence (≈ 2.4 s total, desktop):**

| t (s) | Event |
|------|-------|
| 0.00 | Black canvas. Preloader (first visit only). |
| 0.10 | Collage cards enter **staggered** (`stagger.cards`), order = radial from centre outward. Each: `opacity 0→1`, `scale 1.18→1`, `y 40→0`, clip reveal `inset(8%)→inset(0)`; `dur.lg`, `outExpo`. |
| 0.70 | Wordmark fades in top-left; hamburger lines draw (`pathLength`). |
| 0.90 | Headline **MaskLines** rises line-by-line (`dur.md`). |
| 1.50 | CTA pill fades up; outline draws (`pathLength` on SVG pill border, or `scaleX`). |
| 2.00 | Idle motion begins (below). |

**Idle motion (always on, subtle):** each card gets a unique sinusoidal float (`y ±8 px`, period 6-11 s, random phase) implemented with a single shared `requestAnimationFrame` clock + `useMotionValue`, not 10 independent timers.

**Scroll parallax:** `depth` per card: translateY = `scrollY × (depth-1) × 0.35`. Cards at depth > 1 move up *faster* than the page, < 1 slower. The headline sits at depth 1 (locked), and cards with `z` above the headline create the overlap illusion.

**Pointer response (desktop fine):** collage container reads normalised pointer (-0.5…0.5); each card translates `±(depth × 14 px)` on x and y and rotates `±(depth × 0.8°)`, smoothed with `spring.soft`. The centre of the screen stays still. The **hovered card** scales 1.05 and lifts `z`; others dim to `opacity .55` (150 ms).

**Click a card:** shared-element (`layoutId`) expands the card toward the collection/gallery it belongs to (view transition fallback: curtain).

**Scroll-out:** headline fades & scales 0.96; collage compresses toward centre by `scale 0.9`, `opacity .0` by the end of the first viewport, handing over to the Statement section.

**Mobile:** no pointer tilt; reduce to 6 cards, float amplitude ±5 px, parallax ×0.6; device-orientation tilt is **not** used (permission prompts, iOS friction).

**Variant H-B (alt, flag `home=split`):** split-name hero (P2): `KRISTIN`-style mega type enters via `SplitChars` rising from below; crop-frame box scales from 0.8 with handles drawing; box content cross-dissolves through admin-flagged portraits every 3 s with blur-to-sharp.

### 6.2 Statement / scroll-lit text (P3)

See §6.3. Section is `min-height: 200vh` with the text `position: sticky; top: 30vh` so the reveal is tied to scroll without the text leaving the screen.

### 6.3 `ScrollLitText` implementation sketch

```tsx
"use client";
import { m, useScroll, useTransform, MotionValue } from "motion/react";
import { useRef } from "react";

export function ScrollLitText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="flex flex-wrap gap-x-[0.28em] text-[length:var(--fs-lead)] leading-[1.15]">
      {words.map((w, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return <Word key={i} range={[start, end]} progress={scrollYProgress}>{w}</Word>;
      })}
    </p>
  );
}

function Word({ children, range, progress }: { children: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <m.span style={{ opacity }}>{children}</m.span>;
}
```
Reduced motion: render all words at `opacity: 1` (no `useTransform`). Accessibility: the full text is in the DOM and readable by screen readers at all times.

### 6.4 Pinned Filmstrip Selector (P5: Work / Selected Work)

- Section `height = (items × 60vh) + 100vh`, inner `sticky top:0; height:100vh`.
- **Scroll-driven index** (touch + keyboard friendly): `activeIndex = floor(scrollYProgress × items)`; **hover/click on thumb overrides** (desktop), and a short "lock" prevents scroll from fighting the hover for 1.2 s.
- **Image change:** `AnimatePresence mode="popLayout"`: outgoing `opacity→0, scale 1.04, filter blur(8px)`; incoming `clip-path inset(0 0 100% 0)→inset(0)` + `scale 1.15→1`, `dur.md`.
- **Caption:** title chars rise (`SplitChars` for ≤ 18 chars, else `MaskLines`), description lines `MaskLines`; `View collection →` underline-draws.
- **Filmstrip:** each thumb `filter: grayscale(1)` + `opacity .6` → active `grayscale(0) opacity 1`, 24 px line `scaleX 0→1`, index mono ticks. The strip **auto-centres the active thumb** (`x` spring).
- **Keyboard:** `←/→` change selection; each thumb is a `<button>` with `aria-current`. Pinned scroll is a progressive enhancement: with reduced motion the section becomes a normal, non-pinned stack (one block per item).

### 6.5 Hover-Reveal List with cursor-tracking preview (P6)

- Rows: condensed uppercase, bracketed mono year.
- Hover row: em-dash `—` slides in (`width 0→1em`, `x`), row text `x +0.6em` (`spring.snappy`); other rows `opacity .35`.
- **Preview image:** one floating `<m.div>` following the pointer (`useMotionValue` + `useSpring(spring.soft)`), vertical-follow with ~12% horizontal parallax; image swaps with `clip-path` wipe (`inOutQuart`, 0.35 s) and tiny rotate (`-3° → 0°`).
- Preview is `aria-hidden`; row link text contains the info. Touch: tap expands an inline 4:5 preview under the row (height via `layout`).

### 6.6 About: split-name hero + crop frame (P2)

- Name halves slide in from opposite corners (`x ±8vw → 0`, `SplitChars` rise).
- Crop-frame box: border draws with SVG `pathLength`, four 8 px corner handles pop (`scale 0→1`, stagger 60 ms); the box's content cycles portraits (blur-to-sharp). On desktop the frame **eases toward the pointer** within a ±6% travel zone (`spring.soft`).
- On scroll: image `scale 1 → 1.12`, name halves drift apart (`x ±12vw`) and fade by 80% of the hero.

### 6.7 Count-up stats (P4: hidden until real data)

`useInView` triggers `animate(0, value, { duration: 1.6, ease: ease.outExpo, onUpdate: v => node.textContent = Math.round(v).toString() })`. Writes to the DOM node directly (no React state per frame). The "+" superscript fades in at the end. Reduced motion: render the final value.

### 6.8 Cinematic Blur-Backdrop Section + "View" cursor (P7)

- Backdrop = **tiny pre-blurred thumbnail** (`blurDataURL`-class image, 32-64 px) scaled to cover, plus `brightness(.65)` overlay; **no per-frame CSS blur**. (Achieves the frame 10-12 look at a fraction of the GPU cost.)
- Inset image: `ImageReveal` on entry; as the section scrolls, inset `scale 0.82 → 1 → 0.92` and the backdrop `y` parallax at 0.4×.
- Between sections: backdrop cross-dissolves (`opacity` between stacked layers), inset **slices** out (two or three horizontal `clip-path` strips staggered 60 ms), matching the sliced frame in the recording (frame 11).
- Title left (condensed) `MaskLines`; meta right (mono) fades with 120 ms delay.
- Hover the inset → custom "View ↗" cursor badge; click → collection.

### 6.9 Collection gallery & lightbox

- **Masonry entrance:** tiles `ImageReveal` staggered by column (`stagger.cards` × column index), triggered per tile on viewport entry (not all at once).
- **Hover (desktop):** `scale 1.03` inside the mask, caption slides up; other tiles `opacity .7`.
- **Lightbox:** shared-element transition using `layoutId={photo.id}` from tile → full-screen (`spring.layout`). Backdrop fades. Swipe/drag between photos with `drag="x"` + velocity threshold; arrow keys; `Esc`; preloads ±1 neighbours. Counter digits roll (slot-machine `y` mask).
- Reduced motion: lightbox fades only.

### 6.10 Archive
Tiles reveal in rows; filter chips use `layout` so grid items **animate to their new positions** on filter (`spring.layout`, `AnimatePresence` for removed items). Cap layout animation to ≤ 36 items at once; beyond that, crossfade.

### 6.11 Contact & footer (P9)
- "LET'S TALK." enters with `SplitChars`; the **→ arrow draws** (`pathLength`) then loops a gentle 6 px `x` nudge every 4 s (paused offscreen/reduced).
- Portrait panel: `ImageReveal` from the right, slow Ken Burns (`scale 1 → 1.06`, 20 s, alternate), paused offscreen.
- `[Q] [S] [C]` columns rise with `stagger.items`; links use the underline-draw hover.
- Form: label floats (`y`, `scale`) on focus; submit button shows an inline **progress → check** morph; success message `MaskLines`.

### 6.12 404
Collage fragments float; `404` condensed reveals with `SplitChars`; CTA magnetic.

### 6.13 Admin
Restrained: upload progress bars (`scaleX`), list reorder (`Reorder.Group`/`layout`), toasts (`y` + `opacity`), delete confirm (scale-in modal). **No** parallax, cursor, preloader or page curtain in `/admin`. Lenis disabled there.

---

## 7. Effect → accessibility mapping

| Effect | Reduced-motion substitute | Notes |
|--------|--------------------------|-------|
| Collage entrance | 200 ms opacity fade, no stagger | Cards static |
| Idle float / parallax / tilt | Off | |
| Scroll-lit text | Fully lit | Text is always in DOM |
| Pinned selector | Normal stacked blocks | Same content |
| Marquee | Static row, scrollable | |
| Cursor badge / tracking preview | Off | Links still work |
| Page transition | 150 ms fade | |
| Autoplay (hero crop frame, selector) | Off (manual only) | WCAG 2.2.2: autoplay > 5 s needs a pause control |
| Lightbox shared element | Opacity fade | |

Any autoplay or loop lasting longer than 5 s exposes a **Pause** control (WCAG 2.2.2).
No flashing > 3 times/second (WCAG 2.3.1): none of the effects flash.

---

## 8. Build order for motion (so the app stays shippable)

1. Tokens + providers + reduced-motion plumbing.
2. Reveal primitives (`Reveal`, `MaskLines`, `ImageReveal`, `Parallax`).
3. Home collage (load + parallax) → pointer response → idle float.
4. Header, menu overlay, buttons.
5. Page transitions.
6. Scroll-lit text, selector, list/preview, backdrop sections.
7. Gallery + lightbox shared element.
8. Cursor system, magnetic, marquee, preloader.
9. Performance pass on a throttled mid-range Android profile; remove or simplify anything under 55 fps.

## 9. Animation acceptance checklist

- [ ] Every effect has a reduced-motion substitute (§7) verified by a Playwright test with `reducedMotion: 'reduce'`.
- [ ] Home hero LCP ≤ 2.5 s on simulated Slow 4G, motion doesn't delay the LCP image.
- [ ] No layout shift caused by any animation (CLS < 0.05).
- [ ] 60 fps on a 4×-throttled CPU profile for the home hero and gallery scroll.
- [ ] No more than 12 concurrently animated image layers.
- [ ] All durations/easings come from `lib/motion/tokens.ts`.
- [ ] Pause control present for anything auto-playing > 5 s.
