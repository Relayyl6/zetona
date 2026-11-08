import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--bg)] pt-28 pb-24 px-6 md:px-12"
    >
      <div className="max-w-2xl">
        <h1
          className="font-condensed uppercase text-[var(--fg)] mb-10"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          Privacy Policy
        </h1>

        <div className="space-y-8 font-sans text-[var(--fg-muted)] text-base leading-relaxed">
          <section>
            <h2 className="text-[var(--fg)] font-sans font-medium mb-3">
              Who we are
            </h2>
            <p>
              This website is operated by {siteConfig.brandName}, a studio and portrait
              photographer based in {siteConfig.city}, {siteConfig.country}. For any privacy
              enquiries, contact{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-[var(--accent-text)] hover:text-[var(--accent)] transition-colors"
              >
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-[var(--fg)] font-sans font-medium mb-3">
              What data we collect
            </h2>
            <p>
              When you use the contact form, we collect your name, email address, optional phone
              number, session type, and message. This information is used only to respond to your
              enquiry. We do not share it with third parties except as stated below.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--fg)] font-sans font-medium mb-3">
              Analytics
            </h2>
            <p>
              This site uses cookieless analytics (Cloudflare Web Analytics or Plausible). No
              personal data or cookies are set for analytics purposes. No consent banner is
              required.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--fg)] font-sans font-medium mb-3">
              How long we keep your data
            </h2>
            <p>
              Contact form submissions are retained for up to 12 months, then deleted. You may
              request deletion at any time by emailing{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-[var(--accent-text)] hover:text-[var(--accent)] transition-colors"
              >
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-[var(--fg)] font-sans font-medium mb-3">
              Third-party processors
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-[var(--fg)]">Cloudflare</strong> — hosting, storage, and
                CDN
              </li>
              <li>
                <strong className="text-[var(--fg)]">Nodemailer (Direct SMTP)</strong> — direct email delivery of your
                contact form message
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[var(--fg)] font-sans font-medium mb-3">
              Your rights
            </h2>
            <p>
              Under the Nigeria Data Protection Act 2023 (NDPA) and applicable data protection
              law, you have the right to access, correct, and request deletion of your personal
              data. Contact us at{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-[var(--accent-text)] hover:text-[var(--accent)] transition-colors"
              >
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <p className="text-[var(--fg-dim)] text-sm pt-4 border-t border-[var(--line)]">
            Last updated: November 2026. This policy may be updated periodically.
          </p>
        </div>
      </div>
    </main>
  );
}
