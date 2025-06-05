package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/models"
	"go-auth/server/services"
	"go-auth/server/utils"
	"log"
	"net/http"
)

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.AuthResponse{
			Success: false,
			Message: "Invalid JSON format",
		})
		return
	}

	if errors := utils.ValidateInputs(req); errors != nil {
		writeErrorResponse(w, http.StatusBadRequest, errors)
		return
	}

	userService := services.NewUserService(config.DB)
	resetService := services.NewPasswordResetService(config.DB)
	emailService := services.NewEmailService()

	// Get user by email
	user, err := userService.SelectUserLoginDetails(req.Email)
	if err != nil || user == nil {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(models.AuthResponse{
			Success: true,
			Message: "Password reset email sent to: " + req.Email,
		})
		return
	}

	// Generate reset token
	resetToken, err := resetService.GenerateResetToken(user.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.AuthResponse{
			Success: false,
			Message: "Failed to generate reset token",
		})
		return
	}

	// Send email asynchronously
	go func() {
		if err := emailService.SendPasswordResetEmail(req.Email, resetToken); err != nil {
			log.Printf("Failed to send password reset email to %s: %v", req.Email, err)
		}
	}()

	// Always return success (don't reveal email sending service status)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.AuthResponse{
		Success: true,
		Message: "Password reset email sent to: " + req.Email,
	})
}
