package services

import (
	"database/sql"
	"fmt"
	"go-auth/server/models"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) CreateUser(req *models.RegisterRequest) (
	int, error,
) {
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to hash bcrypt password: %w", err)
	}

	insertUserQuery := `
		INSERT INTO users (
			name, 
			last_name, 
			email, 
			password_hash, 
			created_at, 
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	now := time.Now()
	var userID int
	err = s.db.QueryRow(
		insertUserQuery,
		req.Name,
		req.LastName,
		req.Email,
		string(hashedPassword),
		now,
		now,
	).Scan(&userID)
	if err != nil {
		return 0, fmt.Errorf("failed to create user: %w", err)
	}

	return userID, nil
}

// Simple user existence by email check
func (s *UserService) UserEmailExists(email string) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS(
			SELECT 1 
			FROM users 
			WHERE email = $1
		)
	`

	err := s.db.QueryRow(query, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check user existence: %w", err)
	}

	return exists, nil
}

// Select user login details by email
func (s *UserService) SelectUserLoginDetails(email string) (*models.UserLogin, error) {
	query := `
		SELECT id, email, password_hash 
		FROM users 
		WHERE email = $1
	`
	var user models.UserLogin
	err := s.db.QueryRow(query, email).Scan(&user.ID, &user.Email, &user.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to select user by email: %w", err)
	}
	return &user, nil
}

// Get user by ID
func (s *UserService) GetUserByID(userID int) (*models.User, error) {
	query := `
		SELECT 
		id, 
		name, 
		last_name, 
		email,
		email_verified, 
		created_at, 
		updated_at
		FROM users WHERE id = $1
	`
	var user models.User
	err := s.db.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Name,
		&user.LastName,
		&user.Email,
		&user.EmailVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to select user by ID: %w", err)
	}
	return &user, nil
}

func (s *UserService) UpdatePassword(userID int, hashedPassword string) error {
	query := `UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3`
	_, err := s.db.Exec(query, hashedPassword, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}
