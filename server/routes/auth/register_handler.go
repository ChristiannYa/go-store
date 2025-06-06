package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/models"
	"go-auth/server/services"
	"go-auth/server/utils"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check for JSON format
	var req models.RegisterRequest
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
		WriteFieldErrors(
			w,
			http.StatusBadRequest,
			errors,
		)
		return
	}

	userService := services.NewUserService(config.DB)
	tokenService := services.NewTokenService(config.DB)

	// Check if user email already exists
	userExists, err := userService.UserEmailExists(req.Email)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"An error occurred during registration",
		)
		return
	}

	if userExists {
		WriteFieldErrors(
			w,
			http.StatusConflict,
			map[string]string{
				"email": "Email already registered",
			},
		)
		return
	}

	// Create new user
	userID, err := userService.CreateUser(&req)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"An error occurred during registration",
		)
		return
	}

	// Generate access token
	accessToken, err := tokenService.GenerateAccessToken(userID)
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
	refreshToken, err := tokenService.GenerateRefreshToken(userID, deviceInfo, ipAddress)
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
		http.StatusCreated,
		"User registered successfully",
		accessToken,
	)
}
