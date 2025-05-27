package services

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"go-auth/server/models"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type TokenService struct {
	db *sql.DB
}

func NewTokenService(db *sql.DB) *TokenService {
	return &TokenService{db: db}
}

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

// Generate access token (short-lived, 15 minutes)
func (s *TokenService) GenerateAccessToken(userID int) (string, error) {
	claims := models.AccessTokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.getAccessTokenSecret())
}

// Generate refresh token (long-lived, 30 days)
func (s *TokenService) GenerateRefreshToken(userID int, deviceInfo, ipAddress string) (string, error) {
	// Generate random token ID
	tokenIDBytes := make([]byte, 16)
	if _, err := rand.Read(tokenIDBytes); err != nil {
		return "", fmt.Errorf("failed to generate token ID: %w", err)
	}
	tokenID := hex.EncodeToString(tokenIDBytes)

	expiresAt := time.Now().Add(30 * 24 * time.Hour) // 30 days

	claims := models.RefreshTokenClaims{
		UserID:  userID,
		TokenID: tokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.getRefreshTokenSecret())
	if err != nil {
		return "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	// Hash the token for database storage
	hashedToken, err := bcrypt.GenerateFromPassword([]byte(tokenString), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash refresh token: %w", err)
	}

	// Store in database
	query := `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address)
		VALUES ($1, $2, $3, $4, $5)
	`

	log.Printf("🔍 Inserting refresh token: userID=%d, deviceInfo=%s, ipAddress=%s, expiresAt=%v",
		userID, deviceInfo, ipAddress, expiresAt)

	_, err = s.db.Exec(query, userID, string(hashedToken), expiresAt, deviceInfo, ipAddress)
	if err != nil {
		log.Printf("❌ Database error: %v", err)
		return "", fmt.Errorf("failed to store refresh token: %w", err)
	}

	log.Printf("✅ Refresh token stored successfully")
	return tokenString, nil
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

// Verify and refresh token
func (s *TokenService) RefreshAccessToken(refreshTokenString string) (string, error) {
	// Parse refresh token
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
		return "", fmt.Errorf("invalid refresh token: %w", err)
	}

	claims, ok := token.Claims.(*models.RefreshTokenClaims)
	if !ok || !token.Valid {
		return "", fmt.Errorf("invalid refresh token claims")
	}

	// Verify token exists in database and is not revoked
	var tokenHash string
	var isRevoked bool
	query := `
		SELECT token_hash, is_revoked 
		FROM refresh_tokens 
		WHERE user_id = $1 AND expires_at > NOW() AND is_revoked = FALSE
	`
	rows, err := s.db.Query(query, claims.UserID)
	if err != nil {
		return "", fmt.Errorf("failed to query refresh tokens: %w", err)
	}
	defer rows.Close()

	var validTokenFound bool
	for rows.Next() {
		err := rows.Scan(&tokenHash, &isRevoked)
		if err != nil {
			continue
		}

		// Check if this token matches
		if bcrypt.CompareHashAndPassword([]byte(tokenHash), []byte(refreshTokenString)) == nil {
			validTokenFound = true
			break
		}
	}

	if !validTokenFound {
		return "", fmt.Errorf("refresh token not found or expired")
	}

	// Generate new access token
	return s.GenerateAccessToken(claims.UserID)
}

// Revoke refresh token
func (s *TokenService) RevokeRefreshToken(refreshTokenString string) error {
	// Parse token to get user ID
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

	// Mark token as revoked in database
	query := `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`
	_, err = s.db.Exec(query, claims.UserID)
	if err != nil {
		return fmt.Errorf("failed to revoke refresh token: %w", err)
	}

	return nil
}

// Set refresh token as HTTP-only cookie
func (s *TokenService) SetRefreshTokenCookie(w http.ResponseWriter, refreshToken string) {
	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(30 * 24 * time.Hour), // 30 days
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
}

// Clear refresh token cookie
func (s *TokenService) ClearRefreshTokenCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}
