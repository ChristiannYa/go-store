package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type RefreshToken struct {
	ID         int       `json:"id" db:"id"`
	UserID     int       `json:"user_id" db:"user_id"`
	TokenHash  string    `json:"-" db:"token_hash"`
	ExpiresAt  time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	IsRevoked  bool      `json:"is_revoked" db:"is_revoked"`
	DeviceInfo string    `json:"device_info" db:"device_info"`
	IPAddress  string    `json:"ip_address" db:"ip_address"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type AccessTokenClaims struct {
	UserID int `json:"userId"`
	jwt.RegisteredClaims
}

type RefreshTokenClaims struct {
	UserID  int    `json:"userId"`
	TokenID string `json:"tokenId"`
	jwt.RegisteredClaims
}
