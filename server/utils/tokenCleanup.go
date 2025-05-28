package utils

import (
	"go-auth/server/config"
	"go-auth/server/services"
	"log"
	"time"
)

func StartTokenCleanup() {
	tokenService := services.NewTokenService(config.DB)

	// Run cleanup immediately on startup
	if err := tokenService.CleanupExpiredTokens(); err != nil {
		log.Printf("❌ Initial token cleanup failed: %v", err)
	}

	// Run cleanup every 24 hours
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	// Run every 24 hours
	for range ticker.C {
		if err := tokenService.CleanupExpiredTokens(); err != nil {
			log.Printf("❌ Cleanup failed: %v", err)
		}
	}
}
