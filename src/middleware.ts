import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/account"];
const publicRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

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
        }
      );

      if (response.ok) {
        const data = await response.json();
        isAuthenticated = data.isAuthenticated;
      }
    }
  } catch (error) {
    console.error("Auth verification error:", error);
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
