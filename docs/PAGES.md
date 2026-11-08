# PAGES.md: Sitemap & Page Specifications

Visual detail: [DESIGN.md](./DESIGN.md) §6 · Motion: [MOTION.md](./MOTION.md) §6 · Components: [COMPONENTS.md](./COMPONENTS.md) · Data: [DATA-MODEL.md](./DATA-MODEL.md).

---

## 1. Sitemap

```
/                      Home
/work                  Work index (collections)
/work/[slug]           Collection gallery
/archive               All published photos
/about                 About
/contact               Contact
/privacy               Privacy policy
/admin                 Photo dashboard (protected, noindex)
/admin/photos/[id]     Edit one photo (protected)
/admin/collections     Manage collections (protected)
/admin/settings        Site toggles (protected)
/sitemap.xml  /robots.txt  /manifest.webmanifest  /opengraph-image (dynamic)
```

`/pricing`, `/services`, `/blog`, `/shop`: **not built** (CLIENT-SPEC §3.2). `/portfolio` redirects 301 → `/work` (common search term).

Rendering: public pages are **statically generated + on-demand revalidated** (tag-based) when admin changes data. Admin and API are dynamic. See [ARCHITECTURE.md](./ARCHITECTURE.md) §5.

Navigation (global): `Home · Work (n) · Archive · About` + `Contact Me →`. Footer repeats + socials + legal.

---

## 2. Home `/`

| | |
|--|--|
| Goal | Make a strong first impression and push to Work/Contact |
| Pattern | P1 Floating Collage Hero → P3 statement → P5 selector → P7 collections → About teaser → P9 footer |
| Data | `photos.featured_home` (collage, ≥ 5), `collections` (selector), `site_settings` |
| Primary CTA | "View the work" → `/work` |
| Secondary CTA | Footer "LET'S TALK." → `/contact` |
| SEO | `<h1>` = headline; Person/ProfessionalService JSON-LD ([SEO.md](./SEO.md)) |

**Sections (in order; each hides itself with no data)**

1. **Collage hero**: see DESIGN §6.1 / MOTION §6.1. Headline `[SUGGESTED]` "Beautiful moments of beautiful people." CTA pill.
2. **Statement**: scroll-lit text (P3). Copy: about fallback bio or the aim line.
3. **Selected Work**: pinned selector (P5) over up to 8 `featured_home` photos *or* collections (config: `site_settings.home_selector_mode = 'photos' | 'collections'`, default `collections` when ≥ 2 exist).
4. **Cinematic collections** (P7), up to 4.
5. **About teaser**: portrait + 1 paragraph + `Read more →` (hidden until bio exists).
6. **Footer CTA**.

**States**

| State | Behaviour |
|-------|-----------|
| 0 published photos | Hero shows brand + headline over a plain `--bg`, CTA → `/contact`; sections 3-5 hidden. Never show an empty collage. |
| 1-4 featured | Single full-bleed hero image variant (no collage) |
| ≥ 5 featured | Full collage |

---

## 3. Work `/work`

| | |
|--|--|
| Goal | Let visitors choose a collection quickly |
| Pattern | Desktop: P5 selector (+ toggle to P6 list); mobile: card list |
| Data | Published collections with ≥ 1 published photo, cover photo, photo count |
| Interaction | Select → `View collection →` → `/work/[slug]` |
| Empty | "New work is on the way." + Contact link |

- Title "Work" with count superscript `(32)` = total published photos.
- Toggle `Selector | List | Grid` stored in `sessionStorage`; default Selector ≥ 1024, Grid below.
- Each collection exposes `cover_photo_id` (fallback: first photo).

## 4. Collection `/work/[slug]`

| | |
|--|--|
| Goal | Immerse in one body of work |
| Pattern | Header (mega title) + masonry + lightbox; optional Story mode (P7) |
| Data | collection + its published photos ordered by `sort_order` |
| Features | Lightbox, keyboard nav, deep-linkable photo (`?photo=<id>` opens lightbox), share link, "Next collection" footer |
| SEO | `CollectionPage` + `ImageObject` list JSON-LD; unique title/description |
| 404 | Unknown slug → 404; unpublished/empty collection → 404 |

Lightbox: `?photo=` is **replaceState** (no history spam on arrow keys), `Esc` closes and restores focus to the originating tile.

## 5. Archive `/archive`

All published photos, newest first. Sticky filter chips: `All` + one per collection. 24 per page; "Load more" (button, not infinite scroll only; accessible + SEO-friendly via `?page=`). Same lightbox. Heading `Archive` + count.

## 6. About `/about`

| | |
|--|--|
| Goal | Humanise and establish credibility, plainly |
| Pattern | P2 split-name hero (or single wordmark until name final) → scroll-lit bio → optional approach, stats (hidden) |
| Data | `site_settings.bio` (plain text paragraphs, edited in one textarea at `/admin/settings`, see [ADMIN.md](./ADMIN.md) §8), `featured_about` photos |
| Rule | Use client's bio **verbatim**. Fallback bio per CONTENT §3.3 |
| CTA | `Let's work together →` → `/contact` |

## 7. Contact `/contact`

| | |
|--|--|
| Goal | One-tap contact, three routes |
| Pattern | P9: giant CTA + form + portrait + `[Q][S][C]` |
| Routes | (1) **Send message**: server action → D1 `enquiries` (first) → Resend email; (2) **Chat on WhatsApp**: `wa.me/2348030812138?text=…` (URL-encoded prefill, opens new tab, `rel="noopener noreferrer"`); (3) **Email directly**: `mailto:` |
| Form fields | Name* · Email* · Phone · Type of session (select: Portrait · Studio · Other; `[SUGGESTED]`) · Message* |
| Validation | Zod shared schema; honeypot field; Cloudflare Turnstile (invisible) `[SUGGESTED]`; rate limit 5 / 10 min / IP |
| Success | Inline success state + "Chat on WhatsApp for a faster reply" |
| Failure | Row already saved; show friendly error with WhatsApp/email fallbacks |
| Privacy | One-line notice linking `/privacy` |

## 8. Privacy `/privacy`
Static long-form. Mentions: contact-form data (name, email, phone, message) stored to respond; cookieless analytics; Resend as email processor; Cloudflare as host; retention (`enquiries` deleted after 12 months `[SUGGESTED]`); contact email for requests.

## 9. Global states & utilities

| Item | Spec |
|------|------|
| 404 | DESIGN §6.9 |
| Error boundary | Friendly message, retry button, WhatsApp link |
| Loading | Skeleton blocks with blur-hash colours; no spinners for page content |
| Offline | Out of scope (no service worker in v1) |
| Cookie banner | **Not needed** while only cookieless analytics + strictly necessary Clerk session cookie (admin only) are used |
| Skip link | "Skip to content" first focusable element |
| `prefers-reduced-motion` | See [MOTION.md](./MOTION.md) §3, §7 |

## 10. Admin pages (summary; detail in [ADMIN.md](./ADMIN.md))

| Route | Function |
|-------|----------|
| `/admin` | Photo grid: upload, search, filter (collection/status), multi-select, reorder |
| `/admin/photos/[id]` | Edit title, alt, caption, collection, focal point, flags, status; replace file; delete |
| `/admin/collections` | CRUD collections, set cover, reorder |
| `/admin/settings` | Toggles (show stats/awards/testimonials), selector mode, headline text |

## 11. Route-level metadata matrix

| Route | Title template | Index? | JSON-LD |
|-------|---------------|--------|---------|
| `/` | `Zetona_E | Studio & Portrait Photographer in Benin City` | ✅ | ProfessionalService/Person + WebSite |
| `/work` | `Work | Zetona_E` | ✅ | CollectionPage |
| `/work/[slug]` | `{Collection} Portraits | Zetona_E` | ✅ | CollectionPage + ImageObject[] |
| `/archive` | `Archive | Zetona_E` | ✅ | |
| `/about` | `About | Zetona_E` | ✅ | Person |
| `/contact` | `Contact | Zetona_E` | ✅ | ContactPage |
| `/privacy` | `Privacy | Zetona_E` | ✅ (low priority) | |
| `/admin/**` | n/a | ❌ `noindex` + robots disallow | |
