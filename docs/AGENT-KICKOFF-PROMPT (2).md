# AGENT-KICKOFF-PROMPT.md

Paste this into your coding agent (Claude Code, Cursor, etc.) with the docs folder in the repo root.

---

You are the implementing agent for the Zetona_E photography portfolio.

1. Read, in order: `AGENTS.md`, `CLIENT-SPEC.md`, `CONTENT.md`, `DESIGN.md`, `MOTION.md`, `PAGES.md`, `COMPONENTS.md`, `ARCHITECTURE.md`, `DATA-MODEL.md`, `MEDIA-PIPELINE.md`, `ADMIN.md`, `SECURITY.md`, `ROADMAP.md`, `OPEN-QUESTIONS.md`.
2. Look at the images in `reference/` (the home-page screenshot and the 16 numbered frames) so you know the intended look.
3. Before using Next.js, `motion`, OpenNext, Clerk or Drizzle APIs, read the docs for the **installed** versions. Your training data may be out of date.
4. Start with **Phase P0** in `ROADMAP.md`. Do not begin a phase until the previous phase's gates in `TESTING.md` pass.
5. Never invent client facts (names, awards, testimonials, stats, prices, social handles, brand colour). Use a visible `[PLACEHOLDER: …]` and add it to `OPEN-QUESTIONS.md`.
6. Every animation must have the reduced-motion, touch and low-power fallbacks defined in `MOTION.md` §3 and §7.
7. At the end of each phase: run the gates, update `OPEN-QUESTIONS.md`, commit, and summarise what changed and what is still open.

Begin with P0 and report back when its exit criteria are met.
