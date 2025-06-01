"use client";

import { useState, useEffect, useCallback } from "react";
import { verifyAuthentication } from "@/lib/authVerification";
import { AuthVerificationHookResult } from "@/app/definitions";

export function useAuthVerification(): AuthVerificationHookResult {
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
