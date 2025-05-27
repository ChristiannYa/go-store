import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedRoutes = ["/account"];

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    console.log("Middleware: Transitioning to access token validation");

    // Temprarily redirect all protected routes to login
    // This will be replaced with the new auth system

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
