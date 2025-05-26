package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/models"
	"go-auth/server/services"
	"go-auth/server/utils"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check if method is POST
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(models.RegisterResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	// Check for JSON format
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.RegisterResponse{
			Success: false,
			Message: "Invalid JSON format",
		})
		return
	}

	// Validate input
	if errors := utils.ValidateStruct(req); errors != nil {
		writeErrorResponse(w, http.StatusBadRequest, errors)
		return
	}

	userService := services.NewUserService(config.DB)

	// Check if user already exists
	userExists, err := userService.UserEmailExists(req.Email)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, map[string]string{
			"form": "An error occurred during registration",
		})
		return
	}

	if userExists {
		writeErrorResponse(w, http.StatusConflict, map[string]string{
			"email": "Email already registered",
		})
		return
	}

	// Create new user
	userID, err := userService.CreateUser(&req)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, map[string]string{
			"form": "An error occurred during registration",
		})
		return
	}

	// Create session
	if err := utils.CreateSession(w, userID); err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, map[string]string{
			"form": "Failed to create session",
		})
		return
	}

	// Success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.RegisterResponse{
		Success: true,
		Message: "Registration successful",
	})
}

/* -- Helper function(s) -- */
func writeErrorResponse(w http.ResponseWriter, statusCode int, errors map[string]string) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.RegisterResponse{
		Success: false,
		Errors:  errors,
	})
}
