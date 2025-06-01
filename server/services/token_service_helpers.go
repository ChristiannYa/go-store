package services

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"go-auth/server/models"
	"log"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func (s *TokenService) getAccessTokenSecret() []byte {
	secret := os.Getenv("ACCESS_TOKEN_SECRET")
	if secret == "" {
		log.Fatal("ACCESS_TOKEN_SECRET environment variable is required")
	}
	return []byte(secret)
}

func (s *TokenService) getRefreshTokenSecret() []byte {
	secret := os.Getenv("REFRESH_TOKEN_SECRET")
	if secret == "" {
		log.Fatal("REFRESH_TOKEN_SECRET environment variable is required")
	}
	return []byte(secret)
}

// Helper function for parsing and validating refresh token JWT
func (s *TokenService) parseRefreshToken(refreshTokenString string) (*models.RefreshTokenClaims, error) {
	token, err := jwt.ParseWithClaims(
		refreshTokenString,
		&models.RefreshTokenClaims{},
		func(token *jwt.Token) (any, error) {
			if token.Method.Alg() != "HS256" {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.getRefreshTokenSecret(), nil
		},
	)

	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	claims, ok := token.Claims.(*models.RefreshTokenClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid refresh token claims")
	}

	return claims, nil
}

// Helper function for database validation
func (s *TokenService) validateRefreshTokenInDB(refreshTokenString string, userID int) (bool, error) {
	// Hash the token once
	hasher := sha256.New()
	hasher.Write([]byte(refreshTokenString))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	var exists bool
	query := `
		SELECT EXISTS(
			SELECT 1 FROM refresh_tokens 
			WHERE user_id = $1 
			AND token_hash = $2 
			AND expires_at > NOW() 
			AND is_revoked = FALSE
		)
	`

	err := s.db.QueryRow(query, userID, tokenHash).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to validate refresh token: %w", err)
	}

	return exists, nil
}
