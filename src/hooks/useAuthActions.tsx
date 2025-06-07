import { useCallback } from "react";
import { apiClient } from "@/lib/api";
import { useTokens } from "@/contexts/TokenContext";
import { useRouter } from "next/navigation";

export function useAuthActions() {
  const { setAccessToken } = useTokens();
  const router = useRouter();

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
      router.push("/");
    }
  }, [setAccessToken, router]);

  return { login, logout };
}
