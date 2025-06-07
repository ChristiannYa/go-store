package services

import "fmt"

func (s *EmailVerificationService) incrementAttempts(recordID int) {
	query := `
		UPDATE email_verification_tokens 
		SET attempts = attempts + 1 
		WHERE id = $1
	`
	/* We are ignoring the error since this is a non-critical
	operation and the main verification process should continue */
	s.db.Exec(query, recordID)
}

func (s *EmailVerificationService) markAsVerified(
	userID,
	recordID int,
) error {
	// Start transaction
	/* We are using a transaction to maintain consistency across
	the `user` and `email_verification_tokens` tables for
	email verification related columns */
	emailVerifTx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer emailVerifTx.Rollback()

	// Mark verification record as successful
	emailVerifTokenQuery := `
		UPDATE email_verification_tokens 
		SET success = TRUE 
		WHERE id = $1
	`
	_, err = emailVerifTx.Exec(emailVerifTokenQuery, recordID)
	if err != nil {
		return fmt.Errorf("failed to mark verification as successful: %w", err)
	}

	// Update user's email_verified status
	emailVerifUserQuery := `
		UPDATE users 
		SET email_verified = TRUE, 
		    updated_at = CURRENT_TIMESTAMP 
		WHERE id = $1
	`
	_, err = emailVerifTx.Exec(emailVerifUserQuery, userID)
	if err != nil {
		return fmt.Errorf("failed to update user verification status: %w", err)
	}

	// Commit transaction
	if err := emailVerifTx.Commit(); err != nil {
		return fmt.Errorf("failed to commit verification: %w", err)
	}

	return nil
}
