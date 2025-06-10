package middleware

import (
	"context"
	"encoding/json"
	"go-store/server/config"
	"go-store/server/models"
	"go-store/server/services"
	"net/http"
	"strings"
)

type contextKey string

const UserIDKey contextKey = "userID"

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(models.AuthResponse{
				Success: false,
				Message: "Authorization header required",
			})
			return
		}

		// Check Bearer token format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(models.AuthResponse{
				Success: false,
				Message: "Invalid authorization header format",
			})
			return
		}

		tokenString := parts[1]
		tokenService := services.NewTokenService(config.DB)

		// Verify token
		claims, err := tokenService.VerifyAccessToken(tokenString)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(models.AuthResponse{
				Success: false,
				Message: "Invalid or expired token",
			})
			return
		}

		// Add user ID to requet context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
