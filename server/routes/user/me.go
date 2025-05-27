package user

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/middleware"
	"go-auth/server/models"
	"go-auth/server/services"
	"net/http"
)

func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, ok := middleware.GetUserIDFromContext(r)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.UserMeResponse{
			IsLoggedIn: false,
		})
		return
	}

	userService := services.NewUserService(config.DB)

	// Get user details
	user, err := userService.GetUserByID(userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.UserMeResponse{
			IsLoggedIn: false,
		})
		return
	}

	if user == nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.UserMeResponse{
			IsLoggedIn: false,
		})
		return
	}

	// Success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.UserMeResponse{
		IsLoggedIn: true,
		User:       user,
	})
}
