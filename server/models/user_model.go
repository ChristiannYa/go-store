package models

import (
	"time"
)

type User struct {
	ID            int       `json:"id" db:"id"`
	Name          string    `json:"name" db:"name" validate:"required,min=2"`
	LastName      string    `json:"last_name" db:"last_name" validate:"required,min=2"`
	Email         string    `json:"email" db:"email" validate:"required,email"`
	PasswordHash  string    `json:"-" db:"password_hash"`
	AuthProvider  string    `json:"auth_provider" db:"auth_provider"`
	EmailVerified bool      `json:"email_verified" db:"email_verified"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

type RegisterRequest struct {
	Name            string `json:"name" validate:"required,min=2,alpha_spaces"`
	LastName        string `json:"last_name" validate:"required,min=2,alpha_spaces"`
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=6,password_complexity"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}

type RegisterResponse struct {
	Success bool              `json:"success"`
	Message string            `json:"message,omitempty"`
	Errors  map[string]string `json:"errors,omitempty"`
}
