import { cookies } from "next/headers";
import { AuthResult, CookieAccessor } from "@/app/definitions";

/**
 * Checks authentication by looking for the session cookie
 *
 * @param requestCookies Optional cookie accessor for middleware
 */
export async function checkAuth(
  requestCookies?: CookieAccessor
): Promise<AuthResult> {
  const SESSION_COOKIE_NAME = "scn"; // Match backend cookie name

  let sessionCookie;

  // Handle cookies differently based on context
  if (requestCookies) {
    sessionCookie = requestCookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (sessionCookie) {
    return {
      isAuthenticated: true,
    };
  }

  return { isAuthenticated: false };
}
