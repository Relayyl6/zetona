# COMPONENTS.md: Component Inventory

Each entry: purpose · props · motion · a11y · acceptance. Visual rules in [DESIGN.md](./DESIGN.md) §5; motion in [MOTION.md](./MOTION.md). Server components by default; ⚡ = client component.

---

## 1. Layout

| Component | Purpose | Notes |
|-----------|---------|-------|
| `RootLayout` | Fonts, providers, header/footer, skip link | Providers: LazyMotion, MotionConfig, Lenis ⚡ |
| `Header` ⚡ | Wordmark, nav, CTA, menu trigger | Hide-on-scroll, blend-difference, `layoutId` underline |
| `MenuOverlay` ⚡ | Full-screen nav | Focus trap, Esc, Lenis stop, staggered links |
| `Footer` | P9: giant CTA, portrait, `[Q][S][C]`, legal | Renders only existing socials |
| `PageTransition` ⚡ | Curtain / view-transition wrapper | Reduced motion → fade |
| `Preloader` ⚡ | First-visit intro (≤ 1.2 s) | Skippable; sessionStorage flag |
| `CustomCursor` ⚡ | "View/Drag/Expand" badge | Pointer-fine only; dynamic import `ssr:false` |

## 2. Motion primitives (`components/motion/`)

`Reveal`, `MaskLines`, `SplitChars`, `ImageReveal`, `Parallax`, `ScrollLitText`, `CountUp`, `Marquee`, `Magnetic`: behaviour in [MOTION.md](./MOTION.md) §5. All ⚡; each accepts `disabled` and honours reduced motion internally.

## 3. Imagery

### `Photo` (server-friendly wrapper around `next/image` with the custom loader)
```ts
type PhotoProps = {
  photo: PhotoDTO;               // id, width, height, alt, thumbhash, focalX, focalY, keys
  sizes: string;                 // required; no default
  priority?: boolean;            // LCP candidates only
  className?: string;
  fit?: "cover" | "contain";     // default "cover" within sized parent; "contain" in lightbox
};
```
- Renders blur-up (`blurDataURL` from thumbhash), `object-position` from focal point, explicit aspect-ratio box → **zero CLS**.
- `alt` required; if empty on a published photo, build/lint test fails (see TESTING).

### `BlurBackdrop`
Pre-blurred tiny image scaled to cover + overlay (MOTION §6.8). Props: `photo`, `brightness`.

## 4. Home

| Component | Props | Behaviour |
|-----------|-------|-----------|
| `CollageHero` ⚡ | `photos: PhotoDTO[]`, `headline`, `cta` | Preset selection, entrance, idle float, pointer tilt, parallax, hover dim, a11y: images decorative (`alt=""`) *because* they're repeated in Work; headline is the `<h1>` |
| `Statement` ⚡ | `text` | Sticky + `ScrollLitText` |
| `FilmstripSelector` ⚡ | `items: {id,title,description,href,photo}[]` | MOTION §6.4; roving tabindex; `aria-current` |
| `CinematicSection` ⚡ | `collection`, `photo`, `index` | MOTION §6.8; "View ↗" cursor |
| `AboutTeaser` | `bio`, `photo` | Hidden if no bio |

## 5. Work / gallery

| Component | Notes |
|-----------|-------|
| `CollectionList` ⚡ | P6 hover-reveal list; tap-to-expand on touch |
| `CollectionGrid` | Cards (mobile default) |
| `ViewToggle` ⚡ | `Selector / List / Grid`; `aria-pressed` |
| `MasonryGallery` ⚡ | CSS columns or JS shortest-column; natural aspect ratios; per-tile reveal |
| `Lightbox` ⚡ | Shared-element, drag/arrow/Esc, preloading, focus trap, counter, caption, deep link; `yet-another-react-lightbox` **or** custom (Motion `layoutId`): prefer custom for the shared-element effect, fall back to the library if time-boxed (log in DECISIONS) |
| `FilterChips` ⚡ | Archive filter; layout animation |
| `Pagination` | "Load more" button + `?page=` links |

## 6. About / Contact

| Component | Notes |
|-----------|-------|
| `SplitNameHero` ⚡ | Name halves + `CropFrame`; falls back to single wordmark if `split` not configured |
| `CropFrame` ⚡ | Corner-handle box, cycling portraits, pointer ease |
| `StatsRow` ⚡ | `CountUp` ×n; renders only with real stats |
| `AwardsList` ⚡ | P6 variant with years; **hidden until real data** (Q8) |
| `Testimonials` ⚡ | P8; **hidden until real data** |
| `ContactForm` ⚡ | RHF + Zod; honeypot; Turnstile; three CTAs; success/error states |
| `WhatsAppButton` | Uses `lib/whatsapp.ts`; tested |
| `SocialLinks` | Renders only non-null links; each with accessible name; `rel="me noopener"` |

## 7. UI atoms

`PillButton`, `CircleArrowButton`, `TextLink` (underline draw), `SectionLabel` (`• LABEL`), `MonoIndex` (`[ 2026 ]`), `Divider`, `Toast`, `Skeleton`, `VisuallyHidden`, `Field` (floating label, error), `Select`.

## 8. Admin (`components/admin/*`)

| Component | Notes |
|-----------|-------|
| `UploadDropzone` ⚡ | Multi-file, drag-drop, camera-roll friendly on mobile, client-side processing (MEDIA-PIPELINE §4) |
| `UploadQueue` ⚡ | Per-file progress, retry, cancel |
| `PhotoGrid` ⚡ | Selectable tiles, status badge, drag-reorder |
| `PhotoEditor` ⚡ | Form + focal-point picker + live preview of hero/crop |
| `FocalPointPicker` ⚡ | Click on image sets `focal_x/y` |
| `ConfirmDialog` ⚡ | Delete confirmation with typed consequence ("This removes the photo from the site.") |
| `CollectionManager` ⚡ | CRUD + reorder + cover |
| `SettingsForm` ⚡ | Feature toggles |

## 9. Cross-cutting acceptance criteria

- No component hard-codes colours, fonts, durations or easings (tokens only).
- Every interactive component is keyboard operable with a visible `--accent` focus ring (2 px, offset 3 px).
- Every ⚡ component documents its reduced-motion behaviour in a header comment and has a test.
- Props validated with TypeScript; external data validated with Zod before reaching components.
- Components never fetch their own data; pages/server components pass DTOs down.
