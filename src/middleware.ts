import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/app/utils/checkAuth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedRoutes = ["/account"];

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    console.log("Checking auth for:", path);
    const { isAuthenticated } = await checkAuth(request.cookies);

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
