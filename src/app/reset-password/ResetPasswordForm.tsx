import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ResetPasswordFormProps } from "../definitions";
import { apiClient } from "@/lib/api";

export default function ResetPasswordForm({
  token,
  isLoading,
  setIsLoading,
  errors,
  setErrors,
  setIsSuccess,
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!token) {
      setErrors({ form: "Invalid reset link" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post("/api/auth/reset-password", {
        token,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      const data = await response.json();
      if (data.success) {
        setIsSuccess(true);
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setErrors({
          form: data.message || "Password reset failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrors({
        form: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter new password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="h-4 w-4"
            />
          </button>
        </div>
        {errors.password && (
          <div className="text-red-500 text-sm mt-1">{errors.password}</div>
        )}
      </div>

      <div>
        <label
          htmlFor="confirm_password"
          className="block text-sm font-medium mb-2"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Confirm new password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              className="h-4 w-4"
            />
          </button>
        </div>
        {errors.confirm_password && (
          <div className="text-red-500 text-sm mt-1">
            {errors.confirm_password}
          </div>
        )}
      </div>

      {errors.form && <div className="text-red-500 text-sm">{errors.form}</div>}

      <button
        type="submit"
        disabled={isLoading || !token}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
