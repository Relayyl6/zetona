# AGENTS.md: Build Guide for AI Coding Agents

You are the implementing agent for the **Zetona_E portfolio website**. This file is your
operating manual. Read it fully, then read [CLIENT-SPEC.md](./CLIENT-SPEC.md) and
[DESIGN.md](./DESIGN.md) before writing code. If files conflict, the order is:
**client's words → CLIENT-SPEC.md → this file → all other docs.**

---

## 1. Source of truth

1. **The client's own words** (see [CONTENT.md](./CONTENT.md) §1: transcript summary + brand chat).
2. **[CLIENT-SPEC.md](./CLIENT-SPEC.md)**, the derived requirements.
3. **`[DEV]` direction**: Next.js, Cloudflare R2, Motion/Framer, simple admin CRUD.
4. **`[SUGGESTED]` items**: proposals, never presented as client facts.

If you cannot tell whether something is a client fact or an invention, **stop and add it to
[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md)**. Do not fabricate:

- prices, packages, service lists
- awards, testimonials, press mentions, client counts, "years of experience", project stats
- social media handles or URLs
- photo captions or alt text claiming specific real-world subject matter
- the photographer's legal name (only the email local-part `Osakpolorobazee01` and the brand
  `Zetona_E` are known, see Q1)
- an exact brand blue (the client only said "blue")

---

## 2. What the client actually wants (do not over-build)

> "My main aim is more on **visibility** and how to **showcase my portfolio** … professionally or
> properly on the website … Just a place where I can show my portfolio and gain more
> visibility."

Everything you build must serve **showing photographs beautifully** and **being found/contacted**.
When in doubt, cut features, not polish. The admin is *only* picture CRUD.

---

## 3. Stack (agreed)

| Concern | Choice |
|---------|--------|
| Framework | **Next.js (App Router), TypeScript strict**. Front end *and* back end. |
| Styling | Tailwind CSS v4 + CSS variables for tokens |
| Animation | **Motion for React** (`motion/react`, the successor package to `framer-motion`) as the primary engine. See [MOTION.md](./MOTION.md). |
| Smooth scroll | Lenis (optional layer; must disable under reduced motion) |
| Storage | **Cloudflare R2** (private bucket + public custom domain for reads) |
| Image delivery | Cloudflare Image Transformations (`/cdn-cgi/image/…`) with pre-generated fallback variants |
| Database | Cloudflare **D1** (SQLite) via **Drizzle ORM** (see [DECISIONS.md](./DECISIONS.md) ADR-003 for alternative) |
| Hosting | Cloudflare Workers via **OpenNext** (`@opennextjs/cloudflare`) |
| Auth (admin) | Clerk **or** Auth.js with single-owner allowlist, see ADR-005 |
| Email | Resend (contact form) |
| Validation | Zod, shared client + server |
| Analytics | Cloudflare Web Analytics or Plausible (cookieless) |
| Tests | Vitest, Playwright, axe-core, Lighthouse CI |
| Package manager | pnpm |

**Next.js caveat:** assume APIs may differ from your training data. Before using any Next.js
API, check the installed version's docs under `node_modules/next/dist/docs/` and heed
deprecation notices. Same for `motion`, Clerk and OpenNext: verify against installed versions.

---

## 4. Non-negotiable rules

1. **Never invent client facts.** Missing value → visible `[PLACEHOLDER: …]` + entry in OPEN-QUESTIONS.md.
2. **Never show an empty section.** Awards, testimonials, stats and press blocks render only
   when real data exists (`site_settings` flags + non-empty arrays). Default = hidden.
3. **Photos are the product.** No UI chrome may compete with imagery. Never crop a photo
   destructively; use `object-fit` with stored focal points (`focal_x`, `focal_y`).
4. **Maximal animation, never at the cost of access.** Every animation must follow the
   fallback rules in [MOTION.md](./MOTION.md) §3: `prefers-reduced-motion`, touch devices, low-power
   devices, and no-JS.
5. **Never animate layout-thrashing properties.** Animate `transform`, `opacity`, `filter`
   (sparingly) and `clip-path`. Not `width/height/top/left`, except through Motion's `layout`
   system where documented.
6. **Server-only secrets.** R2 keys, Resend key and admin secrets never use `NEXT_PUBLIC_`.
7. **Admin auth is enforced server-side** on every mutation (route handler or server action),
   not by hiding buttons. See [SECURITY.md](./SECURITY.md).
8. **Save before you send.** Enquiry rows are written to the database *before* the email is
   attempted, so a failed email never loses a lead.
9. **Images:** every rendered photo has meaningful `alt` (from `photos.alt`, required on
   publish), intrinsic `width`/`height` (or a sized container), `sizes`, and a blur placeholder.
   Zero layout shift.
10. **Originals are sacred.** Never overwrite or transform the stored original. Variants are
    derived and disposable.
11. **No new top-level pages or gallery categories** beyond [PAGES.md](./PAGES.md) without
    client confirmation. Categories are admin-managed data, not code.
12. **Copy is verbatim** where the client supplied it. Suggested copy is tagged and replaceable
    from the admin/site-config without a code change.
13. **Ask before assuming.** If two spec lines conflict, log it and choose the safer option
    (usually: hide, don't show).

---

## 5. Repo conventions

- Folder structure: [ARCHITECTURE.md](./ARCHITECTURE.md) §3. Follow it.
- `lib/site-config.ts` holds fixed facts (brand, email, phone, WhatsApp E.164, city, socials).
- `lib/design-tokens.ts` mirrors the CSS variables in [DESIGN.md](./DESIGN.md) §3 for JS use (e.g. Motion).
- `lib/motion/` holds shared variants, easings and hooks, the **only** place durations/easings are defined.
- **Typed everything.** No `any`. Use `unknown` + Zod parse at every boundary.
- **No client-side DB or R2 credentials.** Browsers upload using short-lived presigned URLs only.
- Commit per phase ([ROADMAP.md](./ROADMAP.md)); the app must be deployable at the end of each phase.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Component files: one component per file, PascalCase. Hooks: `useThing.ts`. No barrel files.
- Server components by default; add `"use client"` only for interactivity/animation, and
  keep the client boundary as low in the tree as possible.

---

## 6. Phase protocol

For each phase in [ROADMAP.md](./ROADMAP.md):

1. Re-read the phase's referenced docs.
2. Implement.
3. Run the gates in [TESTING.md](./TESTING.md) §1.
4. Update `OPEN-QUESTIONS.md` with anything new or newly resolved.
5. Commit and deploy a preview.

Never start a phase with the previous phase's gates red.

---

## 7. Decision heuristics

- Show **less** to the public until confirmed (hide price, empty sections, unfinished galleries).
- Prefer **boring and robust** for infrastructure; spend creativity budget on the visual layer.
- Prefer **one great interaction** per section over three mediocre ones.
- If an effect feels janky on a mid-range Android phone (the likely majority device in the
  client's market), simplify it. Test there, not only on a desktop.
- Network reality: assume variable mobile data in Nigeria. Hero imagery must load fast
  (see [ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md) §3).

---

## 8. When you're stuck

1. Re-read the relevant doc.
2. Choose the option that exposes less.
3. Add a one-line entry to OPEN-QUESTIONS.md with the phase it blocks.
4. Do not silently ship an assumption.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
