import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/auth/login", "/auth/register", "/api/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get session token from cookies (handling both secure and insecure variants)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If has session and trying to access auth pages, redirect to dashboard
  if (sessionToken && isPublicPath && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
