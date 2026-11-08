import { CollageHero } from "@/components/home/CollageHero";
import { SplitNameHeroSection } from "@/components/home/SplitNameHeroSection";
import { FilmstripSelector } from "@/components/work/FilmstripSelector";
import { FeaturedEditorialList } from "@/components/home/FeaturedEditorialList";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ScrollLitText } from "@/components/motion/ScrollLitText";
import { Reveal } from "@/components/motion/Reveal";
import { mockPhotos, mockCollections } from "@/lib/db/queries";
import { getSiteSettings, getAllPhotos, getAllCollections, getAllTestimonials } from "@/lib/db/data-store";
import { siteConfig } from "@/lib/site-config";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: `${siteConfig.brandName} | Studio & Portrait Photographer in Benin City`,
  description:
    "Studio and portrait photography by Zetona_E, based in Benin City, Nigeria. Beautiful moments of beautiful people.",
  openGraph: {
    title: `${siteConfig.brandName} | Studio & Portrait Photographer`,
    description: "Beautiful moments of beautiful people. Portfolio of Zetona_E, Benin City.",
    url: siteConfig.siteUrl,
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, photos, collections, testimonials] = await Promise.all([
    getSiteSettings(),
    getAllPhotos(),
    getAllCollections(),
    getAllTestimonials(),
  ]);

  const allPublishedPhotos = photos.length > 0 ? photos : mockPhotos;

  // 1. Hero Floating Collage Photos (Dedicated Section 1)
  const heroPhotos = (settings.homeHeroPhotoIds && settings.homeHeroPhotoIds.length > 0)
    ? settings.homeHeroPhotoIds.map((id) => allPublishedPhotos.find((p) => p.id === id)).filter(Boolean) as typeof photos
    : allPublishedPhotos.filter((p) => p.featuredHome);
  const effectiveHeroPhotos = heroPhotos.length > 0 ? heroPhotos : allPublishedPhotos.slice(0, 10);

  // 2. Split-Name Hero Center Focal Portraits (Dedicated Section 2: ZETONA ... _E)
  const splitPhotos = (settings.homeSplitPhotoIds && settings.homeSplitPhotoIds.length > 0)
    ? settings.homeSplitPhotoIds.map((id) => allPublishedPhotos.find((p) => p.id === id)).filter(Boolean) as typeof photos
    : effectiveHeroPhotos;

  // 3. Sessions & Awards for the interactive hover-reveal list (Dedicated Section 3)
  const defaultAwards = [
    { id: "ses_01", title: "HONORABLE MENTION", year: "2026", href: "/work", photo: allPublishedPhotos[0] || mockPhotos[0] },
    { id: "ses_02", title: "SHORTLISTED PORTRAITURE", year: "2025", href: "/work", photo: allPublishedPhotos[1] || mockPhotos[1] },
    { id: "ses_03", title: "FEATURED EDITORIAL", year: "2025", href: "/work", photo: allPublishedPhotos[2] || mockPhotos[2] },
    { id: "ses_04", title: "COMMUNICATION ARTS", year: "2024", href: "/work", photo: allPublishedPhotos[3] || mockPhotos[3] },
    { id: "ses_05", title: "THE QUIET CITY", year: "2024", href: "/work", photo: allPublishedPhotos[4] || mockPhotos[4] },
    { id: "ses_06", title: "PROFESSIONAL COMPETITION", year: "2023", href: "/work", photo: allPublishedPhotos[5] || mockPhotos[5] },
    { id: "ses_07", title: "FINE ART PHOTOGRAPHY", year: "2022", href: "/work", photo: allPublishedPhotos[6] || mockPhotos[6] },
    { id: "ses_08", title: "GOLD AWARD NIGERIA", year: "2021", href: "/work", photo: allPublishedPhotos[7] || allPublishedPhotos[0] || mockPhotos[7] },
  ];

  const sessionListItems = (settings.homeAwardsList && settings.homeAwardsList.length > 0)
    ? settings.homeAwardsList.map((item, idx) => {
        const photo = item.photoId ? allPublishedPhotos.find((p) => p.id === item.photoId) : null;
        return {
          id: item.id || `ses_${idx}`,
          title: item.title,
          year: item.year,
          href: item.href || "/work",
          photo: photo || allPublishedPhotos[idx % allPublishedPhotos.length] || mockPhotos[0],
        };
      })
    : defaultAwards;

  // 4. Selected Work Filmstrip Photos (Dedicated Section 4)
  const filmstripPhotos = (settings.homeFilmstripPhotoIds && settings.homeFilmstripPhotoIds.length > 0)
    ? settings.homeFilmstripPhotoIds.map((id) => allPublishedPhotos.find((p) => p.id === id)).filter(Boolean) as typeof photos
    : effectiveHeroPhotos;

  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content">
        {/* 1. Rabah Floating Collage Hero (Clean center, big mobile cards, soft bottom fade) */}
        <CollageHero
          photos={effectiveHeroPhotos}
          headline={settings.headline || "Beautiful moments of\nbeautiful people."}
          subline={settings.subline || undefined}
          cta="View the work"
          ctaHref="/work"
        />

        {/* 2. Kristin Watson Split-Name Hero Section (Image 4: ZETONA ... _E + Center Crop Frame) */}
        <SplitNameHeroSection photos={splitPhotos} />

        {/* 3. Statement / Scroll-Lit Text (Pattern P3) — always shown with fallback bio */}
        <section
          className="relative border-t border-[var(--line)]"
          style={{ minHeight: "160vh" }}
          aria-label="About statement"
        >
          <div
            className="sticky flex flex-col justify-center px-6 md:px-16 lg:px-24"
            style={{ top: "25vh", paddingTop: "15vh", paddingBottom: "15vh" }}
          >
            <Reveal className="mb-4">
              <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest">
                • Philosophy
              </span>
            </Reveal>
            <ScrollLitText
              text={
                settings.bio
                  ? settings.bio.split("\n\n")[0] || settings.bio
                  : "Every frame is a conversation between light and life. We photograph what words cannot hold — the split-second glance, the warmth between two people, the quiet beauty of an ordinary afternoon."
              }
              className="font-serif text-[var(--fg)] max-w-4xl"
              style={{ fontSize: "var(--fs-lead)" }}
            />
            <Reveal delay={0.25} className="mt-10">
              <Link
                href="/about"
                className="text-[var(--accent-text)] text-sm font-sans hover:text-[var(--accent)] transition-colors inline-flex items-center gap-2"
              >
                Read full bio
                <span>→</span>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* 4. Interactive Hover-Reveal Sessions List (Conditioned on settings.showAwards) */}
        {settings.showAwards && <FeaturedEditorialList items={sessionListItems} />}

        {/* 5. Cinematic Testimonials Section with Client Monograms (Conditioned on settings.showTestimonials) */}
        {settings.showTestimonials && <TestimonialsSection testimonials={testimonials} />}

        {/* 6. Last Section: Selected Work Incorporating the Filmstrip Carousel (Image 3) */}
        <FilmstripSelector
          collections={collections.length > 0 ? collections : mockCollections}
          photos={filmstripPhotos}
          title="Selected Work"
          badge="• Selected Work"
        />
      </main>
    </>
  );
}
