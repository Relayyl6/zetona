# ROADMAP.md: Phased Build Plan

Each phase leaves the app **deployable**. Gates: [TESTING.md](./TESTING.md) §1, §11. Rules: [AGENTS.md](./AGENTS.md).
Estimates are for one experienced developer (or agent + review); adjust to reality.

---

## Phase map

| Phase | Name | Outcome | Est. |
|------:|------|---------|------|
| P0 | Foundation | Repo, tooling, CI, tokens, providers | 0.5 d |
| P1 | Home (collage) + shell | Header, menu, footer, Home hero with full motion | 2-3 d |
| P2 | Work & galleries | Work index, selector, collection page, lightbox, archive | 3-4 d |
| P3 | About & Contact | About, form (email + WhatsApp), privacy | 1.5-2 d |
| P4 | Data layer | D1 schema, queries, seed, revalidation, DTOs | 1-1.5 d |
| P5 | Media pipeline | R2 buckets, loader, presign, client processing, orphan reaper | 2 d |
| P6 | Admin | Auth, photo CRUD, collections, settings, enquiries | 2.5-3 d |
| P7 | SEO, security, perf, deploy | JSON-LD, sitemaps, headers, budgets, production setup | 2 d |
| P8 | Polish & launch | Motion perf pass, device testing, content load, handover | 2 d |

Order note: P1-P3 can run on **static placeholder data** (matching DTO shapes) so design and motion get approved by the client early; P4-P6 then swap the data layer in, as in the sibling SH Photography scaffold.

---

## P0: Foundation
- Next.js + TS strict, Tailwind, ESLint, Prettier, Vitest, Playwright skeleton, pnpm, Husky (lint-staged, gitleaks).
- OpenNext + `wrangler.jsonc` skeleton; "hello" deploy to a preview Worker.
- `lib/site-config.ts` (from [CONTENT.md](./CONTENT.md) §2), `lib/design-tokens.ts`, `globals.css` tokens ([DESIGN.md](./DESIGN.md) §3), fonts via `next/font`.
- `lib/motion/tokens.ts`, `Providers` (LazyMotion, MotionConfig, Lenis).
- CI pipeline running lint/typecheck/unit/build.
- **Exit:** CI green; preview URL live; tokens visible on a style-guide page (`/_styleguide`, dev only).

## P1: Home + shell
- Header, MenuOverlay, Footer (P9), PageTransition, Preloader, CustomCursor.
- `CollageHero` with 3 presets, entrance, idle float, pointer tilt, parallax; fallbacks for < 5 photos.
- Statement (scroll-lit), About teaser (hidden w/o bio).
- Dev placeholder images (SVG blocks labelled PLACEHOLDER).
- **Exit:** Home matches the Rabah reference in structure ([INSPIRATION-ANALYSIS.md](./INSPIRATION-ANALYSIS.md)); reduced-motion variant verified; Home Lighthouse ≥ 85; client review of motion feel.

## P2: Work & galleries
- `/work` (Selector P5, List P6, Grid), `/work/[slug]` (masonry, lightbox, deep link, story mode optional), `/archive` (filters, pagination).
- Cinematic section (P7) used on Home and collections.
- **Exit:** keyboard & touch parity; lightbox shared-element working; a11y scans clean; 60 fps check on throttled profile.

## P3: About & Contact
- About with split-name hero (if Q1 resolved) or wordmark; scroll-lit bio; hidden stats.
- Contact form (RHF + Zod), honeypot, Turnstile, three CTAs, `lib/whatsapp.ts` + tests, `/api/enquiries` (stub then real in P4).
- Privacy page.
- **Exit:** both contact routes work end-to-end (mock email); WhatsApp URL test passes.

## P4: Data layer
- Drizzle schema + migrations; queries returning DTOs; seed (dev only); `revalidateTag` plumbing; D1 local + preview.
- Replace placeholder data sources; enquiries persisted **before** email.
- **Exit:** invariants tested; pages handle empty/1/200-photo states; Resend wired (real email in preview).

## P5: Media pipeline
- R2 buckets + CORS; `lib/storage/*`; presign endpoint; verify-on-create; loader with both strategies; client `process.ts` + worker; thumbhash; orphan reaper cron.
- **Exit:** upload fixtures succeed on throttled network; EXIF stripped in public copy; original bucket private; strategy switch works.

## P6: Admin
- Clerk + `requireAdmin()`; photo grid, upload queue, editor with focal-point picker; collections; settings (bio/headline/socials/toggles); enquiries list; Trash/restore/purge; audit log; mobile layout.
- **Exit:** [ADMIN.md](./ADMIN.md) §8 checklist complete; security tests green.

## P7: SEO, security, performance, deployment
- Metadata, OG images, JSON-LD, sitemap (+images), robots; headers/CSP; rate limits; Cloudflare rules; Lighthouse CI budgets; Web Analytics; cron jobs; backups.
- Production Cloudflare setup per [DEPLOYMENT.md](./DEPLOYMENT.md) §2.
- **Exit:** Lighthouse mobile budgets met on production URL; SEO tests green; security checklist complete.

## P8: Polish & launch
- Motion performance pass (remove/simplify < 55 fps effects), cross-browser/device matrix, copy review with client, load real photos & alt text, final OPEN-QUESTIONS sweep, owner training + one-page guide, handover.
- **Exit:** Definition of Done below.

---

## Definition of Done (client-facing)

- [ ] The Home page presents his photos as a floating, animated collage on near-black with a serif headline and pill CTA, in the spirit of the reference, in his brand blue.
- [ ] Inner pages (Work, collection, Archive, About, Contact) deliver the editorial scroll experience from the recording, with real photos.
- [ ] Animation is rich yet smooth on a mid-range phone; reduced-motion users get a calm, complete site.
- [ ] Visitors can contact him in one tap by WhatsApp, email, or the form; no lead is ever lost.
- [ ] He can sign in, upload, describe, publish, reorder, hide, delete and restore photos himself, from his phone.
- [ ] Images are served from Cloudflare R2/CDN, fast, sharp, correctly sized, with originals private.
- [ ] No invented facts: no fake awards, testimonials, stats, handles or prices anywhere.
- [ ] SEO foundations in place; site submitted to Search Console; share cards work.
- [ ] Lighthouse mobile: Performance ≥ 90 (Home ≥ 85), Accessibility ≥ 95, Best Practices ≥ 95, SEO 100; axe: zero serious violations.
- [ ] All OPEN-QUESTIONS either resolved or consciously deferred with safe defaults.

## Post-v1 backlog (see [CLIENT-SPEC.md](./CLIENT-SPEC.md) §6)

Services/pricing page · testimonials & awards (data + toggles) · booking-type enquiry · journal/blog · private client proofing galleries · print shop · multi-language · more analytics views.

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Heavy motion hurts mid-range phones | Bad UX, SEO | Budgets, fallbacks, device testing, lite mode |
| Client photos arrive late/low-res | Weak showcase | Placeholder-safe states; photo guidance sheet to client |
| Transformations quota/cost | Surprise bill | Fixed widths, Strategy B switch, monitoring |
| OpenNext feature gaps | Rework | Adapter ports; Vercel fallback path (ADR-002) |
| Unconfirmed brand details | Rework | OPEN-QUESTIONS safe defaults; tokens swappable |
| Scope creep toward complex admin | Delay | ADR-009; backlog list |
