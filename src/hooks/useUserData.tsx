import { useState, useEffect } from "react";
import { User } from "@/app/definitions";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

export function useUserData() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!accessToken) {
        /* Handle edge cases where accessToken is null */
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/api/user/me");

        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          setUser(null);
          setError("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [accessToken]);

  return { user, isLoading, error };
}
