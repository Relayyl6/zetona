# MEDIA-PIPELINE.md: Cloudflare R2 Storage, Upload & Delivery

Related: [DATA-MODEL.md](./DATA-MODEL.md) · [ADMIN.md](./ADMIN.md) · [SECURITY.md](./SECURITY.md) · [ACCESSIBILITY-PERFORMANCE.md](./ACCESSIBILITY-PERFORMANCE.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)

Goal: the owner uploads photos from a phone or laptop; visitors receive sharp, fast, correctly
sized images, with originals kept safe and private.

---

## 1. Buckets

| Bucket | Visibility | Contains | Served via |
|--------|-----------|----------|-----------|
| `zetona-public` | Public through custom domain `media.<domain>` (R2 public access via custom domain, **not** the `r2.dev` URL in production) | **Display** images (JPEG, long edge ≤ 2400 px, EXIF stripped), optional pre-generated variants | Cloudflare CDN + Image Transformations |
| `zetona-originals` | **Private**, no public access | Original files as uploaded (full resolution, EXIF intact) | Never public. Admin-only signed download |
| (prefix) `backups/` in originals | Private | Weekly JSON export | – |

> Why two buckets: R2's public access is per-bucket. Keeping originals private prevents leaking
> GPS/EXIF metadata and unreleased/high-res work, and makes "protect my images" credible.

## 2. Key scheme (immutable)

```
public:     photos/{photoId}/{contentHash8}-display.jpg
            photos/{photoId}/{contentHash8}-w{480|960|1600|2400}.jpg   # only with IMAGE_STRATEGY=variants
originals:  photos/{photoId}/{originalFilenameSanitised}
```
- `contentHash8` = first 8 hex chars of SHA-256 of the display file → **immutable URLs**, cache `max-age=31536000, immutable`.
- Replacing a photo writes **new keys**; old keys are deleted only after the DB row is updated.
- Filenames are sanitised (`[a-z0-9._-]`, lowercased, ≤ 80 chars). Never trust client filenames for keys beyond that.

## 3. Delivery strategies (`IMAGE_STRATEGY`)

### Strategy A: `transform` (default)
Use **Cloudflare Image Transformations** on the zone that serves `media.<domain>`:

```
https://<domain>/cdn-cgi/image/width=960,quality=82,format=auto,fit=scale-down/https://media.<domain>/photos/{id}/{hash}-display.jpg
```
- `format=auto` → AVIF/WebP/JPEG by `Accept` header.
- Custom Next.js loader (`lib/storage/loader.ts`):
```ts
export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const q = quality ?? 82;
  return `/cdn-cgi/image/width=${width},quality=${q},format=auto,fit=scale-down/${src}`;
}
```
  (`src` = absolute public media URL built from `displayKey`; verify path form against current Cloudflare docs.)
- Prerequisite: Transformations enabled for the zone; note the free monthly allotment of unique transformations (confirm current limits). Unique `(url, width, quality, format)` combos count once; limit widths to the `deviceSizes`/`imageSizes` set in `next.config.ts` to keep the count low.
- Local dev: loader falls back to the raw URL (transformations unavailable on localhost).

### Strategy B: `variants` (fallback if transformations unavailable/over quota)
The browser pre-generates **JPEG** variants (canvas JPEG encoding is universal) at 480/960/1600/2400 px wide, uploads them with the display image, and the loader picks the nearest variant ≥ requested width. More upload work, zero runtime dependency. Switch with an env var; no schema change (variant keys are derivable from `displayKey`).

## 4. Upload flow (admin)

```
┌ browser ─────────────────────────────────────────────────────────────┐
│ 1 select/drag files (≤ 20, JPEG/PNG/WebP; HEIC optional via lazy lib) │
│ 2 validate type + size; read original bytes                           │
│ 3 decode → createImageBitmap(file, {imageOrientation:'from-image'})   │
│ 4 produce display JPEG (long edge ≤ 2400, q .88; canvas re-encode     │
│   strips EXIF; orientation baked in)                                  │
│ 5 compute: width, height, thumbhash, dominantColor, SHA-256 → hash8   │
│ 6 POST /api/admin/uploads/presign { files:[{name,contentType,…}] }    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ (auth + Zod + quota check)
                       returns [{photoId, displayPut, originalPut}]  (presigned PUT, 10 min expiry, Content-Type & Content-Length locked)
┌ browser ──────────────────────▼──────────────────────────────────────┐
│ 7 PUT display → zetona-public ; PUT original → zetona-originals       │
│   (parallel 3, XHR for progress, retry ×3 with backoff)               │
│ 8 POST /api/admin/photos { photoId, keys, dims, thumbhash, … }        │
│   → server HEADs both objects to **verify they exist and sizes match**│
│   → inserts photos row (status=draft) → audit → revalidateTag         │
│ 9 UI shows draft tile → owner adds alt text/collection → Publish      │
└──────────────────────────────────────────────────────────────────────┘
```

**Server verification (step 8)** is mandatory: never trust the client that an upload happened. A reaper Cron deletes R2 objects under `photos/*` that have **no matching DB row after 24 h** (orphans from aborted uploads).

**Limits**

| Limit | Value |
|-------|-------|
| Files per batch | 20 |
| Original max | 40 MB |
| Display max | 8 MB (after client resize it is typically 0.4-1.5 MB) |
| Accepted types | `image/jpeg`, `image/png`, `image/webp` (+ HEIC converted client-side, optional) |
| Min dimension | 1200 px long edge (warn below; allow) |
| Presign TTL | 10 min |
| Total library soft cap | 10 GB (R2 free tier is 10 GB-month; warn at 80%) |

**Mobile-first UX:** big "Add photos" button opens the camera roll; progress per file; uploads continue if the tab is backgrounded briefly; failed items are retryable individually.

## 5. CORS (R2)

Both buckets need CORS for the admin origin only:

```json
[{
  "AllowedOrigins": ["https://<domain>", "https://<staging>.workers.dev", "http://localhost:3000"],
  "AllowedMethods": ["PUT", "GET", "HEAD"],
  "AllowedHeaders": ["Content-Type", "Content-Length", "x-amz-*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}]
```
Remove `localhost` and staging origins from the production policy at launch.

## 6. Read path & caching

- Public GETs hit Cloudflare CDN. Cache rule: cache everything on `media.<domain>`, edge TTL 1 year (keys are immutable).
- `Cache-Control: public, max-age=31536000, immutable` is set on PUT (`Cache-Control` header included in the presigned headers).
- Pages never embed raw bucket URLs, only `displayKey`s resolved through `lib/storage/keys.ts`.

## 7. Delete & replace

| Action | Behaviour |
|--------|-----------|
| **Delete (UI "Delete")** | Row → `status='trashed'`, `trashed_at=now`. Disappears from site immediately (`revalidateTag`). Shown in "Trash" with **Restore**. |
| **Permanent delete** | From Trash, or auto after 30 days: remove R2 objects (public + original + variants), delete row, audit entry. If R2 delete fails, keep the row as `trashed` and retry on next cron. |
| **Replace file** | Run upload flow for the same `photoId` with new `contentHash8`; update row keys; then delete old keys. Alt/collection/sort preserved. |
| **Collection delete** | Photos become uncollected (see invariant 3). |

## 8. Image processing details (client, `lib/image/process.ts`)

- `createImageBitmap` with `imageOrientation: "from-image"` to honour EXIF rotation.
- Resize with `OffscreenCanvas` in a **Web Worker** to avoid UI jank; step-down halving for quality on large downscales (avoid one-shot 6000→2400 aliasing).
- Colour: assume sRGB; if the file has a wide-gamut profile, convert via canvas colour-space (`{colorSpace: "srgb"}`) so colours don't shift in browsers.
- `thumbhash` generated from a 100 px-wide downsample; `dominantColor` via a 1×1 downsample average.
- HEIC (iPhone): lazy-load a HEIC decoder only when a `.heic/.heif` is selected; convert to JPEG before step 4. Optional in v1; if skipped, show "Please export as JPEG/PNG/WebP" guidance.
- Never upscale. If original < 2400 px, display = original size.

## 9. Responsive sizes & `sizes` guidance

`next.config.ts` → `images.deviceSizes: [480, 768, 1024, 1440, 1920, 2400]`, `imageSizes: [96, 160, 256, 384]`, `formats: ["image/avif","image/webp"]` (ignored by custom loader but kept for dev).

| Context | `sizes` |
|---------|---------|
| Collage card (large) | `(min-width:1024px) 28vw, 60vw` |
| Collage card (small) | `(min-width:1024px) 14vw, 36vw` |
| Selector main image | `(min-width:1024px) 34vw, 86vw` |
| Masonry tile | `(min-width:1024px) 32vw, (min-width:480px) 48vw, 100vw` |
| Lightbox | `100vw` (capped at 2400) |
| Filmstrip thumb | `96px` |
| Backdrop | tiny thumbnail only |

## 10. Cost & quota watch (free-tier friendly)

| Resource | Why watch | Mitigation |
|----------|-----------|-----------|
| R2 storage | Originals are large | Warn at 80% of the plan; cap original at 40 MB |
| R2 Class A/B ops | Uploads, reads | CDN absorbs reads; immutable keys |
| Image Transformations unique count | Bills per unique transform | Fixed width set; `fit=scale-down`; consider Strategy B |
| D1 reads/writes | Low | Static rendering with tag revalidation |
| Resend emails | Contact form only | Rate limit + Turnstile |

## 11. Failure modes

| Failure | Handling |
|---------|----------|
| Presign endpoint 401/403 | Redirect to sign-in; toast |
| PUT fails mid-way | Retry ×3; then mark tile "Failed, tap to retry"; orphan reaper handles leftovers |
| Verify step finds missing object | Reject create; tell the user; no DB row |
| Transformation errors (e.g. 9xxx) | Loader falls back to the raw display URL (`onError` swap) |
| R2 outage | Public pages still render from cache; admin shows banner |

## 12. Acceptance

- [ ] Upload 10 phone JPEGs (8-12 MB each) on a throttled 3G/4G profile; all land, tiles appear, none corrupt.
- [ ] `exiftool` on a public display file shows **no GPS**; original retains it.
- [ ] Public URL of an original returns 403/404.
- [ ] Replace and delete leave **no orphans** (script lists R2 keys vs DB).
- [ ] Switching `IMAGE_STRATEGY` renders correctly without code change.
