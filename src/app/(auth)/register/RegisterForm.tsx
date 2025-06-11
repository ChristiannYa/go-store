"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useRegisterForm } from "@/hooks/useRegisterForm";

export default function RegisterForm() {
  const { formData, errors, isLoading, handleInputChange, handleSubmit } =
    useRegisterForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="form">
      {/* Form-level errors */}
      {errors.form && (
        <div className="form__popup--error__container">
          <p>{errors.form}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="form__label">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Name"
          className="form__input"
          autoComplete="given-name"
        />
        {errors.name && <p className="form__input--error">{errors.name}</p>}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="last_name" className="form__label">
          Last Name
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          value={formData.last_name}
          onChange={handleInputChange}
          placeholder="Last Name"
          className="form__input"
          autoComplete="family-name"
        />
        {errors.last_name && (
          <p className="form__input--error">{errors.last_name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="form__label">
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
        <label htmlFor="password" className="form__label">
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

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm_password" className="form__label">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirm_password"
            name="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirm_password}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className="form__input"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="form__input--password-toggle"
          >
            <FontAwesomeIcon
              width={18}
              icon={showConfirmPassword ? faEyeSlash : faEye}
            />
          </button>
        </div>
        {errors.confirm_password && (
          <p className="form__input--error">{errors.confirm_password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`rounded-md bg-blue-600 text-white w-full py-2 px-4 ${
          isLoading
            ? "cursor-default opacity-40"
            : "hover:bg-blue-700 cursor-pointer"
        }`}
      >
        {isLoading ? "Loading..." : "Register"}
      </button>
    </form>
  );
}
