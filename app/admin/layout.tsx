import Link from "next/link";
import { cookies } from "next/headers";
import { siteConfig } from "@/lib/site-config";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/auth/admin-auth";
import { getAllEnquiries } from "@/lib/db/data-store";
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
      <header className="border-b border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-serif text-lg font-medium tracking-tight">
            {siteConfig.brandName} <span className="text-[var(--accent-text)] text-xs font-mono uppercase ml-1">Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--fg-muted)]">
            <Link href="/admin" className="hover:text-[var(--fg)] transition-colors">
              Photos
            </Link>
            <Link href="/admin/collections" className="hover:text-[var(--fg)] transition-colors">
              Collections
            </Link>
            <Link href="/admin/enquiries" className="hover:text-[var(--fg)] transition-colors flex items-center gap-1.5">
              <span>Messages</span>
              {unhandledCount > 0 && (
                <span className="bg-[var(--accent)] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                  {unhandledCount}
                </span>
              )}
            </Link>
            <Link href="/admin/settings" className="hover:text-[var(--fg)] transition-colors">
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
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
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto pb-24 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom navigation bar */}
      <nav
        aria-label="Admin mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 flex items-center justify-around z-40 text-xs font-medium text-[var(--fg-muted)]"
      >
        <Link href="/admin" className="flex flex-col items-center gap-1 hover:text-[var(--fg)]">
          <span>📷</span>
          <span>Photos</span>
        </Link>
        <Link href="/admin/collections" className="flex flex-col items-center gap-1 hover:text-[var(--fg)]">
          <span>📁</span>
          <span>Collections</span>
        </Link>
        <Link href="/admin/enquiries" className="flex flex-col items-center gap-1 hover:text-[var(--fg)] relative">
          <span>✉️</span>
          <span>Messages</span>
          {unhandledCount > 0 && (
            <span className="absolute -top-1 right-3 bg-[var(--accent)] text-white text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unhandledCount}
            </span>
          )}
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center gap-1 hover:text-[var(--fg)]">
          <span>⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
