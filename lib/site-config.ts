/**
 * Fixed brand facts and provenance.
 * Single source of truth for site-wide configuration.
 * Source: docs/CONTENT.md
 */
export const siteConfig = {
  brandName: "Zetona_E", // [CLIENT] spelled as written; display styling TBD (Q1)
  legalName: "[PLACEHOLDER: photographer's full name]", // Q1
  descriptor: "Studio & Portrait Photographer", // [CLIENT] wording
  city: "Benin City", // [CLIENT]
  country: "Nigeria", // [CLIENT-derived: Benin City + +234 number]
  email: "Osakpolorobazee01@gmail.com", // [CLIENT]
  phoneDisplay: "0803 081 2138", // [CLIENT] formatting only
  phoneE164: "+2348030812138", // [CLIENT] converted from 08030812138
  whatsappE164Digits: "2348030812138", // for wa.me
  accentName: "Blue", // [CLIENT]
  aim: "To capture beautiful moments of beautiful people.", // [CLIENT]
  fallbackBio:
    "I'm Zetona_E, a studio and portrait photographer based in Benin City. My aim is to capture beautiful moments of beautiful people.", // [CLIENT]
  socials: {
    instagram: null, // [PLACEHOLDER] Q5
    facebook: null, // Q5
    tiktok: null, // Q5
    x: null, // Q5
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://zetona.workers.dev",
} as const;
