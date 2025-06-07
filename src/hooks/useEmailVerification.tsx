import { useState } from "react";
import { emailVerificationApi } from "@/lib/emailVerification";

export function useEmailVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sendVerificationCode = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await emailVerificationApi.sendCode(email);
      setSuccess(response.message);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred when sending the email verification code";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await emailVerificationApi.verifyEmail(email, code);
      setSuccess(response.message);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    sendVerificationCode,
    verifyEmail,
    clearMessages,
    isLoading,
    error,
    success,
  };
}
