package user

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/services"
	"go-auth/server/utils"
	"net/http"
)

func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Verify session
	session, err := utils.VerifySession(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"isLoggedIn": false,
			"message":    "Not authenticated",
		})
		return
	}

	userService := services.NewUserService(config.DB)
	user, err := userService.SelectUserByID(session.UserID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"isLoggedIn": false,
			"message":    "Failed to get user data",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"isLoggedIn": true,
		"user":       user,
	})
}
