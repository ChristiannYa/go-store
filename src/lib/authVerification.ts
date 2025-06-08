import { AuthVerificationOptions } from "@/app/definitions";

export async function verifyAuthentication(
  options: AuthVerificationOptions
): Promise<{ isAuthenticated: boolean }> {
  const { timeout = 5000, cookies } = options;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
        signal: AbortSignal.timeout(timeout),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { isAuthenticated: data.isAuthenticated };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error("Middleware auth verification failed:", error);
    return { isAuthenticated: false };
  }
}
