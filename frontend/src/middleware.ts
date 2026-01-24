import { NextRequest, NextResponse } from "next/server";

// Session cookie name - must match the one used in API routes
const SESSION_COOKIE_NAME = "__session";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/goals",
  "/tasks",
  "/schedule",
  "/analytics",
  "/settings",
];

// Routes that should redirect to app if user is authenticated
const AUTH_ROUTES = ["/login", "/signup"];

// Public routes that don't require any auth checks
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

/**
 * Middleware for edge authentication
 * Runs before every request to check authentication status
 * 
 * Note: We only check for cookie existence here, not validity.
 * The session cookie is cryptographically signed by Firebase Admin SDK,
 * so if it exists and hasn't expired, it's valid. Full verification
 * happens in API routes and client-side as needed.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and static assets
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = !!sessionCookie;

  // For protected routes: redirect to login if not authenticated
  if (
    PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      // Preserve the original URL to redirect back after login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Cookie exists - allow the request
    // Full session verification happens in API routes/client-side if needed
  }

  // For auth routes: redirect to goals if already authenticated
  if (AUTH_ROUTES.some((route) => pathname === route)) {
    if (isAuthenticated) {
      // Check if there's a redirect URL in the query params
      const redirectUrl = request.nextUrl.searchParams.get("redirect");
      const destination = redirectUrl || "/goals";
      return NextResponse.redirect(new URL(destination, request.url));
    }
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
