package services

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"go-auth/server/constants"
	"math/big"
	"time"
)

type EmailVerificationService struct {
	db *sql.DB
}

func NewEmailVerificationService(db *sql.DB) *EmailVerificationService {
	return &EmailVerificationService{db: db}
}

func (s *EmailVerificationService) GenerateVerificationCode(userID int) (string, error) {
	// Generate 6-digit code
	code := ""
	for range 6 {
		digit, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", fmt.Errorf("failed to generate verification code: %w", err)
		}
		code += digit.String()
	}

	// Store in email_verification_tokens table
	expiresAt := time.Now().Add(constants.EmailVerificationDuration)
	query := `
		INSERT INTO email_verification_tokens (
			user_id, 
			verification_code, 
			expires_at, 
			attempts
		) VALUES ($1, $2, $3, 0)
	`

	_, err := s.db.Exec(query, userID, code, expiresAt)
	if err != nil {
		return "", fmt.Errorf("failed to store verification code: %w", err)
	}

	return code, nil
}

func (s *EmailVerificationService) VerifyCode(userID int, code string) error {
	// Get the latest verification record for this user
	var storedCode string
	var expiresAt time.Time
	var attempts int
	var success bool
	var recordID int
	var isExpired bool

	query := `
		SELECT 
			id, 
			verification_code, 
			expires_at, 
			attempts, 
			success,
			(expires_at < NOW()) as is_expired
		FROM email_verification_tokens 
		WHERE user_id = $1 
		ORDER BY created_at DESC 
		LIMIT 1
	`

	err := s.db.QueryRow(query, userID).Scan(
		&recordID,
		&storedCode,
		&expiresAt,
		&attempts,
		&success,
		&isExpired,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("no verification code found")
		}
		return fmt.Errorf("failed to get verification data: %w", err)
	}

	// Check if already successful
	if success {
		return fmt.Errorf("verification code already used")
	}

	// Check attempts limit
	if attempts >= constants.EmailVerificationMaxAttempts {
		return fmt.Errorf("maximum verification attempts exceeded")
	}

	// Check expiration
	if isExpired {
		return fmt.Errorf("verification code expired")
	}

	// Check code match
	if storedCode != code {
		// Increment attempts
		s.incrementAttempts(recordID)
		return fmt.Errorf("invalid verification code")
	}

	// Mark as successful and update user
	return s.markAsVerified(userID, recordID)
}

func (s *EmailVerificationService) IsEmailVerified(userID int) (bool, error) {
	var isVerified bool
	query := `SELECT email_verified FROM users WHERE id = $1`

	err := s.db.QueryRow(query, userID).Scan(&isVerified)
	if err != nil {
		return false, fmt.Errorf("failed to check verification status: %w", err)
	}

	return isVerified, nil
}

func (s *EmailVerificationService) HasPendingVerification(userID int) (bool, error) {
	var count int
	// Check if the user has any unexpired, unused verification codes
	// with remaining attempts available
	query := `
    SELECT COUNT(*)
    FROM email_verification_tokens
    WHERE user_id = $1
    AND expires_at > NOW()        -- Not expired
    AND success = FALSE           -- Not already used
    AND attempts < $2             -- Still has attempts left
  `

	err := s.db.QueryRow(query, userID, constants.EmailVerificationMaxAttempts).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check pending verification: %w", err)
	}

	return count > 0, nil
}

// Cleanup expired verification tokens
func (s *EmailVerificationService) CleanupExpiredTokens() error {
	query := `
		DELETE FROM email_verification_tokens
		WHERE 
			-- Delete expired tokens older than 2 weeks
			(expires_at < NOW() AND created_at < NOW() - INTERVAL '14 days')
			OR 
			-- Delete successful tokens older than 2 weeks
			(success = TRUE AND created_at < NOW() - INTERVAL '14 days')
	`

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to cleanup email verification tokens: %w", err)
	}
	return nil
}
