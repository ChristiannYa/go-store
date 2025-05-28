package config

import (
	"fmt"
	"log"
)

const (
	UsersTable         = "users"
	RefreshTokensTable = "refresh_tokens"
)

// CreateTables creates all application tables
func CreateTables() {
	tables := map[string]string{
		UsersTable: `
			CREATE TABLE %s (
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

	_, err := DB.Exec(formattedSQL) // We don't need the result, so we ignore it
	if err != nil {
		log.Fatalf("❌ Failed to create %s table: %v", tableName, err)
	}

	log.Printf("☑️ Table '%s' created successfully", tableName)
}

// Check if a table exists in the database
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
