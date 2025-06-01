import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/account"];

// Public routes that don't require authentication
// but when the user is logged in, they will be
// redirected to the dashboard
const publicRoutes = ["/login", "/register"];

// Check if server is available first
async function isServerAvailable(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/health`,
      {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // If server is down, let the client-side handle everything
  const serverAvailable = await isServerAvailable();
  if (!serverAvailable) {
    return NextResponse.next();
  }

  let isAuthenticated = false;

  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refresh_token=${refreshToken}`,
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        isAuthenticated = data.isAuthenticated;
      }
    }
  } catch (error) {
    console.error("Auth verification error:", error);
    isAuthenticated = false;
  }

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
