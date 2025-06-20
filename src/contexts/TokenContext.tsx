"use client";

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api";
import { TokenContextType } from "@/app/definitions";
import { useRouter } from "next/navigation";

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useTokens = () => {
  const tokenContext = useContext(TokenContext);
  if (!tokenContext) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return tokenContext;
};

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const router = useRouter();

  // Token refresh function
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.accessToken) {
          setAccessToken(data.accessToken);
          return data.accessToken;
        }
      }

      setAccessToken(null);
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setAccessToken(null);
      return null;
    }
  }, []);

  // Initial token fetch
  useLayoutEffect(() => {
    const initializeTokens = async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Token initialization failed:", error);
      } finally {
        setIsTokenLoading(false);
      }
    };

    initializeTokens();
  }, [refreshToken]);

  // Configure API client with token management
  useLayoutEffect(() => {
    apiClient.setTokenGetter(() => accessToken);
    apiClient.setTokenRefreshHandler(refreshToken);
  }, [accessToken, refreshToken]);

  const login = useCallback(
    (newAccessToken: string) => {
      setAccessToken(newAccessToken);
      setIsLoggingOut(false);
    },
    [setAccessToken]
  );

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsLogoutSuccessful(true);
        setAccessToken(null);
        router.push("/");
      } else {
        setIsLogoutSuccessful(false);
        setIsLoggingOut(false);
        setLogoutError("An error occurred while logging out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutError("A server connection error occurred while logging out");
      setIsLogoutSuccessful(false);
      setIsLoggingOut(false);
    }
  }, [router]);

  const contextValue: TokenContextType = {
    login,
    refreshToken,
    accessToken,
    setAccessToken,
    isTokenLoading,
    logout,
    isLoggingOut,
    isLogoutSuccessful,
    logoutError,
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};
