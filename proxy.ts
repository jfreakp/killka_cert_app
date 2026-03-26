import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  hasPermission,
  ROUTE_PERMISSIONS,
  type Role,
  type Permission,
} from "@/src/shared/auth/permissions";

const AUTH_PAGES = ["/login", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access protected route → redirect to login
  if (isDashboard && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on auth pages → redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based route protection inside /dashboard
  if (isDashboard && isAuthenticated && token.role) {
    const role = token.role as Role;
    for (const [route, requiredPermission] of ROUTE_PERMISSIONS) {
      if (pathname.startsWith(route)) {
        if (!hasPermission(role, requiredPermission as Permission)) {
          return NextResponse.redirect(new URL("/dashboard?forbidden=1", request.url));
        }
        break;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
