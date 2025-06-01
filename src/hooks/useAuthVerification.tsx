"use client";

import { useState, useEffect, useCallback } from "react";
import { verifyAuthentication } from "@/lib/authVerification";

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
    setIsLoading(true);
    setError(null);

    const result = await verifyAuthentication({
      timeout: 5000,
    });

    setIsAuthenticated(result.isAuthenticated);
    setError(result.error || null);
    setIsLoading(false);
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
