"use client";

import { useState } from "react";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="page">
      <div className="flex flex-col justify-center items-center">
        <div className="bg-gray-600/10 rounded-[3px] p-6 w-[400px]">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Forgot Password
          </h1>

          {!isSuccess ? (
            <>
              <ForgotPasswordForm
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                message={message}
                setMessage={setMessage}
                error={error}
                setError={setError}
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
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
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
                    d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <div className="text-green-500 space-y-2">
                <p className="text-sm text-gray-300">{message}</p>
                <p className="text-xs text-gray-400">
                  Don&apos;t forget to check your spam folder if you don&apos;t
                  see the email.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Link
                  href="/login"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
