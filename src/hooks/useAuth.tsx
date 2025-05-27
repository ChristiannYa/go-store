"use client";

import { AuthData } from "@/app/definitions";
import { useState, useEffect } from "react";

export function useAuth() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAuthData(data);
        } else {
          setAuthData({ isLoggedIn: false });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Failed to check authentication");
        setAuthData({ isLoggedIn: false });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user: authData?.user,
    isAuthenticated: authData?.isLoggedIn ?? false,
    loading,
    error,
  };
}
