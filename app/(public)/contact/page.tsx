import { getSiteSettings, getAllPhotos } from "@/lib/db/data-store";
import { ContactClient } from "@/components/contact/ContactClient";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.brandName} Studio & Portrait Photography`,
  description: "Book a portrait or studio session with Zetona_E in Benin City, Nigeria. Studio and on-location photography.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [settings, photos] = await Promise.all([
    getSiteSettings(),
    getAllPhotos(),
  ]);

  // Resolves the exact photo selected for the footer in Admin Settings (Section 5)
  const footerPhoto = settings.footerPhotoId
    ? photos.find((p) => p.id === settings.footerPhotoId)
    : null;

  const portraitSrc =
    footerPhoto?.displayKey ||
    photos[0]?.displayKey ||
    "https://res.cloudinary.com/drgwnkllv/image/upload/v1794171645/zetona/ilzulvfc226tqfjr5jyr.jpg";

  return <ContactClient portraitSrc={portraitSrc} />;
}
