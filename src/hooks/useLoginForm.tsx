"use client";

import { useState } from "react";
import { LoginFormData, AuthResponse } from "@/app/definitions";
import { useTokens } from "@/contexts/TokenContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useTokens();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      const data: AuthResponse = await response.json();

      if (data.success && data.accessToken) {
        // Store the access token in the context
        login(data.accessToken);

        router.push("/");
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setErrors({
          form: "Login failed. Please try again",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        form: "An server connection error occurred while logging in.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, errors, isLoading, handleInputChange, handleSubmit };
}
