package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/models"
	"go-auth/server/services"
	"go-auth/server/utils"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check for JSON format
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.AuthResponse{
			Success: false,
			Message: "Invalid JSON format",
		})
		return
	}

	// Validate input
	if errors := utils.ValidateInputs(req); errors != nil {
		writeErrorResponse(w, http.StatusBadRequest, errors)
		return
	}

	userService := services.NewUserService(config.DB)

	// Get user details: id, email, and password hash
	user, err := userService.SelectUserLoginDetails(req.Email)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, map[string]string{
			"form": "An error occurred during login",
		})
		return
	}

	// Check if user exists
	if user == nil {
		writeErrorResponse(w, http.StatusBadRequest, map[string]string{
			// Store error message in the form field for ambiguity
			"form": "Invalid email or password",
		})
		return
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, map[string]string{
			// Store error message in the form field for ambiguity
			"form": "Invalid email or password",
		})
		return
	}

	// Create session
	if err := utils.CreateSession(w, user.ID); err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, map[string]string{
			"form": "An error occurred during login",
		})
		return
	}

	// Success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.AuthResponse{
		Success: true,
		Message: "Login successful",
	})
}
