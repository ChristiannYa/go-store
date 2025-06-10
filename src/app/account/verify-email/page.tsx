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
  const [isEmailVerified, setIsEmailVerified] = useState<null | boolean>(null);

  const { user, userIsLoading, userError, refreshUser } = useUser();

  // Pre-populate email when user data loads
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const { sendVerificationCode, verifyEmail, isLoading, error } =
    useEmailVerification();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const sent = await sendVerificationCode(email);
    if (sent) {
      setStep("code");
      setIsEmailVerified(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    const verified = await verifyEmail(email, verificationCode);
    if (verified) {
      setIsEmailVerified(true);

      // Refresh user data
      try {
        await refreshUser();
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }
  };

  const handleEditEmail = () => {
    setIsEmailEditable(true);
  };

  const handleEmailBlur = () => {
    setIsEmailEditable(false);
  };

  if (userIsLoading) {
    /* We could add a user loading state element here if 
    needed but for now it is left empty for cleaner purposes */
    return;
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
        {user?.email_verified === true && isEmailVerified === null ? (
          <div className="text-center opacity-95">
            Your email address is already verified.
          </div>
        ) : step === "email" ? (
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
                  className={`rounded text-white placeholder-gray-400 focus:outline-none transition-colors w-full px-3 py-2 pr-10 ${
                    isEmailEditable
                      ? "bg-gray-700 focus:ring-1 focus:ring-blue-500"
                      : "bg-transparent border border-gray-700/40 cursor-default"
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
          <>
            {!isEmailVerified ? (
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
                  <div>
                    <p className="text-gray-400 text-sm text-center mt-1.5">
                      Code sent to:
                    </p>
                    <p className="text-gray-300 text-center">{email}</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-2 rounded font-medium transition-colors"
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </button>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </form>
            ) : (
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
                  <h2 className="text-xl font-semibold">Email Verified</h2>
                  <p className="text-sm text-gray-300">
                    You may now go to your account page.
                  </p>
                </div>
              </div>
            )}
          </>
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
