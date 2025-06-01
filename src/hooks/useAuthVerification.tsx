"use client";

import { useState, useEffect, useCallback } from "react";

interface AuthVerificationResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAuthVerification(): AuthVerificationResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } else {
        // If verify endpoint fails, assume not authenticated
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  return {
    isAuthenticated,
    isLoading,
    error,
    refetch: verifyAuth,
  };
}
