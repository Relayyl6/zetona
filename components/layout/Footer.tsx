"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SiteSettingsDTO } from "@/lib/db/queries";
import { getOptimizedSrc } from "@/lib/storage/image-url";

interface FooterProps {
  settings?: Pick<SiteSettingsDTO, "instagramUrl" | "facebookUrl" | "tiktokUrl" | "xUrl" | "footerPhotoId">;
  footerPhotoSrc?: string | null;
}

const footerQuickLinks = [
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Footer: P9 pattern — Giant LET'S TALK. → + [Q][S][C] columns + Right Editorial Portrait
 * Source: Image 2 (Kristin Watson reference) & docs/DESIGN.md §5
 * On desktop (lg:), it strictly spans 100vh (h-screen / min-h-screen) covering the entire screen.
 * Automatically hides the duplicate CTA on /contact screen.
 */
export function Footer({ settings, footerPhotoSrc }: FooterProps) {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";

  // On contact page, remove the redundant giant "LET'S TALK." footer section
  if (isContactPage) {
    return (
      <footer className="bg-[#0A0A0A] border-t border-white/10 px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--fg-dim)] font-sans">
        <p>© {new Date().getFullYear()} {siteConfig.brandName} • {siteConfig.descriptor}</p>
        <div className="flex items-center gap-6">
          <p>{siteConfig.city}, {siteConfig.country}</p>
          <Link href="/privacy" className="hover:text-[#F6F2E6] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0A0A0A] border-t border-[var(--line)] overflow-hidden w-full max-w-full lg:h-screen lg:min-h-screen flex flex-col justify-between">
      {/* Main Footer Body: Left Content + Right Full-Height Portrait */}
      <div className="grid lg:grid-cols-12 flex-1 w-full h-full min-h-0">
        {/* Left Column (CTA + [Q][S][C] columns + legal) */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 h-full">
          {/* Top: Giant CTA headline */}
          <div>
            <Link href="/contact" className="group inline-block">
              <h2
                className="font-condensed uppercase text-[#F6F2E6] leading-none tracking-tight group-hover:text-[var(--accent-text)] transition-colors flex items-center gap-2 sm:gap-4 flex-wrap"
                style={{ fontSize: "clamp(2.5rem, 8.5vw, 8.5rem)" }}
              >
                <span>LET&apos;S TALK.</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2 text-[var(--accent-text)]">
                  →
                </span>
              </h2>
            </Link>
          </div>

          {/* Middle: [Q] [S] [C] columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 border-t border-white/10 my-auto">
            {/* [Q] Quick links */}
            <div>
              <p className="font-mono text-[var(--fg-dim)] text-[11px] sm:text-xs uppercase tracking-widest mb-2.5 sm:mb-4">
                [ Q ]
              </p>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {footerQuickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--fg-muted)] text-[13px] sm:text-sm font-sans hover:text-[#F6F2E6] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* [S] Socials */}
            <div>
              <p className="font-mono text-[var(--fg-dim)] text-[11px] sm:text-xs uppercase tracking-widest mb-2.5 sm:mb-4">
                [ S ]
              </p>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li>
                  <a
                    href={settings?.instagramUrl || "https://instagram.com/zetona_e"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--fg-muted)] text-[13px] sm:text-sm font-sans hover:text-[#F6F2E6] transition-colors inline-flex items-center gap-1"
                  >
                    Instagram
                  </a>
                </li>
                {settings?.facebookUrl && (
                  <li>
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--fg-muted)] text-[13px] sm:text-sm font-sans hover:text-[#F6F2E6] transition-colors inline-flex items-center gap-1"
                    >
                      Facebook
                    </a>
                  </li>
                )}
                {settings?.tiktokUrl && (
                  <li>
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--fg-muted)] text-[13px] sm:text-sm font-sans hover:text-[#F6F2E6] transition-colors inline-flex items-center gap-1"
                    >
                      TikTok
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-text)] text-[13px] sm:text-sm font-sans hover:underline inline-flex items-center gap-1"
                  >
                    WhatsApp ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* [C] Contact */}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-mono text-[var(--fg-dim)] text-[11px] sm:text-xs uppercase tracking-widest mb-2.5 sm:mb-4">
                [ C ]
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs md:text-sm font-sans text-[var(--fg-muted)]">
                <li>{siteConfig.city}, {siteConfig.country}</li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-[#F6F2E6] transition-colors break-all"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F6F2E6] transition-colors"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal line */}
          <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-[var(--fg-dim)] font-sans">
            <p>© {new Date().getFullYear()} {siteConfig.brandName}</p>
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              <Link href="/privacy" className="hover:text-[#F6F2E6] transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-[#F6F2E6] transition-colors">
                Terms & Condition
              </Link>
              <span>•</span>
              <Link href="/admin" className="hover:text-[#2B59FF] text-[#F6F2E6]/70 transition-colors font-mono">
                Admin ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Edge-to-Edge Editorial Portrait on Desktop */}
        <div className="lg:col-span-5 relative w-full h-[280px] sm:h-[350px] lg:h-full overflow-hidden bg-[var(--bg-elevated)]">
          <Image
            src={getOptimizedSrc(footerPhotoSrc || "https://res.cloudinary.com/drgwnkllv/image/upload/v1794171645/zetona/ilzulvfc226tqfjr5jyr.jpg", 1200)}
            alt="Zetona_E Portrait Studio"
            fill
            className="object-cover"
            style={{ objectPosition: "center 15%" }}
            sizes="(min-width:1024px) 45vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </footer>
  );
}
