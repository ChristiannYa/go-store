package user

import (
	"encoding/json"
	"go-store/server/models"
	"net/http"
)

// For error responses
func WriteMessageResponse(
	w http.ResponseWriter,
	statusCode int,
	message string,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

// For user data responses
func WriteUserResponse(
	w http.ResponseWriter,
	statusCode int,
	user *models.User,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(user)
}
