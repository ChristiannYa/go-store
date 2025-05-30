import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useCallback } from "react";

export function useAuthActions() {
  const { setAccessToken } = useAuth();

  const login = useCallback(
    (newAccessToken: string) => {
      setAccessToken(newAccessToken);
    },
    [setAccessToken]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      window.location.href = "/";
    }
  }, [setAccessToken]);

  return { login, logout };
}
