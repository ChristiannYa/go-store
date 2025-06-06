package auth

import (
	"encoding/json"
	"go-auth/server/config"
	"go-auth/server/models"
	"go-auth/server/services"
	"go-auth/server/utils"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req models.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Invalid JSON format",
		)
		return
	}

	if errors := utils.ValidateInputs(req); errors != nil {
		WriteFieldErrors(
			w,
			http.StatusBadRequest,
			errors,
		)
		return
	}

	resetService := services.NewPasswordResetService(config.DB)
	userService := services.NewUserService(config.DB)
	emailService := services.NewEmailService()

	// Validate reset token
	userID, err := resetService.ValidateResetToken(req.Token)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Invalid or expired reset token",
		)
		return
	}

	// Get user email by ID for confirmation
	user, err := userService.GetUserByID(userID)
	if err != nil || user == nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"User not found",
		)
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to hash bcrypt password",
		)
		return
	}

	// Update user password
	err = userService.UpdatePassword(userID, string(hashedPassword))
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to update password",
		)
		return
	}

	// Mark token as used
	resetService.MarkTokenAsUsed(req.Token)

	// Send confirmation email
	go func() {
		if err := emailService.SendPasswordResetConfirmationEmail(user.Email); err != nil {
			/* Just log the error, don't fail the request */
			log.Printf("Failed to send password reset confirmation email to %s: %v", user.Email, err)
		}
	}()

	// Success reponse regardless of email sending status
	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Password reset successfully",
	)
}
