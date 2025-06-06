package config

import (
	"database/sql"
	"fmt"
	"log"
	"regexp"

	_ "github.com/lib/pq"
)

func CreateDBIfNotExists(config DBConfig) {
	if !isValidDatabaseName(config.DBName) {
		log.Fatal("❌ Invalid database name:", config.DBName)
	}

	// Connect to postgres default database to create the project's database
	dsn := config.buildDSN("postgres")

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("❌ Failed to connect to postgres database:", err)
	}
	defer db.Close()

	// Check if database exists
	var exists bool
	query := `
		SELECT EXISTS(
			SELECT datname 
			FROM pg_catalog.pg_database 
			WHERE datname = $1
		)
	`
	err = db.QueryRow(query, config.DBName).Scan(&exists)
	if err != nil {
		log.Fatal("❌ Failed to check if database exists:", err)
	}

	// Create database if it doesn't exist
	if !exists {
		createQuery := fmt.Sprintf("CREATE DATABASE %s", config.DBName)
		_, err = db.Exec(createQuery)
		if err != nil {
			log.Fatal("❌ Failed to create database:", err)
		}
		log.Printf("☑️ Database '%s' created successfully!", config.DBName)
	} else {
		log.Printf("ℹ️ Database '%s' already exists.", config.DBName)
	}
}

func isValidDatabaseName(name string) bool {
	// PostgreSQL identifier rules: start with letter/underscore,
	// contain only letters, digits, underscores, max 63 chars
	matched, _ := regexp.MatchString(`^[a-zA-Z_][a-zA-Z0-9_]*$`, name)
	return matched && len(name) <= 63
}
