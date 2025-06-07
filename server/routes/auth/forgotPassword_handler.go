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
	// Check valid JSON format
	var req models.EmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Invalid JSON format",
		)
		return
	}

	// Validate inputs
	if errors := utils.ValidateInputs(req); errors != nil {
		WriteFieldErrors(
			w,
			http.StatusBadRequest,
			errors,
		)
		return
	}

	userService := services.NewUserService(config.DB)
	resetService := services.NewPasswordResetService(config.DB)
	emailService := services.NewPswEmailService()

	// Get user by email
	user, err := userService.SelectUserLoginDetails(req.Email)
	if err != nil || user == nil {
		WriteSuccessResponse(
			w,
			http.StatusOK,
			"Password reset email sent to: "+req.Email,
		)
		return
	}

	// Generate reset token
	resetToken, err := resetService.GenerateResetToken(user.ID)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to generate reset token",
		)
		return
	}

	// Send email asynchronously
	go func() {
		if err := emailService.SendPasswordResetEmail(req.Email, resetToken); err != nil {
			log.Printf("Failed to send password reset email to %s: %v", req.Email, err)
		}
	}()

	/* Always return success (don't reveal email sending service status) */
	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Password reset email sent to: "+req.Email,
	)
}
