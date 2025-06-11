package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"net/url"

	_ "github.com/lib/pq"
)

// Global variable for database connection
var DB *sql.DB

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Creates a PostgreSQL connection string
func (config DBConfig) buildDSN(dbName string) string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		url.QueryEscape(config.Host),
		url.QueryEscape(config.Port),
		url.QueryEscape(config.User),
		url.QueryEscape(config.Password),
		url.QueryEscape(dbName),
		url.QueryEscape(config.SSLMode),
	)
}

// Initializes the database connection and setup
func ConnectDB() {
	config := DBConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSLMODE"),
	}

	validateConfig(config)

	CreateDBIfNotExists(config)
	connectToDatabase(config)
	CreateTables()
	CreateIndexes()
	SeedTables()
}

// Ensures all required environment variables are set
func validateConfig(config DBConfig) {
	if config.Host == "" {
		log.Fatal("❌ DB_HOST environment variable is required")
	}
	if config.Port == "" {
		log.Fatal("❌ DB_PORT environment variable is required")
	}
	if config.User == "" {
		log.Fatal("❌ DB_USER environment variable is required")
	}
	if config.Password == "" {
		log.Fatal("❌ DB_PASSWORD environment variable is required")
	}
	if config.DBName == "" {
		log.Fatal("❌ DB_NAME environment variable is required")
	}
	if config.SSLMode == "" {
		log.Fatal("❌ DB_SSLMODE environment variable is required")
	}
}

// Establishes connection to the application database
func connectToDatabase(config DBConfig) {
	dsn := config.buildDSN(config.DBName)

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Test the connection
	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Failed to ping database:", err)
	}

	log.Println("🔌 Database connected successfully")
}

func CloseDB() {
	if DB != nil {
		if err := DB.Close(); err != nil {
			log.Printf("⚠️ Error closing database connection: %v", err)
		} else {
			log.Println("🔒 Database connection closed")
		}
		// Clear the global variable
		DB = nil
	}
}
