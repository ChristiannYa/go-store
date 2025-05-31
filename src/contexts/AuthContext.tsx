"use client";

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api";
import { useServerStatus } from "./ServerStatusContext";

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isServerOnline, isServerCheckDone } = useServerStatus();

  // Define the token refresh function (memoized to prevent recreation on re-renders)
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

      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }, []);

  // Execute the refresh function on mount to check for existing session
  useLayoutEffect(() => {
    const checkAuth = async () => {
      // Don't do anything until we've checked the server status
      if (!isServerCheckDone) {
        return;
      }

      if (!isServerOnline) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await refreshToken();
        if (!token) {
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [refreshToken, isServerOnline, isServerCheckDone]);

  // Setup API client with token getter and refresh handler
  useLayoutEffect(() => {
    apiClient.setTokenGetter(() => accessToken);
    apiClient.setTokenRefreshHandler(refreshToken);
  }, [accessToken, refreshToken]);

  const contextValue: AuthContextType = {
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    setAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
