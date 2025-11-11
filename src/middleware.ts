import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token");

  // Handle routes with invalid or missing locale prefix
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0];

  // Get default locale from environment or fallback to 'th'
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "th";

  // If no locale prefix or invalid locale, and not an API/static route, redirect to default locale
  if (
    (!firstSegment || !["en", "th"].includes(firstSegment)) &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/static") &&
    !pathname.startsWith("/favicon.ico")
  ) {
    // If there's an invalid locale, replace it with default locale
    if (firstSegment && !["en", "th"].includes(firstSegment)) {
      const remainingPath = pathSegments.slice(1).join("/");
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/${remainingPath}`, req.url),
      );
    }

    // If no locale prefix, add default locale
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, req.url),
    );
  }

  // ถ้าเข้า /admin แต่ไม่มี token → redirect ไป /login
  if (pathname.includes("/admin") && !token) {
    const locale = pathname.split("/")[1]; // เช่น 'th' หรือ 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // ถ้าเข้า /admin และมี token → ตรวจสอบ role
  if (pathname.includes("/admin") && token) {
    try {
      // เรียก API เพื่อตรวจสอบ role
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const checkRoleResponse = await fetch(
        `${backendUrl}/api/auth/check-role?role=admin`,
        {
          headers: {
            Cookie: `access_token=${token.value}`,
          },
        },
      );

      if (checkRoleResponse.ok) {
        const result = await checkRoleResponse.json();

        // ถ้า user ไม่มี role admin → redirect ไปหน้า unauthorized
        if (!result.hasRole) {
          const locale = pathname.split("/")[1];
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, req.url),
          );
        }

        // ถ้ามี role admin → อนุญาตให้เข้าได้
        return NextResponse.next();
      } else {
        // ถ้า API ตรวจสอบ role ล้มเหลว → redirect ไป login
        const locale = pathname.split("/")[1];
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      }
    } catch (error) {
      console.error("Role check error:", error);
      // ถ้ามี error ในการตรวจสอบ → redirect ไป login
      const locale = pathname.split("/")[1];
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
