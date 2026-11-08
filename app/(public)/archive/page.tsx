import { Reveal } from "@/components/motion/Reveal";
import { getAllPhotos } from "@/lib/db/data-store";
import { mockPhotos } from "@/lib/db/queries";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Complete archive of published photographs by Zetona_E — portraits, studio sessions, and editorial work.",
};

export default async function ArchivePage() {
  const photosData = await getAllPhotos();
  const allPhotos = photosData.length > 0 ? photosData : mockPhotos;
  // All published photos, newest first
  const photos = allPhotos.filter((p) => p.status === "published" || p.featuredHome !== undefined);

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] pt-28 pb-24">
      <div className="px-6 md:px-12 mb-12 flex items-baseline gap-3">
        <Reveal>
          <h1
            className="font-condensed uppercase text-[var(--fg)]"
            style={{ fontSize: "var(--fs-h1)" }}
          >
            Archive
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <sup className="font-mono text-[var(--fg-dim)] text-sm">
            ({photos.length})
          </sup>
        </Reveal>
      </div>

      <div className="border-t border-[var(--line)] mx-6 md:mx-12 mb-10" />

      {/* Dense masonry grid */}
      <div className="px-6 md:px-12 columns-2 sm:columns-3 lg:columns-4 gap-2 md:gap-3">
        {photos.map((photo, i) => (
          <Reveal
            key={photo.id}
            delay={Math.min(i * 0.04, 0.3)}
            className="mb-2 md:mb-3 break-inside-avoid"
          >
            <div className="relative overflow-hidden group bg-[var(--bg-elevated)]">
              <Image
                src={
                  photo.displayKey.startsWith("http")
                    ? `${photo.displayKey}&w=800&q=80&auto=format`
                    : photo.displayKey
                }
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.03] grayscale-0 group-hover:brightness-90"
                style={{
                  objectPosition: `${(photo.focal?.x ?? 0.5) * 100}% ${(photo.focal?.y ?? 0.35) * 100}%`,
                }}
                sizes="(min-width:1024px) 25vw, (min-width:480px) 33vw, 50vw"
                loading={i < 4 ? "eager" : "lazy"}
              />
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
