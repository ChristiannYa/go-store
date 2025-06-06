package services

import (
	"fmt"
	"net/smtp"
	"os"
	"time"
)

type EmailService struct {
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
	fromEmail    string
}

func NewEmailService() *EmailService {
	return &EmailService{
		smtpHost:     os.Getenv("SMTP_HOST"),
		smtpPort:     os.Getenv("SMTP_PORT"),
		smtpUsername: os.Getenv("SMTP_USERNAME"),
		smtpPassword: os.Getenv("SMTP_PASSWORD"),
		fromEmail:    os.Getenv("FROM_EMAIL"),
	}
}

func (e *EmailService) SendPasswordResetEmail(to, resetToken string) error {
	// SMTP authentication
	auth := smtp.PlainAuth("", e.smtpUsername, e.smtpPassword, e.smtpHost)

	// Email contents
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), resetToken)

	subject := "Password Reset Request"
	body := fmt.Sprintf(`
You've requested a password reset. Click the link below to reset your password:

%s

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Go-Auth Team
`, resetLink)

	// Email message format
	message := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		e.fromEmail, to, subject, body)

	// Send email
	addr := fmt.Sprintf("%s:%s", e.smtpHost, e.smtpPort)
	return smtp.SendMail(addr, auth, e.fromEmail, []string{to}, []byte(message))
}

func (e *EmailService) SendPasswordResetConfirmationEmail(to string) error {
	// SMTP authentication
	auth := smtp.PlainAuth("", e.smtpUsername, e.smtpPassword, e.smtpHost)

	subject := "Password Reset Successful"
	body := fmt.Sprintf(`
Your password has been successfully reset.

If you did not make this change, please contact our support team immediately or reset your password again.

For your security:
- Time: %s
- If this wasn't you, secure your account immediately

Best regards,
Go-Auth Team
`, time.Now().Format("01/02/2006 03:04:05 PM"))

	// Email message format
	message := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		e.fromEmail, to, subject, body)

	// Send email
	addr := fmt.Sprintf("%s:%s", e.smtpHost, e.smtpPort)
	return smtp.SendMail(addr, auth, e.fromEmail, []string{to}, []byte(message))
}
