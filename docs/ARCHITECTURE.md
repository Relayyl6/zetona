# ARCHITECTURE.md

Related: [AGENTS.md](./AGENTS.md) · [DATA-MODEL.md](./DATA-MODEL.md) · [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) · [DECISIONS.md](./DECISIONS.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)

## 1. System overview

```
                       ┌───────────────────────────────────────────────┐
 Visitor (phone/PC) ──▶│  Cloudflare edge (DNS, TLS, WAF, cache)        │
                       │                                                │
                       │  ┌──────────────────────────────────────────┐  │
                       │  │ Worker: Next.js via OpenNext             │  │
                       │  │  • public pages (static + revalidated)   │  │
                       │  │  • /api/* route handlers, server actions │  │
                       │  │  • /admin (Clerk-protected)              │  │
                       │  └────┬───────────┬───────────┬─────────────┘  │
                       │       │ D1 binding│ R2 binding│ secrets        │
                       │  ┌────▼───┐  ┌────▼─────┐  ┌──▼────────────┐   │
                       │  │  D1    │  │ R2 public│  │ Resend / Clerk│   │
                       │  │ SQLite │  │ R2 private│ │ (HTTPS)       │   │
                       │  └────────┘  └──────────┘  └───────────────┘   │
                       │   media.<domain> ──▶ R2 public (+ Image Transformations) │
                       └───────────────────────────────────────────────┘
 Admin (owner) ── browser ──presigned PUT──▶ R2 (direct upload, bypasses Worker body limits)
```

## 2. Technology decisions (summary; reasons in DECISIONS.md)

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router + TS strict |
| Runtime/host | Cloudflare Workers via `@opennextjs/cloudflare` (OpenNext) |
| DB | D1 + Drizzle ORM + drizzle-kit migrations |
| Object storage | R2: `zetona-public` (display variants), `zetona-originals` (private) |
| CDN/Images | Cloudflare CDN + Image Transformations (`format=auto`) |
| Auth | Clerk, single allowlisted admin email |
| Email | Resend |
| Bot protection | Cloudflare Turnstile + rate limit |
| Animation | Motion for React (`motion/react`) + Lenis |
| Styling | Tailwind v4 + CSS variables |
| Forms | React Hook Form + Zod |
| Tests | Vitest, Playwright, axe, Lighthouse CI |
| Analytics | Cloudflare Web Analytics (cookieless) |

> **Fallback hosting path:** if OpenNext/Workers limitations block a needed Next.js feature,
> deploy to Vercel and keep R2 (S3 API) + Neon/Turso for data. Only `lib/db` and `lib/storage` adapters change. Keep both behind interfaces (§4).

## 3. Repository structure

```
/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx                    # Home
│  │  ├─ work/page.tsx
│  │  ├─ work/[slug]/page.tsx
│  │  ├─ archive/page.tsx
│  │  ├─ about/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ privacy/page.tsx
│  │  └─ layout.tsx                  # Header/Footer/transition
│  ├─ admin/
│  │  ├─ layout.tsx                  # auth gate + admin shell
│  │  ├─ page.tsx                    # photo grid
│  │  ├─ photos/[id]/page.tsx
│  │  ├─ collections/page.tsx
│  │  └─ settings/page.tsx
│  ├─ api/
│  │  ├─ admin/uploads/presign/route.ts
│  │  ├─ admin/photos/route.ts       # POST create / GET list
│  │  ├─ admin/photos/[id]/route.ts  # PATCH / DELETE
│  │  ├─ admin/photos/reorder/route.ts
│  │  ├─ admin/collections/...       
│  │  └─ enquiries/route.ts          # (or server action)
│  ├─ template.tsx                   # page-enter animation
│  ├─ sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx
│  ├─ not-found.tsx  error.tsx  globals.css  layout.tsx  providers.tsx
├─ components/
│  ├─ motion/  layout/  home/  work/  about/  contact/  ui/  admin/
├─ lib/
│  ├─ site-config.ts  design-tokens.ts  collage-presets.ts  whatsapp.ts
│  ├─ motion/ (tokens.ts, variants.ts, hooks.ts)
│  ├─ db/ (schema.ts, client.ts, queries.ts, seed.ts)
│  ├─ storage/ (r2.ts, presign.ts, keys.ts, loader.ts)
│  ├─ auth/ (admin.ts: requireAdmin())
│  ├─ validators/ (photo.ts, collection.ts, enquiry.ts, settings.ts)
│  ├─ email/ (resend.ts, templates.tsx)
│  ├─ image/ (process.ts: client-side resize/thumbhash)
│  └─ seo/ (jsonld.ts, metadata.ts)
├─ drizzle/                          # SQL migrations
├─ public/ (dev-placeholders/, icons)
├─ tests/ (unit/, e2e/, fixtures/)
├─ docs/ (this suite)                # or repo root
├─ open-next.config.ts  wrangler.jsonc  next.config.ts  drizzle.config.ts
├─ .env.example  AGENTS.md  README.md …
```

## 4. Key interfaces (ports & adapters)

```ts
// lib/db/queries.ts: all reads return DTOs, not raw rows
export interface PhotoRepo {
  listPublished(opts?: { collectionId?: string; page?: number; pageSize?: number }): Promise<PhotoDTO[]>;
  featuredHome(limit: number): Promise<PhotoDTO[]>;
  getById(id: string): Promise<PhotoDTO | null>;
  create(input: CreatePhoto): Promise<PhotoDTO>;
  update(id: string, input: UpdatePhoto): Promise<PhotoDTO>;
  reorder(ids: string[]): Promise<void>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>; // also removes R2 objects via storage port
}

// lib/storage/r2.ts
export interface MediaStorage {
  presignPut(key: string, contentType: string, bytes: number, bucket: "public" | "originals"): Promise<{ url: string; headers: Record<string,string> }>;
  delete(keys: { bucket: "public"|"originals"; key: string }[]): Promise<void>;
  publicUrl(key: string): string;
}
```

Reasoning: swapping D1 → Postgres or R2 → another S3-compatible store touches only adapters.

## 5. Rendering & caching strategy

| Route | Strategy | Revalidation |
|-------|----------|--------------|
| `/`, `/work`, `/work/[slug]`, `/archive`, `/about` | Static (SSG) with tagged data cache | `revalidateTag('photos' \| 'collections' \| 'settings')` from admin mutations |
| `/contact`, `/privacy` | Static; form posts via server action/route | n/a |
| `/admin/**`, `/api/**` | Dynamic, `no-store` | n/a |
| Images | CDN-cached, immutable URLs (`…/{id}/{hash}.jpg`) | New upload = new key; never mutate |

- Cache tags: `photos`, `collections`, `settings`, `collection:{slug}`.
- OpenNext needs an incremental-cache backend on Workers (R2 bucket binding, e.g. `NEXT_INC_CACHE_R2_BUCKET`) and a tag-cache strategy; configure per the installed OpenNext docs.
- `generateStaticParams` for `/work/[slug]`; `dynamicParams = true` so new collections work without redeploy.
- Pages that depend on `photos` data must degrade to **empty states**, never crash, when D1 is empty (fresh install).

## 6. Data flow summaries

**Public read:** page (server component) → `PhotoRepo.listPublished()` → D1 → DTO (with `src` keys) → `<Photo>` → `next/image` custom loader → `media.<domain>/cdn-cgi/image/...`.

**Admin upload:** browser processes image → `POST /api/admin/uploads/presign` (auth + validate) → PUT to R2 (display + original) → `POST /api/admin/photos` (create `draft` row) → edit → publish → `revalidateTag`. Details: [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) §4.

**Enquiry:** form → Turnstile verify → Zod parse → **insert `enquiries`** → send Resend email → update `email_status` → respond. Failure of email returns success to the user *if the row saved*, flags `email_status='failed'` and surfaces it in admin.

## 7. Environment & bindings

| Name | Where | Secret? |
|------|-------|---------|
| `DB` (D1 binding) | wrangler | – |
| `MEDIA_PUBLIC` / `MEDIA_ORIGINALS` (R2 bindings) | wrangler | – |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | secrets (for presign) | ✅ |
| `R2_PUBLIC_BASE_URL` | var | – |
| `CLERK_SECRET_KEY` · `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | secret · public | ✅ · – |
| `ADMIN_ALLOWLIST` (comma emails) | secret | ✅ |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | secrets/vars | ✅ |
| `TURNSTILE_SECRET_KEY` · `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | secret · public | ✅ · – |
| `NEXT_PUBLIC_SITE_URL` | var | – |
| `IMAGE_STRATEGY` = `transform` \| `variants` | var | – |
Full table with how to obtain each: [DEPLOYMENT.md](./DEPLOYMENT.md) §3.

## 8. Error handling & observability

- Server errors logged via `console.error` with structured JSON (`{route, userId?, code}`); Workers Logs enabled.
- Optional Sentry (free tier) behind a feature flag; never log personal data from enquiries.
- Admin mutation errors return typed `{ ok:false, code, message }` and are surfaced in toasts.
- Health endpoint `/api/health` (checks D1 `select 1`), unauthenticated, no sensitive info.

## 9. Constraints to remember

- Workers request body limits (~100 MB on free/paid plan caps vary) → images **never** pass through the Worker; direct-to-R2 presigned PUT.
- Workers CPU/time limits → no server-side image processing; do it in the browser or via Cloudflare Images transformations.
- No Node-only APIs in route handlers unless OpenNext's Node compat is confirmed for the call.
- D1 is SQLite: no concurrent heavy writes; the single-admin workload is fine.
