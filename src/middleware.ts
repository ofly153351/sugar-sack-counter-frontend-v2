import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token");

  // ถ้าเข้า /admin แต่ไม่มี token → redirect ไป /login
  if (pathname.includes("/admin") && !token) {
    const locale = pathname.split("/")[1]; // เช่น 'th' หรือ 'en'
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
