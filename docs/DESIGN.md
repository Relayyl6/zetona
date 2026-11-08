# DESIGN.md: Visual System

Authoritative for look and feel. Motion lives in [MOTION.md](./MOTION.md); structure in
[PAGES.md](./PAGES.md); components in [COMPONENTS.md](./COMPONENTS.md); evidence in
[INSPIRATION-ANALYSIS.md](./INSPIRATION-ANALYSIS.md). Values tagged `[SUGGESTED]` need client sign-off (OPEN-QUESTIONS Q4, Q15).

---

## 1. Design intent

**One sentence:** a dark, editorial gallery where portraits glow, with a single confident blue,
oversized typography and motion that feels like turning pages in a luxury magazine.

| Principle | Meaning in practice |
|-----------|---------------------|
| **Photography first** | Images are the loudest thing on every screen. UI is quiet, thin and monochrome. |
| **Dark room** | Near-black canvas, like a studio with the lights down; skin tones and blues pop. |
| **One accent** | Blue only. Never a second accent colour. |
| **Scale contrast** | Giant type next to tiny labels. Nothing in the middle (no "medium-sized everything"). |
| **Motion with meaning** | Motion guides attention (reveals, parallax depth, hover tracking). Never decorative noise. |
| **Respectful edges** | Sharp image corners, hairline borders, generous negative space. |
| **Fast on a phone** | Visual richness comes from composition and motion, not from heavy assets. |

Mood words: *editorial, cinematic, intimate, confident, premium, warm.*
Anti-words: *busy, glossy-corporate, template, playful-bubbly, cluttered.*

---

## 2. Theme

Dark theme only for v1 (a photographer's portfolio reads best on dark; light adds cost with no benefit).
Declare `color-scheme: dark`. Set `<meta name="theme-color" content="#0A0A0A">`.

---

## 3. Design tokens

All tokens are CSS variables in `app/globals.css`, mirrored in `lib/design-tokens.ts`.

### 3.1 Colour

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0A0A0A` | Page canvas, Home (from the Rabah reference) |
| `--bg-raised` | `#161616` | Inner-page sections (from the Kristin reference) |
| `--bg-elevated` | `#1F1F1F` | Cards, inputs, menus |
| `--line` | `rgba(246,242,230,0.14)` | Hairlines, borders |
| `--line-strong` | `rgba(246,242,230,0.32)` | Pill outlines, hovered borders |
| `--fg` | `#F6F2E6` | Primary text (warm cream, not pure white) |
| `--fg-muted` | `rgba(246,242,230,0.62)` | Secondary text |
| `--fg-dim` | `rgba(246,242,230,0.34)` | Unlit scroll-reveal text; disabled |
| **`--accent`** `[SUGGESTED]` | `#2B59FF` (Cobalt) | Buttons fill, focus ring, active indicators, large display moments |
| `--accent-text` `[SUGGESTED]` | `#7B97FF` | Accent used as *small text/links* (passes AA on `--bg`) |
| `--accent-soft` | `rgba(43,89,255,0.16)` | Hover fills, selection halos |
| `--accent-deep` | `#1237C9` | Pressed state |
| `--danger` | `#FF5D5D` | Destructive admin actions, form errors |
| `--success` | `#4FD18B` | Upload success |

**Contrast (approximate, verify with tooling):** `--fg` on `--bg` ≈ 17:1 ✅. `--fg-muted` on `--bg` ≈ 8:1 ✅.
`--accent` on `--bg` ≈ 3.7:1: **large text and UI components only (≥ 3:1)**. Never body text. Use
`--accent-text` for small blue text (≈ 6:1 ✅). Cream text on an `--accent` fill ≈ 4.4:1, so use **bold ≥ 16 px or large** labels on filled blue, or switch the button label to `#FFFFFF`.

**Brand-blue alternatives to show the client** `[SUGGESTED]` (Q4): Cobalt `#2B59FF` (default),
Electric `#1F6FEB`, Sky `#2FA8E8` (closer to the blue seen in the Kristin reference), Ink `#1A3BD1`. One CSS variable swap.

**Selection:** `::selection { background: var(--accent); color: #fff }`.

**Image overlays (for text-over-image legibility):** `linear-gradient(to top, rgba(10,10,10,.72), transparent 55%)`. Never place text directly on busy photo regions without a scrim or a measured contrast check.

### 3.2 Typography

Three roles, three families (all via `next/font`, self-hosted, `display: swap`, subsetted, preloaded only for the LCP face):

| Role | Family `[SUGGESTED]` | Where | Rules |
|------|--------------------|-------|-------|
| **Display serif** | **Instrument Serif** (fallback: Cormorant Garamond → Georgia) | Home headline, section statements, About lead, big quotes | Regular + *italic*; sentence case; tight leading 0.95-1.05; letter-spacing -0.02em |
| **Display condensed** | **Anton** (alt: Bebas Neue, Big Shoulders Display) | Giant structural type: page titles, footer "LET'S TALK.", collection names, numerals | ALL CAPS; leading 0.88-0.95; letter-spacing 0 to +0.01em |
| **UI / body sans** | **Inter Tight** (alt: Geist, Manrope) | Body, nav, buttons, forms, captions, admin | 400/500/600; leading 1.5 body |
| **Index mono** (tiny) | **JetBrains Mono** or `ui-monospace` | `[ 2026 ]`, `[Q]`, `01…10` counters | 11-12 px, uppercase, letter-spacing .08em |

> If the client prefers the condensed look everywhere (Q15), swap the Display serif role to Anton and keep sizes; if he prefers pure serif, retire Anton and use Instrument Serif uppercase for giant type. Only the `--font-*` variables change.

**Fluid type scale** (`clamp(min, preferred, max)`):

| Token | Value | Use |
|-------|-------|-----|
| `--fs-mega` | `clamp(4.5rem, 17vw, 18rem)` | Split-name hero, footer CTA |
| `--fs-hero` | `clamp(2.75rem, 7.2vw, 8rem)` | Home headline (serif) |
| `--fs-h1` | `clamp(2.25rem, 5vw, 5.5rem)` | Page titles |
| `--fs-h2` | `clamp(1.75rem, 3.2vw, 3.5rem)` | Section statements |
| `--fs-h3` | `clamp(1.25rem, 1.8vw, 1.75rem)` | Card titles |
| `--fs-lead` | `clamp(1.25rem, 2.1vw, 2.25rem)` | About paragraphs (scroll-lit text) |
| `--fs-body` | `1rem` / `1.0625rem` ≥ 1024 | Body |
| `--fs-small` | `0.875rem` | Captions, meta |
| `--fs-micro` | `0.6875rem` | Mono labels (min 11 px) |

Body line length 55-72ch. Never justify. `text-wrap: balance` on headlines, `pretty` on paragraphs. Use real small-caps/uppercase transforms via CSS (`text-transform`), not retyped text.

### 3.3 Spacing & layout

- Base unit **4 px**. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.
- **Container:** full-bleed by default; text content uses a **12-column grid**, `gutter: clamp(16px, 2vw, 32px)`, outer margin `clamp(16px, 4vw, 64px)`.
- **Section padding:** `clamp(96px, 14vw, 224px)` vertical on desktop; 80 px on mobile.
- **Reference alignment (from frames 02-03):** section label occupies cols 1-2; body text starts at col 5 (≈ 35% width) on desktop; stacks on mobile.
- **Breakpoints:** `sm 480 · md 768 · lg 1024 · xl 1440 · 2xl 1920`. Design at 1440 and 390.
- **Z-index scale:** `base 0 · content 10 · sticky-header 40 · cursor 60 · menu 70 · lightbox 80 · toast 90 · page-transition 100`.

### 3.4 Shape, borders, elevation

| Element | Rule |
|---------|------|
| Photos | **Radius 0.** No shadow. No border. (Matches both references.) |
| Pills (buttons, tags) | `border-radius: 9999px`, 1 px `--line-strong` outline, 44 px min height |
| Inputs | Underline-only (`border-bottom 1px --line`), no box. Focus = accent underline + label lift |
| Admin cards | Radius 12, `--bg-elevated`, 1 px `--line` |
| Shadows | Avoid. If needed for the lightbox/menus: `0 30px 80px rgba(0,0,0,.6)` |
| Dividers | 1 px `--line`, full-bleed or column-width |

### 3.5 Iconography

Thin 1.5 px stroke line icons (Lucide). Arrows (`→`, `↗`) are typographic glyphs or inline SVG at 1.5 px. Social icons use simple-icons mono glyphs in `--fg`. No filled, multicolour or emoji icons.

### 3.6 Cursor

Desktop pointer-fine only (`@media (hover:hover) and (pointer:fine)`):

| State | Cursor |
|-------|--------|
| Default | Native cursor (do not hide it globally; accessibility/quality) |
| Over a project/inset image | 72 px white circle with ↗ ("View"), `mix-blend-mode: normal`, follows with spring lag (frame 10-12) |
| Over gallery thumbs (lightbox) | "Expand" ⤢ |
| Over draggable carousel | "Drag" label |
| Over links/buttons | Native pointer + element hover |

Touch devices: no custom cursor.

---

## 4. Imagery rules

- Show **real** photographs only. Dev placeholders are visibly marked.
- **Aspect ratios** are preserved. Collage/grid tiles may crop *within a focal point* (admin-set focal point; default centre-upper third for portraits since faces sit high).
- **Portrait orientation first** (3:4, 4:5, 2:3). Landscape is allowed in collage and archive.
- **Blur-up placeholders** (ThumbHash/BlurHash, ≤ 40 bytes in the DB) on every image.
- **Image treatment on hover:** greyscale → colour for filmstrips (frames 04-06); slight scale 1.04. Not applied to the main gallery images (colour is the product).
- **Backdrop blur sections:** background = same photo, `scale(1.25) blur(40px) brightness(.7)` (frames 10-12).
- **Colour fidelity:** serve sRGB; strip nothing that affects display colour; do not auto-sharpen/over-compress. Quality 82-86 AVIF/WebP for gallery, 75 for collage.
- **No watermark** unless requested (Q11). If requested: bottom-right, 40% opacity, applied at delivery not to the original.

---

## 5. Component styling summary

Details in [COMPONENTS.md](./COMPONENTS.md); styling rules here:

| Component | Style |
|-----------|-------|
| **Header** | Fixed, transparent, 24 px side margin; left wordmark (serif on Home, condensed on inner pages), right circular-arrow "Contact Me" + hamburger on mobile; mix-blend difference on image heroes so it stays legible |
| **Nav item** | 14 px sans; active = underline 1 px; counts as small muted superscript (`Work 32`) |
| **Menu overlay** | Full-screen `--bg`, giant condensed links (`--fs-h1`), numerals `01-05` mono, staggered reveal |
| **Pill button (primary)** | Outline pill, label 14 px sans medium; hover = fill sweeps from bottom to `--fg`, label inverts |
| **Pill button (accent)** | `--accent` fill, white label; hover = deep + arrow shifts 4 px |
| **Circular arrow button** | 44 px circle, hairline, arrow rotates -45° → 0° on hover |
| **Section label** | `• ABOUT ME` (bullet + condensed small caps 14 px, letter-spacing .06em) |
| **Stat** | Condensed numeral `--fs-h1`, `+` superscript, 12 px muted label |
| **List row (hover-reveal)** | Condensed uppercase `--fs-h1`; bracketed mono year top-right; hover = em-dash prefix, text shifts +0.6em |
| **Filmstrip** | 64 × 80 px thumbs (portrait), 8 px gap; inactive = greyscale 100%/opacity .6; active = colour + 24 px line + mono index below |
| **Form field** | Underline, 16 px (prevents iOS zoom), floating label, error text `--danger` 14 px |
| **Toast** | Bottom-centre pill, `--bg-elevated`, auto-dismiss 4 s |
| **Lightbox** | `--bg` at 96% opacity, image `object-fit: contain`, counter `03 / 24` mono, caption bottom-left, close ✕ top-right |

---

## 6. Page layouts (wireframes)

Desktop 1440 unless stated. Detailed behaviour in [PAGES.md](./PAGES.md); animations in [MOTION.md](./MOTION.md).

### 6.1 Home: Floating Collage Hero (P1)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Zetona_E (serif)                                          ═══ (menu)   │
│  ┌──────┐        ┌────────┐       ┌───┐                ┌──────────┐    │
│  │ tall │        │ square │       │ w │                │  land-   │    │
│  │      │        │        │       └───┘                │  scape   │    │
│  └──────┘        └────────┘                            └──────────┘    │
│ ┌────┐                                                       ┌────────┐│
│ │tall│       Beautiful moments of beautiful people.          │ portrait││
│ │    │            (serif, --fs-hero, overlaps cards)         │ (large) ││
│ └────┘                  ( View the work  → )                 └────────┘│
│        ┌─────────┐                                                ┌──┐ │
│        │ close-up│       ┌─────────┐                              │  │ │
│        └─────────┘       └─────────┘                              └──┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- **8-12 cards** pulled from admin-flagged `featured_home` photos (min 5 to render the collage; fewer → fall back to a **single full-bleed hero** image with the same headline).
- Cards sized from a **layout preset table** (§6.1.1), jittered per load by ±2% so it never looks pasted.
- Headline centred, layered **above** some cards and **below** others (`z-index` split) to create the overlap in the reference.
- **Mobile (390):** 6 cards in a staggered 2-column field behind the headline; hamburger top-right; CTA pill under headline; cards parallax with touch scroll.

#### 6.1.1 Collage slot presets (`lib/collage-presets.ts`)

Positions as `{ x%, y%, w vw, aspect, depth, z }` where `depth` ∈ 0.4-1.6 sets parallax speed. 3 presets rotated per visit; each has 10 slots; slots 0-3 are **LCP candidates** (largest, above the fold, `priority`).

```
preset A (reference-like): edge-bleeding cards at TL, T-centre, TR, L, R, BL, B-centre, BR, with the largest portrait right of the headline.
preset B (gallery wall):   two columns of tall cards flanking a clear centre; smaller landscape accents.
preset C (diagonal):       cards cascade from top-left to bottom-right; headline sits across the diagonal.
```

### 6.2 Home: below the hero (scroll narrative)

1. **Statement** (serif `--fs-lead`, scroll-lit text P3): the aim line + short intro.
2. **Selected Work: Pinned Filmstrip Selector** (P5): one large image + caption + `View collection →`, thumb strip drives it.
3. **Marquee strip** of portraits (infinite, speed linked to scroll velocity). Optional, `featured_home` photos.
4. **Collections** (cinematic blur-backdrop sections P7), one per collection (max 4 on home).
5. **About teaser** (split layout: portrait left, text right, `Read more →`).
6. **Footer CTA** (P9): LET'S TALK.

Any block with no data is not rendered (AGENTS rule 2).

### 6.3 Work (index)

- **Desktop:** Pinned Filmstrip Selector across collections (P5) with `View collection →`; a toggle `Grid / List` switches to P6 hover-reveal list or card grid.
- **Mobile:** vertical card list, one collection per row, 4:5 cover with title overlay; tap → collection.
- Nav shows a live count: `Work (32)` = number of **published photos**.

### 6.4 Collection gallery

```
[ Header ]
COLLECTION TITLE (condensed mega)                        [ 24 photos ]
intro sentence (sans, muted)                              [ grid | story ]
─────────────────────────────────────────────────────────────────────────
masonry (3 col ≥1024, 2 col ≥480, 1 col <480), natural aspect ratios
─────────────────────────────────────────────────────────────────────────
Next collection →  (giant condensed link with preview image)
```

- Click a photo → lightbox with shared-element (layout) transition from the thumbnail.
- **Story mode (P7):** each photo becomes a full-viewport section with blurred backdrop and sharp inset; ≤ 8 photos recommended.

### 6.5 Archive

Dense grid of **all published photos**, newest first. Sticky filter chips by collection; masonry or uniform 4:5 tiles; hover = colour/scale; infinite pagination (24 per page) with "Load more" button fallback. Purpose: depth + SEO (more indexed image URLs).

### 6.6 About (Split-Name Hero P2 + Scroll-Lit Text P3)

```
[Header]
┌──────────────────────────────────────────────────────────────┐
│ ZETONA            (giant condensed, top-left)                │
│                 ┌───────────┐                                │
│                 │ crop-frame│  full-bleed blue-graded image  │
│                 │ window    │                                │
│                 └───────────┘                      _E        │
└──────────────────────────────────────────────────────────────┘
• ABOUT ME     I'm Zetona_E, a studio and portrait photographer … (scroll-lit)
              [stats: hidden until real]
• APPROACH     (optional) 3 short principles, only if client writes them
```

- The split uses the final display name from Q1 (e.g. first name top-left, surname bottom-right). **Do not ship the split until the name is confirmed**; until then use a single-line giant `Zetona_E` wordmark.
- The crop-frame window cycles 3-5 portraits (admin-flagged `featured_about`), no more than 1 swap per 3 s.

### 6.7 Contact

- Top: giant **LET'S TALK. →** (condensed mega).
- Left: form (underline fields). Right: full-height portrait panel (P9).
- Under the form: three buttons: `Send message` (primary), `Chat on WhatsApp` (accent), `Email directly` (outline).
- `[Q]` quick links · `[S]` socials (only those that exist) · `[C]` contact details (city, email, phone).

### 6.8 Legal (Privacy)

Simple long-form, `--fs-body`, 65ch, minimal motion.

### 6.9 404 / error

Giant condensed `404` with a floating collage fragment (3 cards) and `Back to work →`. Error page keeps header/footer.

### 6.10 Admin (functional, not decorative)

`--bg-elevated` surfaces, system-calm UI, **no heavy animation** (only layout reorder, upload progress, toasts). See [ADMIN.md](./ADMIN.md).

---

## 7. Responsive rules

| Concern | ≥ 1024 | 768-1023 | < 768 |
|---------|--------|----------|-------|
| Nav | Inline links + CTA | Inline + hamburger for secondary | Hamburger overlay |
| Home collage | 10 cards, mouse parallax | 8 cards | 6 cards, scroll parallax only |
| Selector (P5) | Pinned section, hover-driven | Pinned, tap-driven | Swipeable carousel + dots |
| List (P6) | Cursor-tracking preview | Tap row = expand preview inline | Tap row = expand preview inline |
| Masonry | 3 col | 2 col | 1-2 col (2 col ≥ 480) |
| Backdrop section (P7) | Blur + inset | Blur + inset | Inset only, `blur(24px)` on a smaller canvas for perf |
| Custom cursor | On | Off | Off |
| Footer | 3 columns + portrait right | 2 columns | Stacked, portrait above CTA |

Touch targets ≥ 44 × 44. Never rely on hover for essential content.

---

## 8. Voice & microcopy in UI

Short, warm, lowercase-friendly verbs. Buttons: *View the work · Chat on WhatsApp · Send message · Back to work.* Errors are human and actionable; never blame the user.

---

## 9. Design QA checklist

- [ ] Home reads as the Rabah reference *in structure* but is visibly Zetona_E (blue touches, his photos).
- [ ] Headline legible over every collage configuration (contrast check on all 3 presets).
- [ ] Every page at 390 / 768 / 1440 / 1920 has no horizontal scroll and no clipped text.
- [ ] No more than one accent colour appears.
- [ ] No image distorted or upscaled beyond 1.0 × device pixels.
- [ ] Mono index labels are ≥ 11 px.
- [ ] Hidden-by-default sections truly do not render when data is absent.
