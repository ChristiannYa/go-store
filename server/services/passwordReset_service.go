package services

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"go-store/constants"
	"time"
)

type PasswordResetService struct {
	db *sql.DB
}

func NewPasswordResetService(db *sql.DB) *PasswordResetService {
	return &PasswordResetService{db: db}
}

func (s *PasswordResetService) GenerateResetToken(userID int) (string, error) {
	// Generate secure random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", fmt.Errorf("failed to generate reset token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	// Hash token for database storage
	hasher := sha256.New()
	hasher.Write([]byte(token))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	// Store in database
	expiresAt := time.Now().Add(constants.PasswordResetDuration)
	query := `
		INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err := s.db.Exec(query, userID, tokenHash, expiresAt)
	if err != nil {
		return "", fmt.Errorf("failed to store reset token: %w", err)
	}

	return token, nil
}

func (s *PasswordResetService) ValidateResetToken(token string) (int, error) {
	// Hash the provided token
	hasher := sha256.New()
	hasher.Write([]byte(token))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	// Check if token exists and is not expired
	var userID int
	query := `
		SELECT user_id FROM password_reset_tokens
		WHERE token_hash = $1 
		AND expires_at > NOW() 
		AND used = FALSE
	` /* Needs index on password_reset_tokens.token_hash */
	err := s.db.QueryRow(query, tokenHash).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("invalid or expired reset token")
		}
		return 0, fmt.Errorf("failed to validate reset token: %w", err)
	}

	return userID, nil
}

func (s *PasswordResetService) MarkTokenAsUsed(token string) error {
	hasher := sha256.New()
	hasher.Write([]byte(token))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	query := `
		UPDATE password_reset_tokens 
		SET used = TRUE 
		WHERE token_hash = $1
	` /* Needs index on password_reset_tokens.token_hash */
	_, err := s.db.Exec(query, tokenHash)
	return err
}

func (s *PasswordResetService) CleanupExpiredTokens() error {
	query := `
		DELETE FROM password_reset_tokens
		WHERE 
			-- Delete expired tokens older than 2 weeks
			(expires_at < NOW() AND created_at < NOW() - INTERVAL '14 days')
			OR 
			-- Delete used tokens older than 2 weeks
			(used = TRUE AND created_at < NOW() - INTERVAL '14 days')
	`

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to cleanup password reset tokens: %w", err)
	}
	return nil
}
