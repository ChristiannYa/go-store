import { apiClient } from "@/lib/api";

export interface SendVerificationCodeRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const emailVerificationApi = {
  // Send email with verification code
  sendCode: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post(
        "/api/auth/send-verification-code",
        {
          email,
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Send verification code error:", error);
      throw error;
    }
  },

  // Verify email with code
  verifyEmail: async (email: string, code: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post("/api/auth/verify-email", {
        email,
        code,
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify email");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  },
};
