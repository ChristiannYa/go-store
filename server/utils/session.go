package utils

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type SessionPayload struct {
	UserID    int       `json:"userId"`
	ExpiresAt time.Time `json:"expiresAt"`
	jwt.RegisteredClaims
}

const SessionCookieName = "scn"

func getSecretKey() []byte {
	secretKey := os.Getenv("SESSION_TOKEN")
	if secretKey == "" {
		log.Fatal("SESSION_TOKEN environment variable is required")
	}
	return []byte(secretKey)
}

func CreateSession(w http.ResponseWriter, userID int) error {
	expiresAt := time.Now().Add(1 * 24 * time.Hour) // 1 day

	claims := SessionPayload{
		UserID:    userID,
		ExpiresAt: expiresAt,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	tokenString, err := encryptSession(claims)
	if err != nil {
		return fmt.Errorf("failed to sign token: %w", err)
	}

	cookie := &http.Cookie{
		Name:     SessionCookieName,
		Value:    tokenString,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, cookie)
	return nil
}

func VerifySession(r *http.Request) (*SessionPayload, error) {
	// Check if the cookie exists
	cookie, err := r.Cookie(SessionCookieName)
	if err != nil {
		return nil, fmt.Errorf("no session cookie found: %w", err)
	}

	return decryptSession(cookie.Value)
}

func encryptSession(payload SessionPayload) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	secretKey := getSecretKey()
	return token.SignedString(secretKey)
}

func decryptSession(tokenString string) (*SessionPayload, error) {
	secretKey := getSecretKey()
	token, err := jwt.ParseWithClaims(
		tokenString,
		&SessionPayload{},
		func(token *jwt.Token) (any, error) {
			if token.Method.Alg() != "HS256" {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return secretKey, nil
		},
	)

	if err != nil {
		return nil, fmt.Errorf("error parsing token: %w", err)
	}

	if claims, ok := token.Claims.(*SessionPayload); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrInvalidKey
}

func DeleteSession(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     SessionCookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}
