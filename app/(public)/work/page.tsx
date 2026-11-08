import { Reveal } from "@/components/motion/Reveal";
import { getAllCollections, getAllPhotos } from "@/lib/db/data-store";
import { mockCollections, mockPhotos } from "@/lib/db/queries";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A selection of portrait and studio sessions by Zetona_E, photographer in Benin City.",
};

export default async function WorkPage() {
  const [collectionsData, photosData] = await Promise.all([
    getAllCollections(),
    getAllPhotos(),
  ]);

  const collections = collectionsData.length > 0 ? collectionsData : mockCollections;
  const photos = photosData.length > 0 ? photosData : mockPhotos;
  const activePhotos = photos.filter((p) => p.status === "published" || p.featuredHome !== undefined);
  const totalPhotos = activePhotos.length;

  if (collections.length === 0) {
    return (
      <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-6 py-32">
        <p className="font-condensed uppercase text-[var(--fg-dim)] text-2xl mb-6">
          New work is on the way.
        </p>
        <Link
          href="/contact"
          className="text-[var(--accent-text)] text-sm font-sans hover:text-[var(--accent)] transition-colors"
        >
          Get in touch →
        </Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      {/* Page header */}
      <div className="px-6 md:px-12 mb-16 flex items-baseline gap-3">
        <Reveal>
          <h1
            className="font-condensed uppercase text-[var(--fg)]"
            style={{ fontSize: "var(--fs-h1)" }}
          >
            Work
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <sup className="font-mono text-[var(--fg-dim)] text-sm">({totalPhotos})</sup>
        </Reveal>
      </div>

      {/* Collection grid */}
      <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {collections.map((col, i) => {
          const colPhotos = photos.filter((p) => p.collectionId === col.id || p.collection?.slug === col.slug);
          const coverPhoto =
            (col as any).coverPhoto ||
            colPhotos[0] ||
            photos[0];

          return (
            <Reveal key={col.id} delay={i * 0.1}>
              <Link href={`/work/${col.slug}`} className="block group">
                {/* Cover image */}
                <div className="aspect-[4/5] relative overflow-hidden bg-[var(--bg-elevated)] mb-4">
                  {coverPhoto && (
                    <Image
                      src={coverPhoto.displayKey}
                      alt={coverPhoto.alt || col.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{
                        objectPosition: `${(coverPhoto.focal?.x ?? 0.5) * 100}% ${(coverPhoto.focal?.y ?? 0.35) * 100}%`,
                      }}
                      sizes="(min-width:1024px) 32vw, (min-width:768px) 48vw, 100vw"
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[var(--bg)]/0 group-hover:bg-[var(--bg)]/20 transition-colors duration-300" />
                  {/* Photo count badge */}
                  <div className="absolute bottom-3 right-3 font-mono text-[var(--fg)] text-xs bg-[var(--bg)]/80 px-2 py-1 rounded">
                    [{colPhotos.length || col.photoCount || 0}]
                  </div>
                </div>

                {/* Collection title + description */}
                <div>
                  <h2 className="font-condensed uppercase text-[var(--fg)] text-2xl tracking-wide group-hover:text-[var(--accent)] transition-colors duration-200">
                    {col.title}
                  </h2>
                  {col.description && (
                    <p className="mt-1 text-[var(--fg-muted)] text-sm font-sans leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </main>
  );
}
