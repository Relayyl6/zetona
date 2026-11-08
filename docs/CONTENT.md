# CONTENT.md: Copy, Facts & Provenance

Every string the site shows, with its source. `lib/site-config.ts` and the seed file are
generated from this document. See [CLIENT-SPEC.md](./CLIENT-SPEC.md), [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md).

---

## 1. Client's own words (verbatim source material)

### 1.1 Intake conversation (transcribed summary of the client's request)

> "I'm more of a studio portrait photographer. So I think my main aim, or the main problem I want to
> solve, is more on visibility and how to showcase my portfolio … professionally or properly on the
> website … it's almost the same thing [as the other photographer's site]. Just a place where I can show
> my portfolio and gain more visibility."

### 1.2 Brand chat (see `reference/client-chat-brand-brief.png`)

1. "Color Blue"
2. "I'm Zetona_E a studio and portrait photographer based in Benin city."
3. "my aim is to capture beautiful moments of beautiful people."

### 1.3 Contact details supplied

- Email: `Osakpolorobazee01@gmail.com`
- Phone: `08030812138`

---

## 2. Fixed facts → `lib/site-config.ts`

```ts
export const siteConfig = {
  brandName: "Zetona_E",                       // [CLIENT] spelled as written; display styling TBD (Q1)
  legalName: "[PLACEHOLDER: photographer's full name]", // Q1
  descriptor: "Studio & Portrait Photographer", // [CLIENT] wording
  city: "Benin City",                           // [CLIENT]
  country: "Nigeria",                           // [CLIENT-derived: Benin City + +234 number]
  email: "Osakpolorobazee01@gmail.com",         // [CLIENT]
  phoneDisplay: "0803 081 2138",                // [CLIENT] formatting only
  phoneE164: "+2348030812138",                  // [CLIENT] converted from 08030812138
  whatsappE164Digits: "2348030812138",          // for wa.me
  accentName: "Blue",                           // [CLIENT]
  socials: {
    instagram: null,   // [PLACEHOLDER] Q5
    facebook: null,    // Q5
    tiktok: null,      // Q5
    x: null,           // Q5
  },
  siteUrl: "[PLACEHOLDER: production domain]",  // Q6
} as const;
```

Socials stay `null` until supplied. UI renders **nothing** for a null link, never a dead icon.
The handle `Zetona_E` is likely also his Instagram handle, but that is an **assumption**: do not link it until confirmed.

---

## 3. Site copy

Legend: ✅ client words · 🟡 suggested (editable in admin/site-config, shown to client for approval) · ⬜ placeholder.

### 3.1 Global

| Key | Copy | Status |
|-----|------|--------|
| `nav.items` | Home · Work · Archive · About · Contact | 🟡 (mirrors reference nav) |
| `nav.cta` | Contact Me → | 🟡 |
| `footer.cta` | LET'S TALK. → | 🟡 |
| `footer.legal` | © {year} Zetona_E · Privacy | 🟡 |

### 3.2 Home

| Key | Copy | Status |
|-----|------|--------|
| `home.headline` | "Beautiful moments of beautiful people." | 🟡 derived directly from client's aim; confirm (Q7) |
| `home.subline` | "Studio & portrait photography, Benin City." | 🟡 |
| `home.cta` | "View the work" | 🟡 |
| `home.about.teaser` | Uses About paragraph 1 once supplied | ⬜ |
| `home.featured.title` | "Selected Work" | 🟡 |

### 3.3 About

| Key | Copy | Status |
|-----|------|--------|
| `about.label` | "About me" | 🟡 |
| `about.bio` | `[PLACEHOLDER: biography, 2–3 short paragraphs from the client, use verbatim when received]` | ⬜ Q2 |
| `about.fallbackBio` | "I'm Zetona_E, a studio and portrait photographer based in Benin City. My aim is to capture beautiful moments of beautiful people." | ✅ assembled **only** from the client's chat lines; used until a full bio arrives |
| `about.stats` | *Hidden.* No numbers supplied. Never invent project/client/year counts. | ⬜ Q8 |

### 3.4 Work

| Key | Copy | Status |
|-----|------|--------|
| `work.title` | "Work" | 🟡 |
| `work.intro` | "A selection of portraits and studio sessions." | 🟡 |
| `collection.*` | Names/descriptions come from the admin. Seed values in §4 are `[SUGGESTED]`. | 🟡 |

### 3.5 Contact

| Key | Copy | Status |
|-----|------|--------|
| `contact.headline` | "Let's talk." | 🟡 |
| `contact.intro` | "Tell me about your shoot: who, when and what you have in mind." | 🟡 |
| `contact.form.labels` | Name · Email · Phone (optional) · Type of session (optional) · Message | 🟡 |
| `contact.form.success` | "Thank you. Your message is in. I'll reply soon." | 🟡 |
| `contact.form.error` | "Something went wrong. Please try WhatsApp or email directly." | 🟡 |
| `contact.whatsapp.prefill` | "Hello Zetona_E, I found your portfolio and I'd like to book a shoot." | 🟡 |
| `contact.location` | "Based in Benin City, Nigeria." (add "Available to travel." only if client confirms, Q9) | ✅/🟡 |

### 3.6 Legal

Privacy page: plain-language copy `[SUGGESTED]`. States what the contact form stores, the
analytics used (cookieless), and the data controller email. Review before launch (Q12).

---

## 4. Seed data (development only, never ship as real content)

### 4.1 Collections `[SUGGESTED]`, admin-editable

| slug | title | description |
|------|-------|-------------|
| `portraits` | Portraits | Personality and presence, lit with care. |
| `studio` | Studio | Controlled light, clean backdrops, honest expression. |
| `editorial` | Editorial | `[SUGGESTED: confirm if he shoots fashion/beauty]` |

> Collections beyond the first two require client confirmation (Q10). Seeds are dev-only; a
> fresh production DB starts with **zero** collections and the Work page shows its empty state.

### 4.2 Photos

No seed photos ship. Development uses `/public/dev-placeholders/*.svg` blocks, visibly labelled
"PLACEHOLDER", with neutral alt text ("Placeholder image"). Real alt text is written by the
client (or with him) during upload, see ADMIN.md §5.

---

## 5. Alt-text guidance (for the client)

Alt text describes the photo for someone who cannot see it. Suggested pattern: *subject +
setting + mood*, e.g. "Portrait of a woman in a white shirt against a deep blue studio
backdrop, soft side light". Never keyword-stuff. The admin shows this guidance beside the field.

## 6. Copy rules

- Sentence case for body, uppercase only for display/labels per DESIGN.md.
- No superlatives the client didn't use ("best", "award-winning", "top").
- No stock-photographer clichés ("passionate about capturing…") unless he says them.
- Nigerian English / British spelling (colour, centre).
