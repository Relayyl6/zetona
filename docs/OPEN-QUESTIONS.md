# OPEN-QUESTIONS.md

Every unconfirmed item. When resolved, move to the **Resolved** table with the date and source.
Related: [AGENTS.md](./AGENTS.md) §1, [CONTENT.md](./CONTENT.md).

## Open

| # | Question | Why it matters | Blocks | Safe default (until answered) |
|---|----------|----------------|--------|-------------------------------|
| Q1 | What name should appear: **Zetona_E** (stylised how: `Zetona_E`, `ZETONA E`, `Zetona E`?) and what is the photographer's **legal/full name**? The email local-part is `Osakpolorobazee01`, which may be his real name. | Logo, hero name treatment, schema.org `Person`, copyright line | P1, P2 | Use `Zetona_E` as written; full name = placeholder |
| Q2 | Biography text for About (2–3 short paragraphs)? | About page | P3 | Short fallback bio built only from the client's chat lines |
| Q3 | Is `08030812138` active on **WhatsApp**? Preferred contact order? | WhatsApp button | P4 | Show WhatsApp + email; hide nothing |
| Q4 | Exact **brand blue** (hex) / logo / any existing brand assets? | Whole palette | P1 | `[SUGGESTED]` cobalt in DESIGN.md §3.1 |
| Q5 | Social handles (Instagram, Facebook, TikTok, X, others)? Is `Zetona_E` his Instagram handle? | Social links, sameAs schema | P4 | None rendered |
| Q6 | Domain name (e.g. zetona-e.com)? Does he own one? | Canonical URLs, email, R2 CDN subdomain | P7 | `*.workers.dev` staging |
| Q7 | Approve home headline "Beautiful moments of beautiful people."? | Hero | P1 | Use it, marked suggested |
| Q8 | Does he want **stats / awards / testimonials** sections? If yes, supply the real numbers, names and quotes. | Components built but hidden | P3 | Hidden |
| Q9 | "Available to travel"? Service area beyond Benin City? | Contact + local SEO | P4 | Omit the claim |
| Q10 | Which **collections** does he want (portraits, studio, editorial, beauty, couples, maternity, events…)? | Work navigation | P2 | Start empty; seed two in dev |
| Q11 | How many photos are ready and in what format/size (RAW/JPEG/dimensions)? Does he have a **watermark** preference? | Upload limits, variant sizes | P5 | 25 MB per file, JPEG/PNG/WebP/HEIC |
| Q12 | Privacy policy review and whether he wants cookie-free analytics only | Legal page, analytics | P7 | Cookieless analytics only |
| Q13 | Does he want **right-click/download protection**? (Note: only a deterrent, see SECURITY §8.) | Gallery UX | P2 | Light deterrent off by default |
| Q14 | Does he want a **Services/pricing** page later? Does he teach classes/sell prints? | Scope | P8+ | Not built |
| Q15 | Preferred headline typography: **editorial serif** (as in the Rabah home) or **tall condensed sans** (as in the Kristin recording)? | Brand feel | P1 | Serif display + condensed sans accents per DESIGN.md |
| Q16 | Admin sign-in method he prefers (Google account, email magic link)? Which email is the single admin? | Auth | P6 | Google via Clerk, allowlist = Osakpolorobazee01@gmail.com |
| Q17 | Will he hand over a Cloudflare account, or should the developer host on theirs and transfer later? | Ownership/handover | P7 | Developer account, documented transfer in DEPLOYMENT §8 |

## Resolved

| # | Resolution | Date | Source |
|---|-----------|------|--------|
| - | Accent colour is blue | 2026-11-05 | Client chat |
| - | Storage = Cloudflare; full-stack = Next.js; admin = picture CRUD only | 2026-11-07 | Developer |
| - | Home page follows the Rabah collage screenshot | 2026-11-07 | Developer (client liked it) |
