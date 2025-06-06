package auth

import (
	"go-auth/server/config"
	"go-auth/server/constants"
	"go-auth/server/services"
	"net/http"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	tokenService := services.NewTokenService(config.DB)

	// Get refresh token from cookie
	cookie, err := r.Cookie(constants.RefreshTokenCookieName)
	if err == nil {
		// Revoke refresh token if it exists
		tokenService.RevokeRefreshToken(cookie.Value)
	}

	// Clear refresh token cookie
	tokenService.ClearRefreshTokenCookie(w)

	// Success response
	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Logged out successfully",
	)
}
