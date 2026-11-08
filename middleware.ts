import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "./lib/auth/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifyAdminSessionToken(token);

    // If already logged in and visiting login page, redirect to dashboard
    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // All other /admin routes require authentication
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin") {
        loginUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
