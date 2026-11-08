import { Reveal } from "@/components/motion/Reveal";
import { ScrollLitText } from "@/components/motion/ScrollLitText";
import { getSiteSettings, getAllPhotos } from "@/lib/db/data-store";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getOptimizedSrc } from "@/lib/storage/image-url";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.brandName} — Studio and portrait photographer based in Benin City, Nigeria.`,
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const photos = await getAllPhotos();
  const bio = settings.bio || siteConfig.fallbackBio;

  // Curated scattered photos for About
  const heroPhoto = photos[0]; // Radiance
  const bioPhoto1 = photos[2] || photos[0]; // Soft focus
  const bioPhoto2 = photos[7] || photos[1] || photos[0]; // Studio man
  const scatteredGallery = [
    { photo: photos[0], aspect: "aspect-[3/4]", offset: "md:translate-y-8", rotate: "-rotate-2", label: photos[0]?.title ? `01 / ${photos[0].title.toUpperCase()}` : "01 / PORTRAIT" },
    { photo: photos[7] || photos[1] || photos[0], aspect: "aspect-[4/5]", offset: "md:-translate-y-6", rotate: "rotate-1", label: (photos[7] || photos[1])?.title ? `02 / ${(photos[7] || photos[1])?.title?.toUpperCase()}` : "02 / STUDIO" },
    { photo: photos[2] || photos[0], aspect: "aspect-square", offset: "md:translate-y-12", rotate: "-rotate-1", label: photos[2]?.title ? `03 / ${photos[2].title.toUpperCase()}` : "03 / EDITORIAL" },
    { photo: photos[8] || photos[3] || photos[0], aspect: "aspect-[3/4]", offset: "md:-translate-y-4", rotate: "rotate-2", label: (photos[8] || photos[3])?.title ? `04 / ${(photos[8] || photos[3])?.title?.toUpperCase()}` : "04 / MOOD" },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] pt-24 pb-24 overflow-hidden">
      {/* ──────────────── HERO: GIANT BRAND WORDMARK (FULL BLEED END TO END) ──────────────── */}
      <div className="px-6 md:px-12 pt-10 pb-12 relative border-b border-[var(--line)] overflow-hidden">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-text)]">
                Studio & Portrait Photographer
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider hidden sm:inline">
                Benin City, Nigeria · Available Worldwide
              </span>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="w-full max-w-[94vw] mx-auto overflow-visible py-2 select-none">
              <h1
                className="font-heavy uppercase text-[var(--fg)] leading-[0.88] select-none w-full flex justify-between items-end text-center tracking-normal font-black px-1 sm:px-3"
                style={{ fontSize: "clamp(2.5rem, 9.8vw, 11.5rem)", fontWeight: 900 }}
              >
                <span>Z</span>
                <span>E</span>
                <span>T</span>
                <span>O</span>
                <span>N</span>
                <span>A</span>
                <span className="inline-flex items-end justify-center px-0.5 sm:px-1" aria-label="_">
                  <span
                    aria-hidden="true"
                    className="inline-block bg-current rounded-xs"
                    style={{
                      width: "clamp(1.2rem, 3.5vw, 4rem)",
                      height: "clamp(0.35rem, 0.9vw, 1.1rem)",
                      marginBottom: "clamp(0.25rem, 0.9vw, 1.2rem)",
                    }}
                  />
                  <span className="sr-only">_</span>
                </span>
                <span className="pr-1 sm:pr-2">E</span>
              </h1>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ──────────────── BIO + SIDE-BY-SIDE CTA PANEL ──────────────── */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: ABOUT ME + SCROLL-LIT TEXT (NO ARTIFICIAL 60VH GAP) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Section Tag */}
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest">
                  About Me
                </span>
                <span className="text-white/20 font-mono text-xs">/</span>
                <span className="font-mono text-xs text-white/40 uppercase tracking-wider">
                  The Photographer
                </span>
              </div>
            </Reveal>

            {/* Natural flowing scroll-lit paragraphs without empty dead space */}
            <div className="space-y-8">
              {bio.split("\n\n").map((paragraph, i) => (
                <ScrollLitText
                  key={i}
                  text={paragraph}
                  className="font-serif text-[var(--fg)] text-balance"
                  style={{ fontSize: "var(--fs-lead)" }}
                />
              ))}
            </div>

            {/* Photographer Metadata & Focus Chips */}
            <Reveal delay={0.15}>
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
                <div>
                  <span className="text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                    [ 01 / LOCATION ]
                  </span>
                  <p className="text-[var(--fg)]">Benin City, Nigeria</p>
                </div>
                <div>
                  <span className="text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                    [ 02 / SPECIALTY ]
                  </span>
                  <p className="text-[var(--fg)]">Studio & Portraiture</p>
                </div>
                <div>
                  <span className="text-[var(--fg-dim)] uppercase tracking-wider block mb-1">
                    [ 03 / PHILOSOPHY ]
                  </span>
                  <p className="text-[var(--fg)]">Bespoke Light & Presence</p>
                </div>
              </div>
            </Reveal>

            {/* Scattered Accent Photo (nestled below the bio on the left) */}
            {bioPhoto1 && (
              <Reveal delay={0.2} className="pt-4 max-w-md">
                <div className="aspect-[4/3] relative overflow-hidden rounded-md bg-[var(--bg-elevated)] ring-1 ring-white/10 shadow-xl -rotate-1 hover:rotate-0 transition-transform duration-500 group">
                  <Image
                    src={getOptimizedSrc(bioPhoto1.displayKey, 800)}
                    alt={bioPhoto1.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{
                      objectPosition: `${(bioPhoto1.focal?.x ?? 0.5) * 100}% ${(bioPhoto1.focal?.y != null ? Math.min(bioPhoto1.focal.y, 0.15) : 0.12) * 100}%`,
                    }}
                    sizes="(min-width:1024px) 35vw, 90vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 font-mono text-[11px] text-white/80">
                    Catchlight & Intimate Framing Study
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* RIGHT COLUMN: "LET'S WORK TOGETHER" SIDE PANEL + SCATTERED PORTRAIT */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            {/* Frosted Glassmorphic Action Card */}
            <Reveal delay={0.2}>
              <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-7 md:p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative subtle ambient blue glow */}
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-[var(--accent)]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent-text)] border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2.5 py-1 rounded-full">
                      ● Commissions Open
                    </span>
                    <span className="font-mono text-xs text-[var(--fg-dim)]">2026 Season</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl text-[#F6F2E6] leading-snug tracking-tight">
                      Ready to capture your authentic story?
                    </h2>
                    <p className="font-sans text-xs md:text-sm text-[var(--fg-muted)] mt-2 leading-relaxed">
                      Accepting portrait commissions, studio shoots, and creative editorials in Benin City and beyond.
                    </p>
                  </div>

                  {/* The Primary CTA Button (Positioned cleanly at the side) */}
                  <div className="pt-2 space-y-3">
                    <Link
                      href="/contact"
                      className="flex items-center justify-between w-full border border-white/20 bg-[#F6F2E6] text-[#0A0A0A] hover:bg-white text-sm font-sans font-medium px-6 py-3.5 rounded-full shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      <span>Let&apos;s work together</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>

                    {/* Secondary WhatsApp Button */}
                    <a
                      href={buildWhatsAppUrl("Hello Zetona_E, I would like to enquire about booking a photo session.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-xs font-mono uppercase tracking-wider text-[#F6F2E6] px-4 py-3 rounded-full transition-colors"
                    >
                      <span>Direct WhatsApp</span>
                      <span>↗</span>
                    </a>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-[var(--fg-dim)]">
                    <span>Replies within 24h</span>
                    <span>Studio / On-Location</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Scattered Portrait Card Below the Side Action Panel */}
            {bioPhoto2 && (
              <Reveal delay={0.3}>
                <div className="aspect-[4/5] relative overflow-hidden rounded-md bg-[var(--bg-elevated)] ring-1 ring-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 group">
                  <Image
                    src={getOptimizedSrc(bioPhoto2.displayKey, 800)}
                    alt={bioPhoto2.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{
                      objectPosition: `${(bioPhoto2.focal?.x ?? 0.5) * 100}% ${(bioPhoto2.focal?.y != null ? Math.min(bioPhoto2.focal.y, 0.15) : 0.12) * 100}%`,
                    }}
                    sizes="(min-width:1024px) 30vw, 85vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                    <span>Sculpted Shadow & Rim Light</span>
                    <span className="text-white/50">Studio Series</span>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────── SCATTERED EDITORIAL GALLERY (ORGANIC VISUAL SPREAD) ──────────────── */}
      <section className="px-6 md:px-12 py-20 border-t border-[var(--line)] max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-text)] block mb-2">
              [ 02 / SELECTED MOMENTS ]
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--fg)] tracking-tight">
              Framed between shadow and light.
            </h2>
          </div>
          <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider">
            Curated Portfolio Highlights
          </p>
        </div>

        {/* Scattered 4-column asymmetric cards with vertical offsets & organic angles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-start">
          {scatteredGallery.map((item, i) => (
            <Reveal key={item.photo.id} delay={i * 0.1} className={`w-full ${item.offset}`}>
              <div
                className={`relative overflow-hidden rounded-md bg-[var(--bg-elevated)] ring-1 ring-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:z-20 hover:rotate-0 group ${item.rotate} ${item.aspect}`}
              >
                <Image
                  src={getOptimizedSrc(item.photo.displayKey, 800)}
                  alt={item.photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{
                    objectPosition: `${(item.photo.focal?.x ?? 0.5) * 100}% ${(item.photo.focal?.y != null ? Math.min(item.photo.focal.y, 0.15) : 0.12) * 100}%`,
                  }}
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 45vw, 90vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                
                {/* Glassmorphic Caption Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
                  <span className="backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-white/10 tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-white/60">0{i + 1}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Explore Link */}
        <div className="mt-20 flex justify-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-[#F6F2E6] hover:text-[var(--accent-text)] border border-white/20 hover:border-[var(--accent)] bg-white/[0.02] px-6 py-3 rounded-full transition-all duration-300"
          >
            <span>Explore Complete Work Archive</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
