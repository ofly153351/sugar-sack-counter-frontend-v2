import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18nSettings } from "./src/i18n/settings";
import createIntlMiddleware from "next-intl/middleware";

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: i18nSettings.locales,
  defaultLocale: i18nSettings.defaultLocale,
});

export default function middleware(request: NextRequest) {
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

  // Handle authentication for admin routes
  const token = request.cookies.get("access_token");

  if (pathname.includes("/admin") && !token) {
    const locale = pathname.split("/")[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (pathname.includes("/admin") && token) {
    try {
      // Role check logic would go here
      // For now, allow access if token exists
      return intlMiddleware(request);
    } catch (error) {
      console.error("Role check error:", error);
      const locale = pathname.split("/")[1];
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
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
