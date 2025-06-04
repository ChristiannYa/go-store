package models

import "time"

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

type UserLogin struct {
	ID           int    `json:"id" db:"id"`
	Email        string `json:"email" db:"email" validate:"required,email"`
	PasswordHash string `json:"-" db:"password_hash"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type RegisterRequest struct {
	Name            string `json:"name" validate:"required,min=2,alpha_spaces"`
	LastName        string `json:"last_name" validate:"required,min=2,alpha_spaces"`
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,password_complexity"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}

type AuthResponse struct {
	Success     bool              `json:"success"`
	Message     string            `json:"message,omitempty"`
	Errors      map[string]string `json:"errors,omitempty"`
	AccessToken string            `json:"accessToken,omitempty"`
}

type UserMeResponse struct {
	User *User `json:"user,omitempty"`
}

type ResetPasswordRequest struct {
	Token           string `json:"token" validate:"required"`
	Password        string `json:"password" validate:"required,password_complexity"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}
