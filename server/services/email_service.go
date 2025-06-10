package services

import "os"

type EmailService struct {
	SmtpHost     string
	SmtpPort     string
	SmtpUsername string
	SmtpPassword string
	FromEmail    string
}

func NewEmailService() *EmailService {
	return &EmailService{
		SmtpHost:     os.Getenv("SMTP_HOST"),
		SmtpPort:     os.Getenv("SMTP_PORT"),
		SmtpUsername: os.Getenv("SMTP_USERNAME"),
		SmtpPassword: os.Getenv("SMTP_PASSWORD"),
		FromEmail:    os.Getenv("FROM_EMAIL"),
	}
}
