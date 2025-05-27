"use client";

import { AuthData } from "@/app/definitions";
import { useState, useEffect } from "react";

export function useAuth() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily disable the current auth check
    // This will be replaced with the new auth system
    console.warn("useAuth: Temporarily disabling auth check");

    // Set as not logged in for now
    setAuthData({ isLoggedIn: false });
    setLoading(false);
  }, []);

  return {
    user: authData?.user,
    isAuthenticated: authData?.isLoggedIn ?? false,
    loading,
    error,
  };
}
