"use client";

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api";

interface TokenContextType {
  accessToken: string | null;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  refreshToken: () => Promise<string | null>;
}

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
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    };

    initializeTokens();
  }, [refreshToken]);

  // Configure API client with token management
  useLayoutEffect(() => {
    apiClient.setTokenGetter(() => accessToken);
    apiClient.setTokenRefreshHandler(refreshToken);
  }, [accessToken, refreshToken]);

  const contextValue: TokenContextType = {
    accessToken,
    isLoading,
    setAccessToken,
    refreshToken,
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};
