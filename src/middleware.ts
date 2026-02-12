import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18nSettings } from "./i18n/settings";
import createIntlMiddleware from "next-intl/middleware";
import { API_CONFIG, AUTH_CONFIG } from "./utils/config";

// API base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: i18nSettings.locales,
  defaultLocale: i18nSettings.defaultLocale,
});

// Helper function to fetch user data with retry logic
async function fetchUserData(cookieHeader: string, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `🔍 Middleware: Fetching user data (attempt ${attempt + 1}/${
          retries + 1
        })`
      );

      const response = await fetch(
        API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS.ME),
        {
          headers: {
            Cookie: cookieHeader,
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000),
        }
      );

      console.log(
        `🔍 Middleware: API response status: ${response.status} ${response.statusText}`
      );

      if (response.ok) {
        const userData = await response.json();
        console.log("✅ Middleware: User data fetched successfully");
        return userData;
      }

      // If 401/403, no need to retry
      if (response.status === 401 || response.status === 403) {
        console.log(
          `❌ Middleware: Authentication failed (${response.status}), not retrying`
        );
        return null;
      }

      // For other errors, retry after delay
      if (attempt < retries) {
        console.log(
          `⚠️ Middleware: API error ${response.status}, retrying in 500ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(
        `❌ Middleware: Error fetching user data (attempt ${attempt + 1}):`,
        error
      );

      if (attempt < retries) {
        console.log(`⚠️ Middleware: Retrying in 500ms...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        return null;
      }
    }
  }
  return null;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Canonical host: redirect www to apex so auth cookies match domain
  if (host.startsWith("www.")) {
    const apexHost = host.replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.host = apexHost;
    return NextResponse.redirect(url, 308);
  }
  const locale = pathname.split("/")[1] || i18nSettings.defaultLocale;

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
  const tokenName = AUTH_CONFIG.COOKIE_TOKEN;
  const token =
    request.cookies.get(tokenName) || request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  console.log(
    `🔍 Middleware: Path: ${pathname}, Token name: ${tokenName}, Has token: ${!!token}, Has refresh token: ${!!refreshToken}`
  );
  console.warn("🧩 Middleware: Cookie names:", request.cookies.getAll().map(c => c.name));

  // Handle auth pages - redirect if already authenticated (role-based)
  const fullPath = pathname;
  if (
    (fullPath.includes("/login") || fullPath.includes("/register")) &&
    token
  ) {
    console.log(
      "🔍 Middleware: User has token, checking role for auth page redirect"
    );

    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const userData = await fetchUserData(cookieHeader);
      const userRole =
        userData?.role || userData?.user?.role || userData?.position;
      const redirectTo =
        userRole === "admin"
          ? `/${locale}/admin/dashboard`
          : `/${locale}/home`;
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } catch (error) {
      console.error("❌ Middleware: Auth page role check failed:", error);
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  }

  // Handle admin routes - require admin role
  if (fullPath.includes("/admin")) {
    console.log(
      `🔍 Middleware: Admin route detected (${pathname}), checking authentication...`
    );

    if (!token) {
      console.log(
        `❌ Middleware: No token found for admin route ${pathname}, redirecting to login`
      );
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
      // Get all cookies to forward to backend
      const cookieHeader = request.headers.get("cookie") || "";
      console.log("🔍 Middleware: Cookie header length:", cookieHeader.length);

      // Fetch user data with retry logic
      const userData = await fetchUserData(cookieHeader);

      if (!userData) {
        console.log(
          "❌ Middleware: Failed to fetch user data, redirecting to login"
        );
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }

      // Log detailed user information for debugging
      console.log("🔍 Middleware: User data received:", {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        position: userData.position,
        hasUserProperty: !!userData.user,
        userRole: userData.user?.role,
        fullData: userData,
      });

      // Check if user has admin role
      // Try multiple possible field names for role
      const userRole =
        userData.role || userData.user?.role || userData.position;
      console.log(`🔍 Middleware: Determined user role: "${userRole}"`);

      if (userRole !== "admin") {
        console.log(
          `❌ Middleware: User role "${userRole}" is not admin, redirecting to home`
        );
        return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
      }

      console.log("✅ Middleware: Admin access granted");
      return intlMiddleware(request);
    } catch (error) {
      console.error("❌ Middleware: Admin access error:", error);

      // If there's a refresh token, try to refresh before redirecting
      if (refreshToken) {
        console.log("🔍 Middleware: Attempting token refresh...");
        try {
          const refreshResponse = await fetch(
            API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader,
              },
            }
          );

          if (refreshResponse.ok) {
            console.log("✅ Middleware: Token refreshed successfully");
            // The new token will be set via Set-Cookie header
            return intlMiddleware(request);
          }
        } catch (refreshError) {
          console.error("❌ Middleware: Token refresh failed:", refreshError);
        }
      }

      // Redirect to home if error occurs
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  }

  // Handle other authenticated routes (like /count)
  if (pathname.includes("/count") && !token) {
    console.log(
      `❌ Middleware: No token for protected route ${pathname}, redirecting to login`
    );
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Handle home route - require authentication
  if (pathname.includes("/home")) {
    if (!token) {
      console.log(
        `❌ Middleware: No token for home route ${pathname}, redirecting to login`
      );
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // If token exists, validate it to prevent access with an invalid/expired token
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const validateResponse = await fetch(
        API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS.ME),
        {
          method: "GET",
          headers: {
            Cookie: cookieHeader,
          },
          signal: AbortSignal.timeout(2000),
        }
      );

      if (!validateResponse.ok) {
        console.log(
          `❌ Middleware: Token validation failed for home route (${validateResponse.status}), redirecting to login`
        );
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }
    } catch (error) {
      console.log(
        "❌ Middleware: Token validation error for home route, redirecting to login:",
        error
      );
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // For non-admin routes, allow access if token exists
  // This allows users to access /home, /count, etc.
  if (
    token &&
    !pathname.includes("/login") &&
    !pathname.includes("/register")
  ) {
    console.log(
      `🔍 Middleware: User has token, allowing access to non-admin route ${pathname}`
    );

    // Verify token is still valid by making a quick check
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const quickCheck = await fetch(
        API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.VALIDATE),
        {
          method: "POST",
          headers: {
            Cookie: cookieHeader,
          },
          signal: AbortSignal.timeout(2000),
        }
      );

      if (!quickCheck.ok) {
        console.log(
          "⚠️ Middleware: Token validation failed, but allowing access for non-admin route"
        );
        // Still allow access for non-admin routes even if validation fails
        // to prevent blocking users from basic functionality
      }
    } catch (error) {
      console.log(
        "⚠️ Middleware: Token validation error, but allowing access:",
        error
      );
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
