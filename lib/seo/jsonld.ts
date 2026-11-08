import { siteConfig } from "@/lib/site-config";

/**
 * Structured Data helpers (JSON-LD)
 * Source: docs/SEO.md §3
 */

export function buildLocalBusinessJsonLd() {
  const sameAs: string[] = [];
  if (siteConfig.socials.instagram) sameAs.push(siteConfig.socials.instagram);
  if (siteConfig.socials.facebook) sameAs.push(siteConfig.socials.facebook);
  if (siteConfig.socials.tiktok) sameAs.push(siteConfig.socials.tiktok);
  if (siteConfig.socials.x) sameAs.push(siteConfig.socials.x);

  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "Photographer"],
    name: siteConfig.brandName,
    description: "Studio and portrait photographer in Benin City, Nigeria.",
    url: siteConfig.siteUrl,
    image: `${siteConfig.siteUrl}/opengraph-image`,
    email: siteConfig.email,
    telephone: siteConfig.phoneE164,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
      addressCountry: "NG",
    },
    areaServed: siteConfig.city,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildCollectionJsonLd(collection: {
  title: string;
  description?: string | null;
  slug: string;
  photos?: Array<{
    id: string;
    title?: string | null;
    alt: string;
    caption?: string | null;
    displayKey: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.title} Portraits | ${siteConfig.brandName}`,
    description:
      collection.description ||
      `${collection.title} portraits by ${siteConfig.brandName}, studio and portrait photographer in Benin City.`,
    url: `${siteConfig.siteUrl}/work/${collection.slug}`,
    hasPart: (collection.photos || []).map((photo) => ({
      "@type": "ImageObject",
      contentUrl: `${siteConfig.siteUrl}/photos/${photo.id}`,
      name: photo.title || photo.alt,
      caption: photo.caption || photo.alt,
      creator: {
        "@type": "Person",
        name: siteConfig.brandName,
      },
      copyrightHolder: {
        "@type": "Person",
        name: siteConfig.brandName,
      },
    })),
  };
}
