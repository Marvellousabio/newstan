import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require auth
const PUBLIC_PATHS = new Set(["/login", "/signup", "/_next", "/favicon.ico", "/api/preview"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;
  const auth = req.cookies.get("auth")?.value; // legacy fallback
  const isAuthed = Boolean(session || auth);

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.headers.get('x-forwarded-proto') === 'http') {
    const url = req.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Next internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // If already authenticated, prevent visiting login/signup
  if (isAuthed && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Require auth for all app routes; allow only home + login/signup when unauthenticated
  if (!isAuthed) {
    if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
