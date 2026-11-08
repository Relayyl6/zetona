import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings, getAllPhotos } from "@/lib/db/data-store";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, photos] = await Promise.all([
    getSiteSettings(),
    getAllPhotos(),
  ]);

  const activePhotoCount = photos.filter((p) => p.status === "published" || p.featuredHome !== undefined).length;

  return (
    <>
      <Header photoCount={activePhotoCount} />
      {children}
      <Footer settings={settings} />
    </>
  );
}
