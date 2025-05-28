package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func CreateDBIfNotExists(config DBConfig) {
	// Connect to postgres default database to create the project's database
	dsn := config.buildDSN("postgres")

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("❌ Failed to connect to postgres database:", err)
	}
	defer db.Close()

	// Check if database exists
	var exists bool
	query := "SELECT EXISTS(SELECT datname FROM pg_catalog.pg_database WHERE datname = $1)"
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
