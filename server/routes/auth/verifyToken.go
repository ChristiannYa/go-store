package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/services"
	"net/http"
)

func VerifyToken(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		/* Only checks for auth status, not requiring it */
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"isAuthenticated": false})
		return
	}

	tokenService := services.NewTokenService(config.DB)

	/*
		This query runs on every authentication request,
		it needs index on refresh_tokens.token_hash
	*/
	isValid := tokenService.ValidateRefreshToken(cookie.Value)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"isAuthenticated": isValid})
}
