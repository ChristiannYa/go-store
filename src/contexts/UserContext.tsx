"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@/app/definitions";
import { useTokens } from "@/contexts/TokenContext";
import { apiClient } from "@/lib/api";

interface UserContextType {
  user: User | null;
  userIsLoading: boolean;
  userError: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userIsLoading, setUserIsLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const { accessToken, isLoggingOut, isTokenLoading } = useTokens();

  const fetchUserData = useCallback(async () => {
    if (isTokenLoading) {
      return;
    }

    if (!accessToken) {
      setUserIsLoading(false);
      setUser(null);
      return;
    }

    try {
      setUserError(null);
      const response = await apiClient.get("/api/user/me");

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        setUserError("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserError("Error fetching user data");
      setUser(null);
    } finally {
      setUserIsLoading(false);
    }
  }, [accessToken, isTokenLoading]);

  // Main effect for fetching user data
  useEffect(() => {
    if (!isLoggingOut) {
      fetchUserData();
    }
  }, [fetchUserData, isLoggingOut]);

  // Clear user data immediately when logout starts
  useEffect(() => {
    if (isLoggingOut) {
      setUser(null);
      setUserError(null);
      setUserIsLoading(false);
    }
  }, [isLoggingOut]);

  const value: UserContextType = {
    user,
    userIsLoading,
    userError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
