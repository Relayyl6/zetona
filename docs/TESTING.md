# TESTING.md: Quality Gates

Related: [AGENTS.md](./AGENTS.md) §6 · [ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md) · [SECURITY.md](./SECURITY.md) · [ROADMAP.md](./ROADMAP.md)

## 1. Phase gate (must pass before marking any phase complete)

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e            # Playwright against the preview/dev server
pnpm lighthouse:ci       # budgets from ACCESSIBILITY-PERFORMANCE.md
```

## 2. Unit tests (Vitest)

| Area | Cases |
|------|-------|
| `lib/validators/*` | Valid/invalid enquiry, honeypot, photo update, publish guard (alt required), collection slug regex, upload request limits |
| `lib/whatsapp.ts` | Builds `https://wa.me/2348030812138?text=…`; encodes unicode/newlines/`&`; no `+` or spaces in number; truncates overly long text |
| `lib/storage/keys.ts` | Key scheme, sanitised filenames, immutability (hash in key) |
| `lib/storage/loader.ts` | Transform URL form; variants fallback; dev fallback |
| `lib/auth/admin.ts` | allowlist parsing, case-insensitive, fail-closed when env empty |
| `lib/collage-presets.ts` | Each preset has ≥ 10 slots; slots 0-3 flagged LCP; no overlap beyond threshold with headline box |
| `lib/db/queries` (with local D1/Miniflare) | `listPublished` excludes drafts/trashed; invariants 1-8 from DATA-MODEL §4; reorder normalisation |
| `lib/seo/jsonld.ts` | No empty fields; omits `sameAs` when no socials; valid JSON |
| `lib/image/process.ts` | Resize math, no-upscale, orientation handling (using fixtures) |
| Visibility rules | Sections hide with no data: Awards/Testimonials/Stats/About teaser/Collage thresholds |

## 3. Component tests (Vitest + Testing Library)

- `ScrollLitText` renders all words at full opacity in reduced-motion mode.
- `CountUp` renders final value when reduced-motion.
- `FilmstripSelector`: keyboard arrows change selection; `aria-current` updates.
- `ContactForm`: shows errors, disables during submit, shows success/failure.
- `SocialLinks`: renders nothing for null links.
- `Photo`: throws/fails on missing `alt` for published photos in dev.

## 4. End-to-end (Playwright)

Projects: **Desktop Chrome**, **Mobile Chrome (Pixel 5)**, **Mobile Safari (iPhone)**, plus a `reducedMotion: 'reduce'` run of core flows.

| Flow | Assertions |
|------|-----------|
| Navigation | Header links, menu overlay open/close/Esc, focus return, active underline, `/portfolio` → `/work` redirect |
| Home | Collage renders when ≥ 5 featured; falls back with fewer; headline `h1`; CTA → `/work`; no console errors |
| Work → Collection | Selector changes image/caption with keyboard; "View collection" navigates; masonry renders; lightbox open/next/prev/Esc; `?photo=` deep link opens lightbox |
| Archive | Filter chips filter; "Load more" works; `?page=2` is crawlable |
| Contact (email path) | Valid submit → row inserted **before** email (mock Resend; assert order); failed email still shows success + row `failed`; honeypot rejected; rate limit 429 |
| Contact (WhatsApp) | Button href equals expected `wa.me` URL with prefilled message; opens in new tab with `rel` set |
| Admin auth | Unauth `/admin` → sign-in; non-allowlisted → forbidden; every `/api/admin/*` 401/403 |
| Admin upload | Upload 3 fixture images (mock presign/R2 with MSW or local R2 emulation) → drafts appear → add alt → publish → visible on public page |
| Admin edit/reorder/delete | Reorder persists; delete → Trash → restore; permanent delete removes keys |
| Settings | Edit bio → About page updates |
| Reduced motion | Collage static, text fully lit, no pinned section, lightbox fade only |
| SEO | Sitemap lists routes; meta/canonical unique; JSON-LD present; `/admin` noindex |
| Headers | CSP/HSTS/etc. present |

## 5. Accessibility

- `@axe-core/playwright` on Home, Work, a Collection, Archive, About, Contact, Admin (zero serious/critical).
- Keyboard-only walkthrough scripted for menu, selector, lightbox, form.
- Manual: VoiceOver (iOS) and TalkBack (Android) pass on Home → Collection → Contact.

## 6. Visual regression

Playwright screenshots (masked for animations: freeze with `animations: 'disabled'` and a `?motion=off` test flag) at 390 / 768 / 1440 for Home, Work, Collection, About, Contact, 404. Tolerance 0.2%. Update intentionally via PR label.

## 7. Performance

- Lighthouse CI (mobile) on Home, Work, Collection, About, Contact with assertions from ACCESSIBILITY-PERFORMANCE §1.
- Bundle-size check (`size-limit`) on first-load JS.
- Manual: Chrome Performance profile with 4× CPU throttle on Home hero and collection scroll; record fps ≥ 55.

## 8. Security tests

- Route-enumeration test for auth (all `/api/admin/**` files must call `requireAdmin`; a lint rule/test greps for it).
- Presign abuse cases (type, size, count, quota).
- Build output secret scan.
- `pnpm audit` high/critical = fail.

## 9. Test data & fixtures

`tests/fixtures/` includes: 6 small portrait JPEGs (various orientations incl. EXIF-rotated, one with GPS EXIF, one PNG, one WebP, one oversized 12 MP). All are **synthetic or CC0**: no client photos in the repo.

## 10. CI

GitHub Actions: install → lint → typecheck → unit → build → Playwright (against `wrangler dev`/preview) → Lighthouse CI → audit/secret-scan. Preview deployment per PR; required checks block merge.

## 11. Definition of "tested" per phase

Each ROADMAP phase lists its required test additions; a phase is **not complete** if its row in the matrix below is empty.

| Phase | Required additions |
|-------|-------------------|
| P0 | CI skeleton, lint/typecheck/unit running |
| P1 | Tokens tests, Home e2e (collage thresholds), reduced-motion e2e |
| P2 | Selector/gallery/lightbox e2e, a11y scans |
| P3 | About/Contact e2e (email + WhatsApp), validator tests |
| P4 | DB query + invariant tests |
| P5 | Upload/storage tests, loader tests |
| P6 | Admin auth/CRUD e2e, security tests |
| P7 | SEO tests, Lighthouse CI budgets, headers |
| P8 | Full regression + manual device pass |
