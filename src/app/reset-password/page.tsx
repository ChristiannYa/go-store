"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setErrors({ form: "Invalid reset link. Please request a new one." });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  if (!token && !errors.form) {
    return (
      <div className="page">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex flex-col justify-center items-center">
        <div className="bg-gray-600/25 rounded-[3px] p-6 w-[400px]">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Reset Password
          </h1>

          {!isSuccess ? (
            <>
              <ResetPasswordForm
                token={token}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                errors={errors}
                setErrors={setErrors}
                setIsSuccess={setIsSuccess}
              />
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            // Success message
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-green-500 space-y-2">
                <h2 className="text-xl font-semibold">
                  Password Reset Successfully!
                </h2>
                <p className="text-sm text-gray-300">
                  Your password has been updated. You can now close this window
                  and log in with your new password.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
