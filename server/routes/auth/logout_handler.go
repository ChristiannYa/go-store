package auth

import (
	"go-store/server/config"
	"go-store/server/constants"
	"go-store/server/services"
	"net/http"
)

func Logout(w http.ResponseWriter, r *http.Request) {
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
