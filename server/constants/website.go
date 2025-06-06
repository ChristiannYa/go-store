package constants

import "time"

const (
	RefreshTokenCookieName = "refresh"

	AccessTokenDuration   = 10 * time.Minute    // 10 minutes
	RefreshTokenDuration  = 14 * 24 * time.Hour // 14 days
	PasswordResetDuration = 15 * time.Minute    // 15 minutes
)
