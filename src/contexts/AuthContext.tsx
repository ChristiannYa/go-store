"use client";

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { User, AuthData } from "@/app/definitions";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the logout function to prevent recreation on every render
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // Memoize the refreshToken function to prevent recreation on every render
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

  // Setup API client interceptors
  useLayoutEffect(() => {
    apiClient.setTokenGetter(() => accessToken);
    apiClient.setTokenRefreshHandler(refreshToken);
  }, [accessToken, refreshToken]);

  // Check authentication on mount
  useLayoutEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get access token via refresh token
        const token = await refreshToken();

        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch user data with the token
        // The apiClient should now have the token via the interceptor
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data: AuthData = await response.json();
          if (data.isLoggedIn && data.user) {
            setUser(data.user);
          }
        } else {
          console.log("Failed to fetch user data:", response.status);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [refreshToken]);

  const login = (newAccessToken: string) => {
    setAccessToken(newAccessToken);
  };

  const contextValue: AuthContextType = {
    accessToken,
    user,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
