"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/contexts/UserContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import HomeButton from "@/components/HomeButton";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  const { user, userIsLoading, userError } = useUser();

  // Pre-populate email when user data loads
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.email_verified) {
      window.location.href = "/account";
    }
  }, [user]);

  const { sendVerificationCode, verifyEmail, isLoading, error, success } =
    useEmailVerification();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const sent = await sendVerificationCode(email);
    if (sent) {
      setStep("code");
    }
  };

  const handleEditEmail = () => {
    setIsEmailEditable(true);
  };

  const handleEmailBlur = () => {
    setIsEmailEditable(false);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    const verified = await verifyEmail(email, verificationCode);
    if (verified) {
      window.location.href = "/account";
    }
  };

  if (userIsLoading) {
    return (
      <div className="page">
        <div className="text-amber-500">Loading user data...</div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="page">
        <div className="bg-gray-800 p-5 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="text-red-500 mb-4">
            Unable to load user data. Please try logging in again.
          </div>
          <HomeButton />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[400px]">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Email Verification
        </h1>
        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`bg-gray-700 rounded text-white placeholder-gray-400 focus:outline-none transition-colors w-full px-3 py-2 pr-10 ${
                    isEmailEditable
                      ? "focus:ring-1 focus:ring-blue-500"
                      : "cursor-default"
                  }`}
                  placeholder="Enter your email"
                  required
                  readOnly={!isEmailEditable}
                />
                {!isEmailEditable && (
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    title="Edit email"
                  >
                    <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                  </button>
                )}
              </div>
              {user && email === user.email && !isEmailEditable && (
                <p className="text-gray-400 text-xs mt-1">
                  Using your account email address
                </p>
              )}
              {isEmailEditable && (
                <p className="text-blue-400 text-xs mt-1">
                  You can now edit the email address
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-2 rounded font-medium transition-colors"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-gray-700 text-white placeholder-gray-400 text-center text-lg tracking-wide rounded focus:outline-none focus:ring-1 focus:ring-sky-500 w-full px-3 py-2"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-gray-400 text-sm mt-1">
                Code sent to: {email}
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-2 rounded font-medium transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setIsEmailEditable(false); // Reset edit state when going back
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium transition-colors"
            >
              Change Email
            </button>
          </form>
        )}
        {/* Messages */}
        {success && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
            ❌ {error}
          </div>
        )}
        <div className="flex flex-col justify-center items-center mt-2">
          <Link href="/account">
            <p className="link-slate-500">Account</p>
          </Link>
        </div>
        <HomeButton />
      </div>
    </div>
  );
}
