"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginForm() {
  const { formData, errors, isLoading, handleInputChange, handleSubmit } =
    useLoginForm();

  const [showPassword, setShowPassword] = useState(false);
  return (
    <form onSubmit={handleSubmit} className="form">
      {/* Form-level errors */}
      {errors.form && (
        <div className="form__popup--error__container">
          <p>{errors.form}</p>
        </div>
      )}
      <div>
        <label htmlFor="email" className="form__label sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="form__input"
          autoComplete="email"
        />
        {errors.email && <p className="form__input--error">{errors.email}</p>}
      </div>
      {/* Password */}
      <div>
        <label htmlFor="password" className="form__label sr-only">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="form__input"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="form__input--password-toggle"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.password && (
          <p className="form__input--error">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`rounded-md bg-blue-600 text-white w-full py-2 px-4 ${
          isLoading
            ? "cursor-default opacity-40"
            : "hover:bg-blue-700 cursor-pointer"
        }`}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
