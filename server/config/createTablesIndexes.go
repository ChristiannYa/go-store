package config

import "log"

// Create table's indexes
func CreateIndexes() {
	indexes := map[string]string{
		// Password Reset Token Indexes
		"idx_password_reset_tokens_hash": `
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash 
      ON password_reset_tokens(token_hash);
    `,

		// Refresh Token Indexes
		"idx_refresh_tokens_user_id": `
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
      ON refresh_tokens(user_id);
    `,
		"idx_refresh_tokens_hash": `
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash 
      ON refresh_tokens(token_hash);
    `,

		// Email Verification Token Indexes
		"idx_email_verification_tokens_user_created": `
  		CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_created
  		ON email_verification_tokens(user_id, created_at DESC);
		`,

		// Users table already has automatic indexes on:
		// - id (PRIMARY KEY)
		// - email (UNIQUE constraint)
	}

	// Loop through indexes map and conditionally create non-existent indexes
	for indexName, createQuery := range indexes {
		if indexExists(indexName) {
			continue
		}

		_, err := DB.Exec(createQuery)
		if err != nil {
			log.Printf("⚠️ Failed to create index '%s': %v", indexName, err)
		} else {
			log.Printf("☑️ Index '%s' created successfully!", indexName)
		}
	}
}

func indexExists(indexName string) bool {
	var exists bool

	checkQuery := `
		SELECT EXISTS (
			SELECT 1 FROM pg_indexes 
			WHERE schemaname = 'public' 
			AND indexname = $1
		);
	`

	err := DB.QueryRow(checkQuery, indexName).Scan(&exists)
	if err != nil {
		log.Printf("⚠️ Failed to check if index '%s' exists: %v", indexName, err)
		return false
	}

	return exists
}
