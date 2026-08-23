import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const cookie = req.cookies.get("admin_session")?.value;
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw || cookie !== pw) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
