interface AuthVerificationOptions {
  timeout?: number;
  cookies?: string /* For route middleware */;
}

interface AuthVerificationResult {
  isAuthenticated: boolean;
  error?: string;
}

export async function verifyAuthentication(
  options: AuthVerificationOptions = {}
): Promise<AuthVerificationResult> {
  const { timeout = 5000, cookies } = options;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add cookies for middleware
    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
      {
        method: "POST",
        headers,
        credentials: cookies
          ? undefined
          : "include" /* Use cookies header for middleware */,
        signal: AbortSignal.timeout(timeout),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { isAuthenticated: data.isAuthenticated };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error(error);
    return {
      isAuthenticated: false,
      /* User friendly error message */
      error:
        "An error occurred while verifying authentication. Please check your network connection and try again.",
    };
  }
}
