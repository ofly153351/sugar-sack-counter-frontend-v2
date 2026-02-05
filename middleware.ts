import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18nSettings } from "./src/i18n/settings";
import createIntlMiddleware from "next-intl/middleware";

// API base URL for role checking
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: i18nSettings.locales,
  defaultLocale: i18nSettings.defaultLocale,
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js)$/) ||
    pathname === "/Logistic.png" ||
    pathname.startsWith("/images/")
  ) {
    return NextResponse.next();
  }

  // Get access token from cookies
  const token = request.cookies.get("access_token");
  const locale = pathname.split("/")[1] || i18nSettings.defaultLocale;

  // Handle login page - redirect if already authenticated
  if (pathname.includes("/login") && token) {
    return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
  }

  // Handle admin routes - require admin role
  if (pathname.includes("/admin")) {
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
      // Call API to check user role
      // Forward all cookies from the request
      const cookieHeader = request.headers.get("cookie") || "";
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Cookie: cookieHeader,
        },
      });

      if (!response.ok) {
        // User not found or unauthorized, redirect to login
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }

      const userData = await response.json();

      // Check if user has admin role
      const userRole = userData.role || userData.user?.role;

      if (userRole !== "admin") {
        // Not an admin, redirect to home
        return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
      }

      // User is admin, allow access
      return intlMiddleware(request);
    } catch (error) {
      console.error("Admin access error:", error);
      // Redirect to home if error
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  }

  // Handle other authenticated routes (optional)
  if (pathname.includes("/count") && !token) {
    // Redirect to login for protected counting pages
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Use next-intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for the ones excluded above
    "/((?!_next|api|static|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js)$).*)",
  ],
};
