package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/models"
	"go-auth/server/services"
	"go-auth/server/utils"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check for JSON format
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Invalid JSON format",
		)
		return
	}

	// Validate input
	if errors := utils.ValidateInputs(req); errors != nil {
		WriteFieldErrors(w, http.StatusBadRequest, errors)
		return
	}

	userService := services.NewUserService(config.DB)
	tokenService := services.NewTokenService(config.DB)

	// Get user details: id, email, and password hash
	user, err := userService.SelectUserLoginDetails(req.Email)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"An error occurred during login",
		)
		return
	}

	// Check if user exists
	if user == nil {
		WriteFieldErrors(
			w,
			http.StatusBadRequest,
			/* Store error message in the form field for ambiguity */
			map[string]string{
				"form": "Invalid email or password",
			},
		)
		return
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		WriteFieldErrors(
			w,
			http.StatusBadRequest,
			map[string]string{
				/* Store error message in the form field for ambiguity */
				"form": "Invalid email or password",
			},
		)
		return
	}

	// Generate access token
	accessToken, err := tokenService.GenerateAccessToken(user.ID)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to generate access token",
		)
		return
	}

	// Generate refresh token
	deviceInfo := r.Header.Get("User-Agent")
	ipAddress := utils.GetClientIP(r)
	refreshToken, err := tokenService.GenerateRefreshToken(user.ID, deviceInfo, ipAddress)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to generate refresh token",
		)
		return
	}

	// Set refresh token as HTTP-only cookie
	tokenService.SetRefreshTokenCookie(w, refreshToken)

	// Success response
	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Login successful",
		accessToken,
	)
}
