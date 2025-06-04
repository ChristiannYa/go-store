import { useState } from "react";
import { ForgotPasswordFormProps } from "../definitions";

export default function ForgotPasswordForm({
  isLoading,
  setIsLoading,
  setMessage,
  error,
  setError,
  setIsSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setIsSuccess(true);
      } else if (data.errors) {
        setError(data.errors.email || "Please check your email address");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-black rounded-md w-full px-3 py-2"
          placeholder="Enter your email address"
          required
          disabled={isLoading}
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
