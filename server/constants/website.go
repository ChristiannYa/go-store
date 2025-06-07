package constants

import "time"

const (
	RefreshTokenCookieName = "refresh"

	AccessTokenDuration          = 10 * time.Minute    // 10 minutes
	RefreshTokenDuration         = 14 * 24 * time.Hour // 14 days
	PasswordResetDuration        = 10 * time.Minute    // 10 minutes
	EmailVerificationDuration    = 10 * time.Minute    // 10 minutes
	EmailVerificationMaxAttempts = 3                   // Max 3 verification attempts
)
