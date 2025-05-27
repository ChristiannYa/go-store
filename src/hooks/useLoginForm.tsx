"ise client";

import { useState } from "react";
import { LoginFormData, AuthResponse } from "@/app/definitions";

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data: AuthResponse = await response.json();

      if (data.success) {
        window.location.href = "/";
      } else if (data.errors) {
        setErrors(data.errors);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        form: "An error occurred while logging in. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, errors, isLoading, handleInputChange, handleSubmit };
}
