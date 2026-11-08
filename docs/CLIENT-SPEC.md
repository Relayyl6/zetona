# CLIENT-SPEC.md: Derived Specification

Source tags: **[CLIENT]** client's own words · **[DEV]** developer direction · **[SUGGESTED]** unapproved proposal.
Related: [CONTENT.md](./CONTENT.md) · [PAGES.md](./PAGES.md) · [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md)

---

## 1. Who the client is

| Fact | Value | Tag |
|------|-------|-----|
| Brand / handle | `Zetona_E` | [CLIENT] (chat) |
| Discipline | Studio and portrait photographer | [CLIENT] |
| Base | Benin City (Nigeria) | [CLIENT] |
| Email | Osakpolorobazee01@gmail.com | [CLIENT] |
| Phone | 08030812138 → WhatsApp E.164 `+2348030812138` | [CLIENT] (format conversion is mechanical; confirm WhatsApp is active, Q3) |
| Accent colour | Blue | [CLIENT] |
| Aim | "To capture beautiful moments of beautiful people." | [CLIENT] |

## 2. The problem to solve [CLIENT]

1. **Visibility**: be discoverable (search, social shares, a link to put in an Instagram bio).
2. **Showcase**: present portfolio work "professionally or properly".
3. He knows another photographer's site (SH Photography) and said his need is "almost the same thing": a portfolio place. This is a **reference for scope**, not a request to copy features.

## 3. Requirements

### 3.1 Functional

| ID | Requirement | Tag |
|----|-------------|-----|
| F1 | Home page built as a floating image-collage hero on near-black, serif headline, pill CTA, hamburger menu | [CLIENT] (liked the Rabah screenshot) |
| F2 | Maximum tasteful animation using Framer Motion/Motion across the whole site | [DEV] |
| F3 | Portfolio pages: collection index + per-collection gallery with lightbox | [CLIENT] + [SUGGESTED] structure |
| F4 | Inner-page interaction language from the reference recording (see INSPIRATION-ANALYSIS) | [CLIENT] (supplied as inspiration) |
| F5 | About page with biography | [CLIENT] (text not yet supplied, Q2) |
| F6 | Contact: email form, direct email, WhatsApp, social links | [SUGGESTED] (needed for visibility goal) |
| F7 | Archive: a dense all-photos view | [SUGGESTED] (mirrors the reference nav "Archive") |
| F8 | Admin: **picture CRUD only**: upload, view, edit metadata, reorder, hide/show, delete | [CLIENT]/[DEV] |
| F9 | Images stored and retrieved via **Cloudflare** (R2) | [DEV] |
| F10 | Next.js for front end and back end | [DEV] |
| F11 | SEO foundations so the site can rank for local and brand queries | [SUGGESTED], serves the visibility aim |
| F12 | Privacy-friendly analytics so he can see visibility working | [SUGGESTED] |

### 3.2 Explicitly not required

No pricing table, no booking, no shop, no blog, no multi-user roles, no page builder, no
client-proofing galleries. Each can be a later extension (see §6).

### 3.3 Non-functional

| ID | Requirement |
|----|-------------|
| N1 | Mobile-first. Majority of visitors are on phones, often on mid-range Android and variable data. |
| N2 | Lighthouse mobile ≥ 90 (Performance may dip to ≥ 85 on the animated home page *only* if documented, see ACCESSIBILITY-PERFORMANCE §1) |
| N3 | WCAG 2.2 AA; full `prefers-reduced-motion` support |
| N4 | Photos displayed without destructive cropping and without layout shift |
| N5 | Owner can manage photos himself, on a phone, in under 2 minutes per upload |
| N6 | Zero recurring cost beyond domain at launch scale (Cloudflare + Resend free tiers) where possible |

## 4. Brand direction

- **Blue** is the accent. Exact value is `[SUGGESTED]` (DESIGN.md §3.1) and **must be confirmed** (Q4).
- Mood: editorial, confident, premium, photography-first. Dark canvas lets portraits glow.
- Tone of voice: warm, human, concise. Mirrors his phrase, "beautiful moments of beautiful people".

## 5. Acceptance (client's "done")

See ROADMAP.md → Definition of Done. In short: the client can send the link to anyone, it
looks like a professional studio portfolio on a phone, his best work leads, photos load
quickly, people can contact him in one tap, and he can add/replace/remove photos himself.

## 6. Planned extensions (not in v1)

| Extension | Trigger |
|-----------|---------|
| Services / pricing page (packages, "no price shown" toggle) | Client asks |
| Testimonials + awards sections (components already built, hidden by default) | Client supplies real content |
| Booking / enquiry-type selector (portrait, studio, event) | Client asks |
| Blog / journal for SEO | Client asks |
| Private client proofing galleries (signed URLs) | Client asks |
| Print shop | Client asks |
| Multi-language | Client asks |
