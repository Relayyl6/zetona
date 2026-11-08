import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/admin-auth";

export async function POST(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(loginUrl, 303);
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(loginUrl, 303);
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
