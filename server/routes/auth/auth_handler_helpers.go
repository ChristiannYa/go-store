package auth

import (
	"encoding/json"
	"go-store/server/models"
	"net/http"
)

// For field validation errors
func WriteFieldErrors(
	w http.ResponseWriter,
	statusCode int,
	errors map[string]string,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.AuthResponse{
		Success: false,
		Errors:  errors,
	})
}

// For general error messages
func WriteMessageResponse(
	w http.ResponseWriter,
	statusCode int,
	message string,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.AuthResponse{
		Success: false,
		Message: message,
	})
}

// For success responses
func WriteSuccessResponse(
	w http.ResponseWriter,
	statusCode int,
	message string,
	accessToken ...string,
) {
	response := models.AuthResponse{
		Success: true,
		Message: message,
	}
	/* If access token is provided, add it to the response */
	if len(accessToken) > 0 && accessToken[0] != "" {
		response.AccessToken = accessToken[0]
	}

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// For authentication status
func WriteAuthStatusResponse(
	w http.ResponseWriter,
	isAuthenticated bool,
) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{
		"isAuthenticated": isAuthenticated,
	})
}
