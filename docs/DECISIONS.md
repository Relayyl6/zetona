# DECISIONS.md: Architecture Decision Records

Format: **Context → Decision → Consequences → Revisit when.** Status: Accepted unless noted.
Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [AGENTS.md](./AGENTS.md) §3

---

### ADR-001: Next.js full-stack (App Router, TypeScript)
- **Context:** Developer direction: Next.js for front end and back end.
- **Decision:** One Next.js app serves public pages, admin and API.
- **Consequences:** Single codebase/deploy; server components keep public JS light. Next.js evolves quickly, so the agent must read installed docs (AGENTS §3).
- **Revisit:** if OpenNext/Workers blocks a needed feature → ADR-002 fallback.

### ADR-002: Host on Cloudflare Workers via OpenNext
- **Context:** Client wants Cloudflare for storage/retrieval; keeping compute, DB, storage and CDN in one place simplifies bindings, cost and handover.
- **Decision:** Deploy with `@opennextjs/cloudflare`; bind D1 and R2 directly.
- **Consequences:** Free-tier friendly, edge-fast in Africa/Europe, native R2 access. Some Next.js features have constraints on Workers (Node APIs, image optimiser).
- **Revisit:** if a blocking limitation appears → deploy to Vercel, keep R2 via S3 API and swap D1 for Turso/Neon behind the `PhotoRepo` port.

### ADR-003: D1 (SQLite) + Drizzle for metadata
- **Context:** Metadata volume is tiny (hundreds of photos). Needs simple relational data and migrations.
- **Decision:** D1 with Drizzle ORM and drizzle-kit migrations.
- **Consequences:** Zero extra vendor; Time Travel backups. SQLite semantics (no heavy concurrency): fine for one admin.
- **Alternatives:** Neon/Supabase Postgres (used in the sibling SH Photography project): more power than needed, extra vendor.
- **Revisit:** if multi-user or analytics-heavy features arrive.

### ADR-004: R2 with two buckets, direct browser upload via presigned PUT
- **Context:** Large images; Workers body/CPU limits; privacy of originals/EXIF.
- **Decision:** Public bucket for EXIF-stripped display JPEGs; private bucket for originals; uploads go browser → R2; server verifies via HEAD.
- **Consequences:** Robust and cheap; needs CORS and presign code. Client does image processing.
- **Alternatives:** Upload through the Worker (hits limits); Cloudflare Images product (more cost/opinion).

### ADR-005: Admin auth = Clerk with single-email allowlist
- **Context:** One owner who will mostly use a phone; wants simplicity; developer previously used Clerk.
- **Decision:** Clerk (Google sign-in, optionally passkeys) + server-side allowlist check on every mutation.
- **Consequences:** Polished UX, MFA available, minimal code. Third-party dependency for admin only.
- **Alternatives:** **Cloudflare Access** (zero code, one-time PIN): excellent fallback/second layer; Auth.js with email magic links.
- **Revisit:** if the client prefers not to depend on Clerk (Q16).

### ADR-006: Motion for React (Framer Motion) as the animation engine, + Lenis
- **Context:** "Maximise animations, incorporate Framer."
- **Decision:** `motion/react` with `LazyMotion` + `m` components; shared tokens; Lenis for smooth scroll (optional, disabled for reduced motion).
- **Consequences:** Declarative, layout/shared-element animations, scroll-linked values; bundle controlled via LazyMotion. Must guard performance (MOTION §3).
- **Alternatives:** GSAP ScrollTrigger (powerful, licensing considerations, more imperative); CSS scroll-driven animations (progressive enhancement for simple cases only).

### ADR-007: Maximal motion with a strict fallback contract
- **Decision:** Every effect must define reduced-motion, touch, low-power and no-JS behaviour (MOTION §3, §7); performance budget enforced in CI.
- **Consequences:** Slightly more work per effect; protects accessibility, SEO and mid-range-phone UX.

### ADR-008: Image delivery = Cloudflare Image Transformations (default), pre-generated variants (fallback)
- **Decision:** `IMAGE_STRATEGY` env switch; loader abstracts both.
- **Consequences:** Modern formats automatically; transformation quota to monitor; fallback available without schema change.

### ADR-009: Photo CRUD admin only, deliberately minimal
- **Context:** "No complex admin pane. Maybe just a portion to perform CRUD operations on pictures."
- **Decision:** Photos + collections + tiny settings + read-only enquiries. No page builder.
- **Consequences:** Fast to build, hard to break. Content beyond photos (bio, headline) lives in one small settings form.

### ADR-010: Hide-by-default for unverified content sections
- **Context:** The inspiration contains awards, testimonials and stats. The client supplied none.
- **Decision:** Components exist but are hidden until real data + toggle (AGENTS rule 2).
- **Consequences:** No fabricated credibility; easy to switch on later.

### ADR-011: Typography = serif display + condensed accent + clean sans
- **Context:** Home reference uses an editorial serif; inner reference uses tall condensed caps.
- **Decision:** Instrument Serif (emotional statements), Anton (structural giant type), Inter Tight (reading/UI), swappable via CSS variables (Q15).
- **Consequences:** Faithful to both references with a clear role per font.

### ADR-012: Static rendering + tag revalidation
- **Decision:** Public routes static; admin mutations call `revalidateTag`.
- **Consequences:** Fast and cheap; needs the OpenNext cache/tag configuration verified in P4.

### ADR-013: Custom lightbox with shared-element transitions (library as fallback)
- **Decision:** Build on Motion `layoutId`; if time-boxed, use `yet-another-react-lightbox` and drop the shared-element flourish.
- **Consequences:** Signature interaction preserved where affordable; clear fallback.

### ADR-014: Cookieless analytics, no consent banner
- **Decision:** Cloudflare Web Analytics (or Plausible).
- **Consequences:** Simpler UX/legal; coarser data.

### ADR-015: Brand content provenance system
- **Decision:** Tag all facts `[CLIENT]`, `[DEV]`, `[SUGGESTED]`, `[PLACEHOLDER]`; log unknowns in OPEN-QUESTIONS.
- **Consequences:** Prevents invented content (names, awards, prices, handles).
