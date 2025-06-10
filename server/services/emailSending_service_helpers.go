package services

import (
	"fmt"
	"net/smtp"
)

func (e *EmailService) sendEmail(to, subject, body string) error {
	auth := smtp.PlainAuth("", e.SmtpUsername, e.SmtpPassword, e.SmtpHost)

	message := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		e.FromEmail, to, subject, body)

	addr := fmt.Sprintf("%s:%s", e.SmtpHost, e.SmtpPort)

	return smtp.SendMail(addr, auth, e.FromEmail, []string{to}, []byte(message))
}
