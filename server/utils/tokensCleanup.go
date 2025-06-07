package utils

import (
	"go-auth/server/config"
	"go-auth/server/services"
	"log"
	"time"
)

func StartTokenCleanup() {
	tokenService := services.NewTokenService(config.DB)
	passwordResetService := services.NewPasswordResetService(config.DB)
	emailVerificationService := services.NewEmailVerificationService(config.DB)

	// Run cleanup immediately on startup
	runCleanup(
		tokenService,
		passwordResetService,
		emailVerificationService,
	)

	// Run cleanup every 24 hours
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	// Run every 24 hours
	for range ticker.C {
		runCleanup(
			tokenService,
			passwordResetService,
			emailVerificationService,
		)
	}
}

func runCleanup(
	tokenService *services.TokenService,
	passwordResetService *services.PasswordResetService,
	emailVerificationService *services.EmailVerificationService,
) {
	// Cleanup refresh tokens
	if err := tokenService.CleanupExpiredTokens(); err != nil {
		log.Printf("❌ Refresh token cleanup failed: %v", err)
	}

	// Cleanup password reset tokens
	if err := passwordResetService.CleanupExpiredTokens(); err != nil {
		log.Printf("❌ Password reset token cleanup failed: %v", err)
	}

	// Cleanup email verification tokens
	if err := emailVerificationService.CleanupExpiredTokens(); err != nil {
		log.Printf("❌ Email verification token cleanup failed: %v", err)
	}
}
