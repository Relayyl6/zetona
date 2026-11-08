# Zetona_E — Studio & Portrait Photography Portfolio

A visibility-first portfolio website for a studio and portrait photographer based in
Benin City, Nigeria. Built with **Next.js (App Router) + TypeScript + Tailwind + Motion
(Framer Motion)**, with images stored and served from **Cloudflare R2** and managed through a
deliberately small, protected **photo CRUD admin**.

> **Client brief in one line:** "Just a place where I can show my portfolio and gain more
> visibility", presented professionally and properly. Nothing more complex than that.

This folder is the **documentation suite** that tells an AI coding agent (or a human developer)
exactly what to build, how it should look and move, and where the open questions are.

---

## Read order

| # | File | Purpose |
|---|------|---------|
| 1 | [AGENTS.md](./AGENTS.md) | **Operating manual** for the implementing agent. Rules, priorities, guardrails. Read first. |
| 2 | [CLIENT-SPEC.md](./CLIENT-SPEC.md) | What the client asked for, split into *client facts*, *developer direction* and *suggestions*. |
| 3 | [CONTENT.md](./CONTENT.md) | Every piece of copy and fixed fact, with its provenance. Single source for `site-config.ts`. |
| 4 | [INSPIRATION-ANALYSIS.md](./INSPIRATION-ANALYSIS.md) | Frame-by-frame breakdown of the reference video and the home-page screenshot. |
| 5 | [DESIGN.md](./DESIGN.md) | Visual system: colour, type, grid, components, imagery, per-page layouts. |
| 6 | [MOTION.md](./MOTION.md) | The animation bible: every effect, its Motion code pattern, timing and fallbacks. |
| 7 | [PAGES.md](./PAGES.md) | Sitemap, per-page section order, behaviour, states. |
| 8 | [COMPONENTS.md](./COMPONENTS.md) | Component inventory with props, motion hooks and acceptance criteria. |
| 9 | [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, folder structure, rendering strategy, data flow. |
| 10 | [DATA-MODEL.md](./DATA-MODEL.md) | Database schema, Zod schemas, seed data. |
| 11 | [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) | Cloudflare R2 storage, upload, variants, delivery, deletion. |
| 12 | [ADMIN.md](./ADMIN.md) | The photo-management dashboard (auth + CRUD). |
| 13 | [SEO.md](./SEO.md) | Metadata, structured data, local SEO for Benin City, sharing cards. |
| 14 | [ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md) | Budgets, reduced-motion rules, image performance. |
| 15 | [SECURITY.md](./SECURITY.md) | Auth, upload hardening, rate limits, headers. |
| 16 | [TESTING.md](./TESTING.md) | Unit, e2e, visual, a11y and performance gates. |
| 17 | [DEPLOYMENT.md](./DEPLOYMENT.md) | Cloudflare setup, env vars, CI, launch checklist, handover. |
| 18 | [DECISIONS.md](./DECISIONS.md) | Architecture decision records (why each choice was made). |
| 19 | [ROADMAP.md](./ROADMAP.md) | Phased build plan and Definition of Done. |
| 20 | [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) | Everything unconfirmed. Owner, blocker, safe default. |

| 21 | [AGENT-KICKOFF-PROMPT.md](./AGENT-KICKOFF-PROMPT.md) | Paste-ready prompt to start the coding agent. |
| 22 | [CLIENT-QUESTIONNAIRE.md](./CLIENT-QUESTIONNAIRE.md) | Plain-language questions and photo-prep guide to send the client. |
| 23 | [.env.example](./.env.example) | Every environment variable, no values. |

Authority order when files disagree: **client's words → CLIENT-SPEC → AGENTS → everything else.**

---

## Reference assets

`reference/` holds the visual evidence the docs are based on.

- `reference/home-hero-rabah.png`: the home page the client liked (scattered image collage on black).
- `reference/client-chat-brand-brief.png`: the client's brand answers (blue, name, positioning).
- `reference/frames/01…16-*.jpg`: frames sampled every 2.5 s from the inspiration screen recording.

Frame names are used as stable IDs throughout the docs (e.g. "frame 07").

---

## Product summary

| Item | Value |
|------|-------|
| Brand / handle | `Zetona_E` (as the client wrote it; see OPEN-QUESTIONS Q1) |
| Positioning | Studio and portrait photographer |
| Aim (client's words) | "To capture beautiful moments of beautiful people." |
| Base | Benin City, Nigeria |
| Accent colour | **Blue** (client-confirmed; exact shade is `[SUGGESTED]`, see DESIGN.md) |
| Contact | Osakpolorobazee01@gmail.com · 08030812138 |
| Core goal | Visibility + a professional way to showcase the portfolio |
| Home page | Floating image-collage hero on near-black (reference: Rabah screenshot) |
| Inner pages | Editorial scroll experience (reference: Kristin Watson recording) |
| Animation | Maximal, but purposeful. Built on Motion for React (Framer Motion). |
| Admin | Single-owner photo CRUD. No CMS, no page builder. |
| Storage | Cloudflare R2 (+ Image Transformations for delivery) |

## Scope fence

**In:** Home, Work (index + collection galleries), About, Contact, Archive (all-photos grid),
legal page, admin photo CRUD, SEO, analytics, social links.

**Out (unless the client asks):** shop/e-commerce, bookings, client proofing portals, blog,
multi-user admin, pricing tables, testimonials/awards (only if the client supplies real ones).

## Quick start (once code exists)

```bash
pnpm install
cp .env.example .env.local     # fill values per DEPLOYMENT.md
pnpm db:migrate && pnpm db:seed
pnpm dev                       # http://localhost:3000
pnpm lint && pnpm typecheck && pnpm test
```

## Naming conventions used in these docs

- `[CLIENT]` verified from the client's own words or supplied data.
- `[DEV]` direction from the developer (stack choices).
- `[SUGGESTED]` an agent or designer proposal that the client has **not** approved.
- `[PLACEHOLDER: …]` a visible stand-in that must be tracked in OPEN-QUESTIONS.md.
