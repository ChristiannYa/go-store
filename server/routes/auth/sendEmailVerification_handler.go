package auth

import (
	"encoding/json"
	"go-store/config"
	"go-store/models"
	"go-store/services"
	"go-store/utils"
	"log"
	"net/http"
)

func SendVerificationCode(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req models.EmailRequest
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

	// Check if user has pending verification (rate limiting)
	hasPending, err := verificationService.HasPendingVerification(user.ID)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to check pending verification",
		)
		return
	}

	if hasPending {
		WriteMessageResponse(
			w,
			http.StatusTooManyRequests,
			"Verification code already sent and still valid",
		)
		return
	}

	// Generate verification code
	code, err := verificationService.GenerateVerificationCode(user.ID)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to generate verification code",
		)
		return
	}

	// Send email asynchronously
	go func() {
		if err := emailService.SendVerificationEmail(user.Email, code); err != nil {
			log.Printf("Failed to send verification email to %s: %v", user.Email, err)
		}
	}()

	WriteSuccessResponse(
		w,
		http.StatusOK,
		"Verification code sent to your email",
	)
}
