package services

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"go-auth/server/constants"
	"go-auth/server/models"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenService struct {
	db *sql.DB
}

func NewTokenService(db *sql.DB) *TokenService {
	return &TokenService{db: db}
}

// Generates a short-lived access token
func (s *TokenService) GenerateAccessToken(userID int) (string, error) {
	claims := models.AccessTokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			/* JWT expiration (inside the token) */
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(constants.AccessTokenDuration)),

			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.getAccessTokenSecret())
}

/*
  - Generates a long-lived refresh token and stores
    its hash in the database
*/
func (s *TokenService) GenerateRefreshToken(
	userID int,
	deviceInfo,
	ipAddress string,
) (string, error) {

	// Generate crypptographically secure random token ID
	tokenIDBytes := make([]byte, 16)
	if _, err := rand.Read(tokenIDBytes); err != nil {
		return "", fmt.Errorf("failed to generate token ID: %w", err)
	}
	tokenID := hex.EncodeToString(tokenIDBytes)

	expiresAt := time.Now().Add(constants.RefreshTokenDuration)

	// Create JWT claims with expiration
	claims := models.RefreshTokenClaims{
		UserID:  userID,
		TokenID: tokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Sign the JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.getRefreshTokenSecret())
	if err != nil {
		return "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	// Hash token for secure storage
	hasher := sha256.New()
	hasher.Write([]byte(tokenString))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	// Store token hash in database with metadata
	query := `
		INSERT INTO refresh_tokens (
			user_id, 
			token_hash, 
			expires_at, 
			device_info, 
			ip_address
		) VALUES ($1, $2, $3, $4, $5)
	`

	_, err = s.db.Exec(
		query,
		userID,
		tokenHash,
		expiresAt,
		deviceInfo,
		ipAddress,
	)
	if err != nil {
		return "", fmt.Errorf("failed to store refresh token: %w", err)
	}

	return tokenString, nil
}

/* Cookie expiration has to match JWT expiration */
// Stores the JWT refresh token in an HTTP-only cookie
func (s *TokenService) SetRefreshTokenCookie(w http.ResponseWriter, refreshToken string) {
	isProduction := os.Getenv("GO_ENV") == "production"

	cookie := &http.Cookie{
		Name:     constants.RefreshTokenCookieName,
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(constants.RefreshTokenDuration),
		HttpOnly: true,
		Secure:   isProduction,
		SameSite: func() http.SameSite {
			if isProduction {
				return http.SameSiteStrictMode
			}
			return http.SameSiteLaxMode
		}(),
	}
	http.SetCookie(w, cookie)
}

// Removes the refresh token cookie (for logout)
func (s *TokenService) ClearRefreshTokenCookie(w http.ResponseWriter) {
	isProduction := os.Getenv("GO_ENV") == "production"

	cookie := &http.Cookie{
		Name:     constants.RefreshTokenCookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		MaxAge:   -1,
		Secure:   isProduction,
		SameSite: func() http.SameSite {
			if isProduction {
				return http.SameSiteStrictMode
			}
			return http.SameSiteLaxMode
		}(),
	}
	http.SetCookie(w, cookie)
}

// Parses the refresh token string and returns the claims
func (s *TokenService) RefreshAccessToken(refreshTokenString string) (
	string, error,
) {
	// Parse the refresh token
	claims, err := s.parseRefreshToken(refreshTokenString)
	if err != nil {
		return "", fmt.Errorf("invalid refresh token: %w", err)
	}

	// Validate in database
	isValid, err := s.validateRefreshTokenInDB(refreshTokenString, claims.UserID)
	if err != nil {
		return "", fmt.Errorf("failed to validate refresh token: %w", err)
	}

	if !isValid {
		return "", fmt.Errorf("refresh token not found or expired")
	}

	// Generate a new access token
	return s.GenerateAccessToken(claims.UserID)
}

func (s *TokenService) ValidateRefreshToken(refreshTokenString string) (bool, error) {
	// Parse and validate JWT
	claims, err := s.parseRefreshToken(refreshTokenString)
	if err != nil {
		return false, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Validate in database
	isValid, err := s.validateRefreshTokenInDB(refreshTokenString, claims.UserID)
	if err != nil {
		return false, fmt.Errorf("failed to validate refresh token: %w", err)
	}

	return isValid, nil
}

func (s *TokenService) RevokeRefreshToken(refreshTokenString string) error {
	token, err := jwt.ParseWithClaims(
		refreshTokenString,
		&models.RefreshTokenClaims{},
		func(token *jwt.Token) (any, error) {
			return s.getRefreshTokenSecret(), nil
		},
	)
	if err != nil {
		return fmt.Errorf("invalid refresh token: %w", err)
	}

	claims, ok := token.Claims.(*models.RefreshTokenClaims)
	if !ok {
		return fmt.Errorf("invalid refresh token claims")
	}

	// Hash the specific token to find the exact database record
	hasher := sha256.New()
	hasher.Write([]byte(refreshTokenString))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	// Revoke only the specific token by its hash
	query := `
		UPDATE refresh_tokens 
		SET is_revoked = TRUE 
		WHERE token_hash = $1 
		AND user_id = $2
	`

	result, err := s.db.Exec(query, tokenHash, claims.UserID)
	if err != nil {
		return fmt.Errorf("failed to revoke refresh token: %w", err)
	}

	// Check if any rows were actually updated
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check revocation result: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("refresh token not found or already revoked")
	}

	return nil
}

// Verify access token
func (s *TokenService) VerifyAccessToken(tokenString string) (*models.AccessTokenClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&models.AccessTokenClaims{},
		func(token *jwt.Token) (any, error) {
			if token.Method.Alg() != "HS256" {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.getAccessTokenSecret(), nil
		},
	)

	if err != nil {
		return nil, fmt.Errorf("invalid access token: %w", err)
	}

	if claims, ok := token.Claims.(*models.AccessTokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid access token claims")
}

func (s *TokenService) CleanupExpiredTokens() error {
	query := `
		DELETE FROM refresh_tokens
		WHERE 
			-- Delete expired tokens older than 30 days
			(expires_at < NOW() AND created_at < NOW() - INTERVAL '30 days')
			OR 
			-- Delete revoked tokens older than 30 days
			(is_revoked = TRUE AND created_at < NOW() - INTERVAL '30 days')
  `

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to cleanup tokens: %w", err)
	}
	return nil
}

/*
	- Active sessions
	SELECT * FROM refresh_tokens
	WHERE is_revoked = FALSE AND expires_at > NOW();

	- Users who let sessions expire naturally
	SELECT * FROM refresh_tokens
	WHERE is_revoked = FALSE AND expires_at < NOW();

	- Users who manually logged out
	SELECT * FROM refresh_tokens
	WHERE is_revoked = TRUE;
*/
