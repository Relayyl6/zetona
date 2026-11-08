import Link from "next/link";
import { cookies } from "next/headers";
import { siteConfig } from "@/lib/site-config";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/auth/admin-auth";
import { getAllEnquiries } from "@/lib/db/data-store";
import { AdminDesktopNav, AdminMobileSubNav } from "@/components/admin/AdminNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Zetona_E",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuth = await verifyAdminSessionToken(token);

  // If unauthenticated (e.g. /admin/login page), render cleanly without the admin navigation shell
  if (!isAuth) {
    return <>{children}</>;
  }

  let unhandledCount = 0;
  try {
    const enquiries = await getAllEnquiries();
    unhandledCount = enquiries.filter((e) => !e.handledAt).length;
  } catch (err) {
    // Graceful fallback
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col font-sans">
      {/* Top persistent bar */}
      <header className="border-b border-[var(--line)] bg-[var(--bg-elevated)] sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif text-lg font-medium tracking-tight">
              {siteConfig.brandName} <span className="text-[var(--accent-text)] text-xs font-mono uppercase ml-1">Admin</span>
            </Link>
            <AdminDesktopNav initialCount={unhandledCount} />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
            >
              View site ↗
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="border border-[var(--line-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile top navigation pill strip (Photos, Collections, Messages, Testimonials, Settings) */}
        <AdminMobileSubNav initialCount={unhandledCount} />
      </header>

      {/* Main content - clean single-header navigation without bottom bar */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto pb-12">
        {children}
      </main>
    </div>
  );
}
