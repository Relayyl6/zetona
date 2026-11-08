"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SiteSettingsDTO } from "@/lib/db/queries";

interface FooterProps {
  settings?: Pick<SiteSettingsDTO, "instagramUrl" | "facebookUrl" | "tiktokUrl" | "xUrl">;
}

const footerQuickLinks = [
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const clientAvatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
];

/**
 * Footer: P9 pattern — Giant LET'S TALK. → + [Q][S][C] columns + Right Editorial Portrait
 * Source: Image 2 (Kristin Watson reference) & docs/DESIGN.md §5
 * Automatically hides the duplicate CTA on /contact screen.
 */
export function Footer({ settings }: FooterProps) {
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";

  const socials = [
    settings?.instagramUrl && { label: "Instagram", href: settings.instagramUrl },
    settings?.facebookUrl && { label: "Facebook", href: settings.facebookUrl },
    settings?.tiktokUrl && { label: "TikTok", href: settings.tiktokUrl },
    settings?.xUrl && { label: "X", href: settings.xUrl },
  ].filter(Boolean) as { label: string; href: string }[];

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
    <footer className="bg-[#0A0A0A] border-t border-[var(--line)] overflow-hidden">
      {/* Top Client Avatars Bar matching Image 2 */}
      <div className="border-b border-white/5 py-4 px-6 md:px-12 flex justify-center items-center">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {clientAvatars.map((src, i) => (
            <div
              key={i}
              className="w-9 h-9 md:w-10 md:h-10 rounded overflow-hidden relative opacity-70 hover:opacity-100 transition-opacity ring-1 ring-white/10"
            >
              <Image src={src} alt="Client avatar" fill className="object-cover" sizes="40px" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Body: Left Content + Right Full-Height Portrait */}
      <div className="grid lg:grid-cols-12 min-h-[70vh]">
        {/* Left Column (CTA + [Q][S][C] columns) */}
        <div className="lg:col-span-7 p-6 md:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
          {/* Giant CTA headline */}
          <div>
            <Link href="/contact" className="group inline-block">
              <h2
                className="font-condensed uppercase text-[#F6F2E6] leading-none tracking-tight group-hover:text-[var(--accent-text)] transition-colors flex items-center gap-3 sm:gap-6 flex-wrap"
                style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)" }}
              >
                <span>LET&apos;S TALK.</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-3 text-[var(--accent-text)]">
                  →
                </span>
              </h2>
            </Link>
          </div>

          {/* [Q] [S] [C] columns (matching Image 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-16 pb-8 border-t border-white/10 mt-12">
            {/* [Q] Quick links */}
            <div>
              <p className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-4">
                [ Q ]
              </p>
              <ul className="space-y-2.5">
                {footerQuickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--fg-muted)] text-sm font-sans hover:text-[#F6F2E6] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* [S] Socials */}
            <div>
              <p className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-4">
                [ S ]
              </p>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--fg-muted)] text-sm font-sans hover:text-[#F6F2E6] transition-colors inline-flex items-center gap-1"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--fg-muted)] text-sm font-sans hover:text-[#F6F2E6] transition-colors inline-flex items-center gap-1"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-text)] text-sm font-sans hover:underline inline-flex items-center gap-1"
                  >
                    WhatsApp ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* [C] Contact */}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-4">
                [ C ]
              </p>
              <ul className="space-y-2 text-xs md:text-sm font-sans text-[var(--fg-muted)]">
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
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--fg-dim)] font-sans">
            <p>© {new Date().getFullYear()} {siteConfig.brandName}</p>
            <div className="flex gap-4">
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

        {/* Right Column: Full-Height Editorial Portrait (matching Image 2) */}
        <div className="lg:col-span-5 relative min-h-[350px] lg:min-h-full overflow-hidden bg-[var(--bg-elevated)]">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"
            alt="Zetona_E Portrait Studio"
            fill
            className="object-cover"
            sizes="(min-width:1024px) 42vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </footer>
  );
}
