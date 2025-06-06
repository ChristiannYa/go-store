package auth

import (
	"go-auth/server/config"
	"go-auth/server/constants"
	"go-auth/server/services"
	"net/http"
)

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from cookie
	cookie, err := r.Cookie(constants.RefreshTokenCookieName)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusUnauthorized,
			"No refresh token found",
		)
		return
	}

	tokenService := services.NewTokenService(config.DB)

	// Generate new access token using refresh token
	accessToken, err := tokenService.RefreshAccessToken(cookie.Value)
	if err != nil {
		// Clear invalid refresh token cookie
		tokenService.ClearRefreshTokenCookie(w)

		WriteMessageResponse(
			w,
			http.StatusUnauthorized,
			"Invalid or expired refresh token",
		)
		return
	}

	// Success response with new access token
	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Token refreshed successfully",
		accessToken,
	)
}
