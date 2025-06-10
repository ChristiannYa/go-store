package auth

import (
	"go-store/server/config"
	"go-store/server/constants"
	"go-store/server/services"
	"log"
	"net/http"
)

func VerifyToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(constants.RefreshTokenCookieName)
	if err != nil {
		/* Only checks for auth status, not requiring it */
		WriteAuthStatusResponse(w, false)
		return
	}

	tokenService := services.NewTokenService(config.DB)

	/* This query runs on every authentication request,
	it needs index on refresh_tokens.token_hash */
	isValid, err := tokenService.ValidateRefreshToken(cookie.Value)
	if err != nil {
		log.Printf("Token validation error: %v", err)

		/* For this endpoint, treat validation errors as "not authenticated"
		instead of server errors, since this is just a status check */
		WriteAuthStatusResponse(w, false)
		return
	}

	WriteAuthStatusResponse(w, isValid)
}
