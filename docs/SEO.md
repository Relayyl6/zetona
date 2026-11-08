# SEO.md: Visibility Plan

Visibility is the client's **#1 stated goal**. This doc covers on-site SEO; off-site actions are in §9.
Related: [PAGES.md](./PAGES.md) §11 · [CONTENT.md](./CONTENT.md) · [ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md)

---

## 1. Targets (honest expectations)

Primary: **brand queries** ("Zetona_E photography") and **local intent** ("portrait photographer Benin City", "studio photographer Benin City", "photo studio Benin City"). Ranking depends heavily on off-site signals (Google Business Profile, links, Instagram); the site's job is to be crawlable, fast, unambiguous and rich.

## 2. Metadata (Next.js Metadata API)

- `metadataBase = NEXT_PUBLIC_SITE_URL`; canonical per page; `title.template = "%s | Zetona_E"`.
- Unique `<title>` (≤ 60 chars) and `description` (≤ 155) per route; collection pages use collection description or a templated fallback: "{Title} portraits by Zetona_E, studio and portrait photographer in Benin City."
- `openGraph` + `twitter: summary_large_image`; **dynamic OG image** per collection (`opengraph-image.tsx`, using the cover photo + wordmark) and a default brand OG image 1200×630.
- `robots`: index/follow public routes; `noindex` for `/admin`, `/api`.
- `<html lang="en-NG">` (fallback `en`), `hreflang` not needed (single language).
- Theme colour, manifest, favicons (SVG + 32 px + 180 px apple-touch), all in the brand blue/black.

## 3. Structured data (JSON-LD; helpers in `lib/seo/jsonld.ts`)

```jsonc
// Home (inject once)
{
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "Photographer"],     // LocalBusiness subtype
  "name": "Zetona_E",
  "description": "Studio and portrait photographer in Benin City, Nigeria.",
  "url": "https://<domain>",
  "image": "https://<domain>/opengraph-image",
  "email": "Osakpolorobazee01@gmail.com",
  "telephone": "+2348030812138",
  "address": { "@type": "PostalAddress", "addressLocality": "Benin City", "addressCountry": "NG" },
  "areaServed": "Benin City",
  "sameAs": [ /* only confirmed social URLs, omit key if none */ ]
}
```
- Add street address / `geo` / `openingHours` / `priceRange` **only if the client supplies them** (do not invent).
- Collection pages: `CollectionPage` with `hasPart` → `ImageObject[]` (`contentUrl`, `thumbnailUrl`, `name`, `caption`, `creator`, `copyrightHolder`, `license` page `/privacy` or `/about`).
- `BreadcrumbList` on collection pages.
- Validate with Google Rich Results Test / Schema validator in CI (JSON well-formedness test at minimum).

## 4. Image SEO (a portfolio's main asset)

- **Descriptive `alt`** (enforced to publish) and meaningful filenames in R2 keys where possible (`…/{id}-{slug-from-title}.jpg`: add a slug segment if the title exists).
- **Image sitemap** entries inside `sitemap.xml` (use `images` extension) for published photos, grouped by collection.
- Real `<img>` elements with `srcset`/`sizes` (via next/image), not CSS backgrounds.
- Avoid lazy-loading the LCP image; lazy-load the rest.
- Archive page gives crawlers a flat, paginated index of every image (`?page=` links are real anchors).
- Do **not** block `media.<domain>` in robots.

## 5. Sitemaps & robots

- `app/sitemap.ts`: `/`, `/work`, each published `/work/[slug]`, `/archive` (+ pages), `/about`, `/contact`, `/privacy`; `lastModified` from DB.
- `app/robots.ts`: allow all, disallow `/admin`, `/api`; point to sitemap.
- Submit the sitemap in Google Search Console and Bing Webmaster Tools (see §9).

## 6. Information architecture for SEO

- **One H1 per page.** Home H1 = the headline; collection H1 = collection title; About H1 = name.
- Collection intro paragraph (≥ 40 words, written by the client or helped) gives text for ranking; the admin shows a gentle hint when a collection has no description.
- Internal links: Home → Work → Collections → Archive; footer repeats; "Next collection →" links; breadcrumbs.
- Clean slugs: `/work/portraits`, never IDs.
- Redirects: `/portfolio` → `/work`; trailing-slash normalised; `www` → apex (or reverse), single canonical host.

## 7. Performance as SEO

Core Web Vitals (mobile) targets: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1**. See [ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md). The animated home page must keep the LCP image unblocked by motion.

## 8. Analytics (visibility feedback loop for the client)

- Cloudflare Web Analytics (cookieless) enabled on the zone; or Plausible if the client wants a nicer dashboard.
- Track custom events (privacy-safe, no PII): `cta_whatsapp_click`, `cta_email_click`, `form_submit`, `collection_view`, `photo_open`.
- Monthly one-paragraph summary template for the client in [DEPLOYMENT.md](./DEPLOYMENT.md) §8.

## 9. Off-site visibility checklist (hand to the client; biggest wins for a local photographer)

1. **Google Business Profile** (service-area or studio) with category *Photographer* / *Portrait studio*, photos, phone, link to the site.
2. Instagram bio link → the site; consistent name/handle everywhere (`Zetona_E`).
3. WhatsApp Business profile with catalogue/links.
4. Submit site to **Google Search Console** + **Bing Webmaster**; verify domain via DNS.
5. Listings: Facebook page, Pinterest boards pointing to collection pages, relevant local directories.
6. Ask satisfied clients for Google reviews (and, **with their consent**, testimonials for the site).
7. Share individual collection URLs (each has its own OG card) rather than just the homepage.
8. Use the same location phrase ("Benin City") consistently in bio lines.

## 10. Acceptance

- [ ] Every public route has unique title/description/canonical; verified by a test that crawls the sitemap.
- [ ] JSON-LD parses and contains no empty or invented fields.
- [ ] Image sitemap lists all published photos with alt/title.
- [ ] Lighthouse SEO = 100 on Home, Work, a collection, About, Contact.
- [ ] `/admin` and `/api` are `noindex`/disallowed.
- [ ] Social share preview (OG) renders for Home and a collection.
