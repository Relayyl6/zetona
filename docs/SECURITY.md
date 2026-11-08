# SECURITY.md

Small attack surface by design: one public form, one admin, direct-to-R2 uploads. Related: [ADMIN.md](./ADMIN.md) · [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) · [DATA-MODEL.md](./DATA-MODEL.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 1. Threat model (short)

| Asset | Threat | Control |
|-------|--------|---------|
| Admin access | Credential theft, unauthorised sign-in | Clerk (Google/passkey/MFA), **single-email allowlist**, server-side `requireAdmin()` on every mutation, optional Cloudflare Access |
| Photo library | Malicious upload, storage abuse, deletion | Admin-only presign, type/size allow-list, server verification, Trash (30 days), backups |
| Originals | Public leak of full-res/EXIF | Private bucket; display copy stripped of EXIF |
| Contact form | Spam, injection, email abuse | Zod, honeypot, Turnstile, rate limit, plain-text email rendering, header injection prevention |
| Visitor privacy | Tracking | Cookieless analytics; no third-party scripts beyond necessary |
| Secrets | Leakage | Secrets only in Cloudflare secrets/`.env.local`; never `NEXT_PUBLIC_` (except publishable keys) |
| Availability | Bot traffic | Cloudflare WAF, caching, rate limits |

## 2. Authentication & authorisation

- `lib/auth/admin.ts → requireAdmin()` returns `{ email }` or throws `401/403`. Called at the top of **every** `/api/admin/*` handler, server action and admin page.
- Compare emails case-insensitively against `ADMIN_ALLOWLIST` (env, comma-separated). Fail closed if the env var is missing/empty.
- Require **verified** email from the identity provider.
- Mutations check the `Origin`/`Sec-Fetch-Site` headers (same-origin only). Cookies: `Secure; HttpOnly; SameSite=Lax`.
- No admin features exposed via public routes or query flags.

## 3. Upload hardening

1. Server **never accepts file bytes**; it only issues presigned PUTs.
2. Presign constrains: object key (server-generated), `Content-Type` ∈ allow-list, `Content-Length` ≤ limit, TTL 10 min, single object.
3. After upload the server `HEAD`s the objects: verifies existence, size within ±0 of declared, `Content-Type` matches.
4. Display image is **re-encoded in the browser** (canvas) → polyglot/embedded payloads in originals never reach the public bucket. Originals are private and only downloaded by the admin as attachments (`Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`).
5. Per-session quota: ≤ 200 presigns/hour; total library soft cap enforced at presign.
6. Orphan reaper (Cron) deletes unreferenced objects after 24 h.
7. SVG uploads **not accepted** (script risk).

## 4. Public form (`POST /api/enquiries` / server action)

- Zod parse → reject unknown keys.
- **Honeypot** `website` must be empty.
- **Turnstile** token verified server-side (`siteverify`) before processing.
- **Rate limit:** 5 submissions / 10 min / IP-hash and 20 / day globally (Cloudflare rate-limiting rule or D1/KV counter).
- Insert row first; then email via Resend with **plain text + simple HTML escaped** body; user-supplied values never placed in headers (`from`, `subject` use fixed templates; `reply_to` = validated email only).
- Store `ip_hash = sha256(ip + daily salt)`; never raw IP.
- Retention: delete enquiries older than 12 months (Cron) `[SUGGESTED]`.

## 5. HTTP security headers (middleware / `_headers`)

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' https://media.<domain> data: blob:; script-src 'self' 'nonce-…' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://static.cloudflareinsights.com; connect-src 'self' https://media.<domain> https://<r2-account>.r2.cloudflarestorage.com https://*.clerk.accounts.dev; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` (tune to the final Clerk/Turnstile domains; use nonces for inline scripts) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `X-Frame-Options` | `DENY` (also via CSP) |
| `Cross-Origin-Opener-Policy` | `same-origin` |

## 6. Dependency & supply-chain hygiene

- Lockfile committed; `pnpm audit` in CI (fail on high/critical).
- Dependabot/Renovate weekly; pin major versions of Next, Motion, Clerk, Drizzle, OpenNext.
- Minimal dependencies; no unmaintained animation/lightbox libs.
- Secrets scanning (gitleaks) pre-commit and in CI.

## 7. Privacy & compliance

- Applicable: **Nigeria Data Protection Act 2023 (NDPA)**; also GDPR-aligned practices for any EU/UK visitors. (This is engineering guidance, not legal advice; have the privacy page reviewed, Q12.)
- Data collected: enquiry name/email/phone/message only; purpose = reply; retention 12 months; deletion on request via email.
- Processors: Cloudflare (hosting/storage/analytics), Resend (email), Clerk (admin auth only: visitors never touch Clerk).
- No cookie banner needed while cookies are strictly necessary (admin session only) and analytics are cookieless.
- Photos of identifiable people: the photographer is responsible for **model releases/consent**; add an admin hint "Make sure the person has agreed to the photo being shown online".

## 8. Image theft: realistic stance

No technical measure prevents saving a displayed image. Reasonable deterrents `[Q13]`: serve ≤ 2400 px (no originals), optional right-click suppression on gallery images (off by default; it harms accessibility/UX), optional unobtrusive watermark at delivery, © in metadata via JSON-LD `copyrightHolder`, and registering work on Instagram/Google with the same name. Be honest with the client about the limits.

## 9. Incident basics

- Rotate: Clerk secret, R2 keys, Resend key, Turnstile secret, `ADMIN_ALLOWLIST` (immediately if the owner's email is compromised).
- Restore data: D1 Time Travel; bucket originals are the source of truth for images.
- Keep a `SECURITY-CONTACT` line in the repo README (developer email).

## 10. Acceptance

- [ ] Unauthed → 401, non-allowlisted → 403 for every admin route (automated test iterating the route list).
- [ ] Presign rejects wrong type/size/over-quota.
- [ ] Contact form rejects honeypot, missing Turnstile, oversize and rate-limited requests.
- [ ] Headers present on all responses (checked in e2e).
- [ ] No secret appears in the client bundle (`grep` of build output in CI).
- [ ] Original-bucket objects return 403/404 publicly.
