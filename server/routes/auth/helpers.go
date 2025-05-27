package auth

import (
	"encoding/json"
	"go-auth/server/models"
	"net/http"
)

func writeErrorResponse(w http.ResponseWriter, statusCode int, errors map[string]string) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.AuthResponse{
		Success: false,
		Errors:  errors,
	})
}
