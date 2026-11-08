import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { getAllCollections, getAllPhotos } from "@/lib/db/data-store";
import { mockCollections, mockPhotos } from "@/lib/db/queries";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { buildCollectionJsonLd } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collections = await getAllCollections();
  const collection = collections.find((c) => c.slug === slug) || mockCollections.find((c) => c.slug === slug);
  if (!collection) return {};
  return {
    title: `${collection.title} Portraits`,
    description:
      collection.description ||
      `${collection.title} portraits by ${siteConfig.brandName}, studio and portrait photographer in Benin City.`,
  };
}

function getOptimizedSrc(src: string, width = 1200) {
  if (src.includes("images.unsplash.com")) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}w=${width}&q=84&auto=format`;
  }
  if (src.includes("res.cloudinary.com")) {
    return src.replace("/upload/", `/upload/w_${width},q_auto,f_auto,c_limit/`);
  }
  return src;
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const [collectionsData, photosData] = await Promise.all([
    getAllCollections(),
    getAllPhotos(),
  ]);

  const collections = collectionsData.length > 0 ? collectionsData : mockCollections;
  const photos = photosData.length > 0 ? photosData : mockPhotos;

  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const collectionPhotos = photos.filter(
    (p) => p.collectionId === collection.id || p.collection?.slug === slug
  );

  if (collectionPhotos.length === 0) notFound();

  const jsonLd = buildCollectionJsonLd({
    title: collection.title,
    description: collection.description,
    slug,
    photos: collectionPhotos.map((p) => ({
      id: p.id,
      title: p.title,
      alt: p.alt,
      caption: p.caption,
      displayKey: p.displayKey,
    })),
  });

  // Find next collection for the footer link
  const currentIdx = collections.findIndex((c) => c.slug === slug);
  const nextCollection =
    currentIdx >= 0 ? collections[(currentIdx + 1) % collections.length] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content" className="min-h-screen bg-[var(--bg)] pt-28 pb-24">
        {/* Collection header */}
        <div className="px-6 md:px-12 mb-12">
          <Reveal>
            <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-3 block">
              • Collection
            </span>
          </Reveal>
          <div className="flex items-baseline justify-between">
            <Reveal delay={0.05}>
              <h1
                className="font-condensed uppercase text-[var(--fg)]"
                style={{ fontSize: "var(--fs-h1)" }}
              >
                {collection.title}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="font-mono text-[var(--fg-dim)] text-sm">
                [{collectionPhotos.length} photos]
              </span>
            </Reveal>
          </div>
          {collection.description && (
            <Reveal delay={0.15} className="mt-4 max-w-2xl">
              <p className="text-[var(--fg-muted)] font-sans text-base leading-relaxed">
                {collection.description}
              </p>
            </Reveal>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--line)] mx-6 md:mx-12 mb-10" />

        {/* Masonry gallery */}
        <div className="px-6 md:px-12 columns-1 sm:columns-2 lg:columns-3 gap-3 md:gap-4">
          {collectionPhotos.map((photo, i) => (
            <Reveal
              key={photo.id}
              delay={Math.min(i * 0.06, 0.4)}
              className="mb-3 md:mb-4 break-inside-avoid"
            >
              <div className="relative overflow-hidden group cursor-pointer bg-[var(--bg-elevated)]">
                <Image
                  src={getOptimizedSrc(photo.displayKey, 1200)}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  style={{
                    objectPosition: `${(photo.focal?.x ?? 0.5) * 100}% ${(photo.focal?.y ?? 0.35) * 100}%`,
                  }}
                  sizes="(min-width:1024px) 32vw, (min-width:480px) 48vw, 100vw"
                  loading={i < 3 ? "eager" : "lazy"}
                />
                {/* Caption on hover */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg)]/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[var(--fg)] text-xs font-sans">{photo.caption}</p>
                  </div>
                )}
              </div>
              {photo.title && (
                <p className="mt-1.5 text-[var(--fg-dim)] text-xs font-sans">{photo.title}</p>
              )}
            </Reveal>
          ))}
        </div>

        {/* Next collection link */}
        {nextCollection && nextCollection.slug !== slug && (
          <div className="border-t border-[var(--line)] mx-6 md:mx-12 mt-20 pt-10">
            <Reveal>
              <Link
                href={`/work/${nextCollection.slug}`}
                className="group flex items-center justify-between"
              >
                <span className="text-[var(--fg-dim)] text-xs font-mono uppercase tracking-widest">
                  Next Collection
                </span>
                <span
                  className="font-condensed uppercase text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors duration-200"
                  style={{ fontSize: "var(--fs-h2)" }}
                >
                  {nextCollection.title} →
                </span>
              </Link>
            </Reveal>
          </div>
        )}
      </main>
    </>
  );
}
