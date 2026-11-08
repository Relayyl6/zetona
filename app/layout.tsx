import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "./providers";
import { siteConfig } from "@/lib/site-config";

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    template: `%s | ${siteConfig.brandName}`,
    default: `${siteConfig.brandName} | Studio & Portrait Photographer in Benin City`,
  },
  description:
    "Studio and portrait photography by Zetona_E, based in Benin City, Nigeria. Beautiful moments of beautiful people.",
  openGraph: {
    type: "website",
    siteName: siteConfig.brandName,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NG" suppressHydrationWarning style={{ backgroundColor: "#0A0A0A" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono&display=swap"
        />
      </head>
      <body
        className="bg-[var(--bg)] text-[var(--fg)] font-sans antialiased"
        style={{
          backgroundColor: "#0A0A0A",
          color: "#F6F2E6",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {/* Skip to content link with bulletproof inline fallback to prevent unstyled flash */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium shadow-xl"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
