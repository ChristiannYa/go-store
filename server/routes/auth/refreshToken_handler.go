package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/constants"
	"go-auth/server/models"
	"go-auth/server/services"
	"net/http"
)

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get refresh token from cookie
	cookie, err := r.Cookie(constants.RefreshTokenCookieName)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.AuthResponse{
			Success: false,
			Message: "No refresh token found",
		})
		return
	}

	tokenService := services.NewTokenService(config.DB)

	// Generate new access token using refresh token
	accessToken, err := tokenService.RefreshAccessToken(cookie.Value)
	if err != nil {
		// Clear invalid refresh token cookie
		tokenService.ClearRefreshTokenCookie(w)

		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.AuthResponse{
			Success: false,
			Message: "Invalid or expired refresh token",
		})
		return
	}

	// Success response with new access token
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.AuthResponse{
		Success:     true,
		Message:     "Token refreshed successfully",
		AccessToken: accessToken,
	})
}
