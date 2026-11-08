# DEPLOYMENT.md: Cloudflare Setup, Environments & Handover

Related: [ARCHITECTURE.md](./ARCHITECTURE.md) §7 · [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) · [SECURITY.md](./SECURITY.md) · [SEO.md](./SEO.md)

> Commands and dashboard labels change over time. Treat steps as the **intent**; confirm against current Cloudflare, OpenNext, Clerk and Resend docs.

## 1. Environments

| Env | URL | Data | Purpose |
|-----|-----|------|---------|
| local | `localhost:3000` | local D1 (`--local`), R2 local emulation | development |
| preview | per-PR `*.workers.dev` | separate D1 + R2 (staging) | review & e2e |
| production | `https://<domain>` | production D1 + R2 | live |

Never share D1/R2 between preview and production.

## 2. One-time Cloudflare setup (production)

1. **Account & domain:** add the domain (Q6) to Cloudflare; switch nameservers; enable *Always HTTPS*, HSTS, TLS 1.2+.
2. **R2:** create `zetona-public` and `zetona-originals`. Attach custom domain `media.<domain>` to `zetona-public`. Keep `zetona-originals` with **public access disabled**. Create an **R2 API token** (object read/write on both buckets) → `R2_ACCESS_KEY_ID/SECRET`. Apply CORS ([MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) §5).
3. **Image Transformations:** enable for the zone (Images → Transformations) and allow the `media.<domain>` origin.
4. **D1:** `wrangler d1 create zetona-db`; add binding `DB` in `wrangler.jsonc`; `pnpm db:migrate:prod`.
5. **Workers:** deploy the OpenNext build; add route `<domain>/*` (and `www`) to the Worker; add R2 incremental-cache bucket binding.
6. **Cache rules:** cache everything on `media.<domain>`; bypass cache on `/admin*` and `/api/*`.
7. **WAF/Rate limiting:** rate-limit `POST /api/enquiries` (5 / 10 min / IP) and `/api/admin/*` (e.g. 120 / min).
8. **Turnstile:** create a widget (managed/invisible) for the domain.
9. **Cron Triggers:** daily (trash purge, orphan reaper, enquiry retention), weekly (backup export).
10. **Web Analytics:** enable for the zone.
11. **Email (Nodemailer):** verify the domain (SPF/DKIM DNS); `CONTACT_FROM_EMAIL = hello@<domain>` (or `onboarding@resend.dev` until DNS is done); `CONTACT_TO_EMAIL = Osakpolorobazee01@gmail.com`.
12. **Clerk:** create an app, restrict sign-up (allowlist / invitation-only), add the production domain, copy keys.

## 3. Environment variables

| Variable | Scope | Where from |
|----------|-------|-----------|
| `NEXT_PUBLIC_SITE_URL` | public | final URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | public | Clerk |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Turnstile |
| `CLERK_SECRET_KEY` | secret | Clerk |
| `ADMIN_ALLOWLIST` | secret | `Osakpolorobazee01@gmail.com` (Q16) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | secret | R2 token |
| `R2_PUBLIC_BASE_URL` | var | `https://media.<domain>` |
| `R2_BUCKET_PUBLIC` / `R2_BUCKET_ORIGINALS` | var | bucket names |
| `RESEND_API_KEY` | secret | Resend |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | var | see above |
| `TURNSTILE_SECRET_KEY` | secret | Turnstile |
| `IMAGE_STRATEGY` | var | `transform` \| `variants` |
| `IP_HASH_SALT` | secret | random 32 bytes |

Provide `.env.example` with every key, no values. Secrets set via `wrangler secret put` / dashboard, **never committed**.

## 4. CI/CD

- GitHub → Actions: lint/typecheck/test/build/e2e/Lighthouse ([TESTING.md](./TESTING.md) §10).
- `main` → auto-deploy to **preview**; production deploy is a **manual approval** (tag `v*` or `workflow_dispatch`).
- Migrations run **before** the new Worker version goes live; they must be backward compatible with the previous version.
- Rollback: redeploy the previous Worker version from the dashboard/CLI; D1 Time Travel for data.

## 5. Launch checklist

**Content & brand**
- [ ] Brand name styling confirmed (Q1), brand blue confirmed (Q4), logo/wordmark final
- [ ] ≥ 5 featured photos + ≥ 1 published collection with real alt text
- [ ] About bio from client (Q2); contact details verified; WhatsApp tested from a real phone (Q3)
- [ ] Socials added only if confirmed (Q5)
- [ ] Hidden sections still hidden unless real data exists (Q8)

**Technical**
- [ ] All phase gates green; Lighthouse budgets met on production URL
- [ ] CORS reduced to production origin; `localhost`/staging removed
- [ ] `r2.dev` public URLs disabled; originals bucket private (verify with an unauthenticated GET)
- [ ] `robots.txt` allows indexing; `/admin` noindex
- [ ] Sitemap submitted to Google Search Console + Bing
- [ ] Email deliverability test (SPF/DKIM pass), form → inbox in < 1 min
- [ ] Error pages, 404, favicon, OG image, manifest in place
- [ ] Backups verified (restore dry-run)
- [ ] Privacy page reviewed (Q12)

**Handover**
- [ ] Owner can sign in to `/admin`, upload, edit, publish, delete, restore (live walkthrough)
- [ ] Owner has: a one-page "How to add photos" guide (§7), developer contact, domain/Cloudflare ownership plan (Q17)

## 6. Post-launch (first 30 days)

Week 1: verify Search Console indexing, check CWV in field data, fix reported issues. Weeks 2-4: add Google Business Profile, collect reviews, review analytics, adjust photo order using the most-opened photos.

## 7. Owner's one-page guide (ship as `/admin` help dialog + PDF)

1. Sign in at `/admin` with your Google account.
2. **Add photos** → choose from your phone/laptop → wait for the green ticks.
3. Tap a photo → **describe it** in the *Alt text* box (one clear sentence) → choose a **collection** → tap the face to set the **focal point**.
4. **Publish**. Tap **View on site** to check.
5. Drag to reorder. Star ★ up to 12 photos to appear on the **home page collage**.
6. **Delete** moves a photo to Trash for 30 days. You can restore it.
7. Messages from the contact form appear under **Messages** (and in your email).

## 8. Handover & ownership (Q17)

- Preferred: Cloudflare account **owned by the client**, developer added as a member; GitHub repo transferred or client added as owner; Clerk/Resend/Turnstile on the client's accounts.
- If hosted initially on the developer's account: documented migration (export D1, copy R2 buckets with `rclone`, re-point DNS, rotate all secrets).
- Provide: architecture diagram, env var list, runbook (§9), credentials in a password manager share.
- Monthly visibility note (template): *"This month: X visitors, top collection Y, Z contact clicks (WhatsApp/email/form). Suggestions: …"*

## 9. Runbook

| Situation | Action |
|-----------|--------|
| Photos not showing | Check `media.<domain>` DNS/cert, R2 public domain, CORS, loader strategy; temporarily set `IMAGE_STRATEGY=variants` |
| Transformations over quota | Switch to `variants`; or raise plan |
| Admin can't sign in | Check `ADMIN_ALLOWLIST`, Clerk domain/keys; use Cloudflare Access fallback |
| Contact emails missing | Check Resend logs/DNS; enquiries are in `/admin/enquiries` with `email_status` |
| Bad data after mistake | D1 Time Travel restore; restore photos from Trash |
| Suspected compromise | Rotate secrets ([SECURITY.md](./SECURITY.md) §9), review `admin_audit` |
| Restore from backup | Re-create D1, `wrangler d1 execute` with JSON import script (`scripts/restore.ts`), verify keys exist in R2 |
