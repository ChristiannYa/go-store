import { apiClient } from "@/lib/api";
import { EmailVerificationResponse } from "@/app/definitions";

export const emailVerificationApi = {
  sendCode: async (email: string): Promise<EmailVerificationResponse> => {
    try {
      const response = await apiClient.post(
        "/api/auth/send-verification-code",
        { email }
      );

      const data: EmailVerificationResponse = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(
          // Handle error messages if present
          data.message ||
            (data.errors
              ? // Handle errors object if present
                Object.values(data.errors).join(", ")
              : // Error message if no errors object
                "Failed to send verification code")
        );
      }
    } catch (error) {
      console.error("Send verification code error:", error);
      throw error;
    }
  },

  verifyEmail: async (
    email: string,
    code: string
  ): Promise<EmailVerificationResponse> => {
    try {
      const response = await apiClient.post("/api/auth/verify-email", {
        email,
        code,
      });

      const data: EmailVerificationResponse = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(
          // Handle error messages if present
          data.message ||
            (data.errors
              ? // Handle errors object if present
                Object.values(data.errors).join(", ")
              : // Error message if no errors object
                "Failed to verify email")
        );
      }
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  },
};
