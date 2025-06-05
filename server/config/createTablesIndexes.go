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

		// Users table already has automatic indexes on:
		// - id (PRIMARY KEY)
		// - email (UNIQUE constraint)
	}

	// Loop through indexes map and conditionally create non-existent indexes
	for indexName, createQuery := range indexes {
		_, err := DB.Exec(createQuery)
		if err != nil {
			log.Printf("⚠️ Failed to create index '%s': %v", indexName, err)
		} else {
			log.Printf("☑️ Index '%s' created successfully", indexName)
		}
	}
}
