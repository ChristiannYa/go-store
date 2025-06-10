import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "./lib/authVerification";
import { apiTimeout } from "./constants/apiCall";

const protectedRoutes = ["/account"];

// Public routes that don't require authentication
// but when the user is logged in, they will be
// redirected to the dashboard
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  const { isAuthenticated } = await verifyAuthentication({
    cookies: req.cookies.toString(),
    timeout: apiTimeout,
  });

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
