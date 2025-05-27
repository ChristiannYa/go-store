import { AuthResult } from "@/app/definitions";

/**
 * This function will be replaced with access token validation
 * For now, we'll make it always return unauthenticated to force
 * the new auth system to handle authentication
 */
export async function checkAuth(): Promise<AuthResult> {
  // TODO: Replace with access token validation
  // For now, return unauthenticated

  return { isAuthenticated: false };
}
