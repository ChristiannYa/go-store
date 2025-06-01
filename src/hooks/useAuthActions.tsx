import { useCallback } from "react";
import { apiClient } from "@/lib/api";
import { useTokens } from "@/contexts/TokenContext";

export function useAuthActions() {
  const { setAccessToken } = useTokens();

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
