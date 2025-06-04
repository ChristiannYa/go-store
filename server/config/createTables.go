package config

import (
	"fmt"
	"log"
)

const (
	UsersTable               = "users"
	RefreshTokensTable       = "refresh_tokens"
	PasswordResetTokensTable = "password_reset_tokens"
)

// Create all application tables
func CreateTables() {
	tables := map[string]string{
		UsersTable: `
			CREATE TABLE IF NOT EXISTS %s (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				last_name VARCHAR(255) NOT NULL,
				email VARCHAR(255) UNIQUE NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				auth_provider VARCHAR(50) DEFAULT 'JWT',
				email_verified BOOLEAN DEFAULT FALSE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`,
		RefreshTokensTable: `
			CREATE TABLE IF NOT EXISTS %s (
				id SERIAL PRIMARY KEY,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				token_hash VARCHAR(255) NOT NULL,
				expires_at TIMESTAMP NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				is_revoked BOOLEAN DEFAULT FALSE,
				device_info VARCHAR(255),
				ip_address INET
			)
		`,
		PasswordResetTokensTable: `
			CREATE TABLE IF NOT EXISTS %s (
				id SERIAL PRIMARY KEY,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				token_hash VARCHAR(255) NOT NULL,
				expires_at TIMESTAMP NOT NULL,
				used BOOLEAN DEFAULT FALSE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`,
	}

	// Loop through tables map and conditionally create non-existent tables
	for tableName, createQuery := range tables {
		if tableExists(tableName) {
			log.Printf("ℹ️ Table '%s' already exists", tableName)
			continue
		}

		createTable(tableName, createQuery)
	}
}

// Create a single table
func createTable(tableName, query string) {
	formattedSQL := fmt.Sprintf(query, tableName)

	_, err := DB.Exec(formattedSQL)
	if err != nil {
		log.Fatalf("❌ Failed to create %s table: %v", tableName, err)
	}

	log.Printf("☑️ Table '%s' created successfully", tableName)
}

func tableExists(tableName string) bool {
	var exists bool
	checkQuery := `
    SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = $1
    );
	`

	err := DB.QueryRow(checkQuery, tableName).Scan(&exists)
	if err != nil {
		log.Fatalf("❌ Failed to check if %s table exists: %v", tableName, err)
	}

	return exists
}

// Create table's indexes
func createIndexes() {
	indexes := map[string]string{
		// Password Reset Token Indexes
		"idx_password_reset_tokens_hash": `
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash 
      ON password_reset_tokens(token_hash);
    `,
		"idx_password_reset_tokens_expires": `
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires 
      ON password_reset_tokens(expires_at);
    `,
		"idx_password_reset_tokens_user_id": `
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
      ON password_reset_tokens(user_id);
    `,

		// Refresh Token Indexes
		"idx_refresh_tokens_user_id": `
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
      ON refresh_tokens(user_id);
    `,
		"idx_refresh_tokens_expires": `
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires 
      ON refresh_tokens(expires_at);
    `,
		"idx_refresh_tokens_hash": `
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash 
      ON refresh_tokens(token_hash);
    `, // ← ADD THIS ONE!

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
