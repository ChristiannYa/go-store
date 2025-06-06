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

	// Run cleanup immediately on startup
	runCleanup(tokenService, passwordResetService)

	// Run cleanup every 24 hours
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	// Run every 24 hours
	for range ticker.C {
		runCleanup(tokenService, passwordResetService)
	}
}

func runCleanup(
	tokenService *services.TokenService,
	passwordResetService *services.PasswordResetService,
) {
	// Cleanup refresh tokens
	if err := tokenService.CleanupExpiredTokens(); err != nil {
		log.Printf("❌ Refresh token cleanup failed: %v", err)
	}

	// Cleanup password reset tokens
	if err := passwordResetService.CleanupExpiredTokens(); err != nil {
		log.Printf("❌ Password reset token cleanup failed: %v", err)
	}
}
