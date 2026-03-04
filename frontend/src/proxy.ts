import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "__session";
const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_ROUTES = [
  "/goals",
  "/tasks",
  "/today",
  "/inbox",
  "/review",
  "/schedule",
  "/analytics",
  "/settings",
];
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/blog",
  "/api",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/sw.js",
  "/robots.txt",
  "/sitemap.xml",
];

function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matchesRoutes(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const isProtectedRoute = matchesRoutes(pathname, PROTECTED_ROUTES);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSession = !!sessionCookie;

  if (isProtectedRoute) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAuthRoute && hasSession) {
    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    const destination = redirectUrl || "/goals";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and images
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
