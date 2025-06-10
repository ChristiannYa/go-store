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

func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req models.VerifyEmailRequest
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
	verificationService := services.NewEmailVerificationService(config.DB)
	emailService := services.NewEmailService()

	// Get user by email
	user, err := userService.SelectUserLoginDetails(req.Email)
	if err != nil || user == nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"User not found",
		)
		return
	}

	// Check if already verified
	isVerified, err := verificationService.IsEmailVerified(user.ID)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to check verification status",
		)
		return
	}

	if isVerified {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Email already verified",
		)
		return
	}

	// Verify code
	err = verificationService.VerifyCode(user.ID, req.Code)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	// Send confirmation email
	go func() {
		if err := emailService.SendEmailVerificationSuccessEmail(user.Email); err != nil {
			/* Just log the error, don't fail the request */
			log.Printf("Failed to send email verification success email to %s: %v", user.Email, err)
		}
	}()

	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Email verified successfully",
	)
}
