package user

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/middleware"
	"go-auth/server/services"
	"net/http"
)

func GetMe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, ok := middleware.GetUserIDFromContext(r)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Unauthorized",
		})
		return
	}

	userService := services.NewUserService(config.DB)
	user, err := userService.GetUserByID(userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Internal server error",
		})
		return
	}

	if user == nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "User not found",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
