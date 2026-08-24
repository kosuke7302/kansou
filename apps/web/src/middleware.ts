import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "www.kansou-log.com";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  if (host && host.endsWith(".vercel.app")) {
    const url = new URL(req.url);
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
