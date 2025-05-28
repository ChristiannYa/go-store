package services

import (
	"log"
	"os"
)

func (s *TokenService) getAccessTokenSecret() []byte {
	secret := os.Getenv("ACCESS_TOKEN_SECRET")
	if secret == "" {
		log.Fatal("ACCESS_TOKEN_SECRET environment variable is required")
	}
	return []byte(secret)
}

func (s *TokenService) getRefreshTokenSecret() []byte {
	secret := os.Getenv("REFRESH_TOKEN_SECRET")
	if secret == "" {
		log.Fatal("REFRESH_TOKEN_SECRET environment variable is required")
	}
	return []byte(secret)
}
