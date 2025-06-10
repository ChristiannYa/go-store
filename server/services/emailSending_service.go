package services

import (
	"fmt"
	"go-auth/server/constants"
	"os"
	"time"
)

/* -- Email when user requests a password reset -- */
func (e *EmailService) SendPasswordResetEmail(to, resetToken string) error {
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), resetToken)
	subject := "Password Reset Request"
	body := fmt.Sprintf(`
You've requested a password reset. Click the link below to reset your password:

%s

This link will expire in %.0f minutes.

If you didn't request this, please ignore this email.

Best regards,
Go-Auth Team
`, resetLink, constants.PasswordResetDuration.Minutes())

	return e.sendEmail(to, subject, body)
}

/* -- Confirmation email when user resets their password -- */
func (e *EmailService) SendPasswordResetConfirmationEmail(to string) error {
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

	return e.sendEmail(to, subject, body)
}

/* -- Email when user requests an email verification -- */
func (e *EmailService) SendVerificationEmail(to, code string) error {
	subject := "Email Verification Code"
	body := fmt.Sprintf(`
Your email verification code is: %s

This code will expire in %.0f minutes.

If you didn't create an account, please ignore this email.

Best regards,
Go-Auth Team
`, code, constants.EmailVerificationDuration.Minutes())

	return e.sendEmail(to, subject, body)
}

/* -- Confirmation email when user verifies their email -- */
func (e *EmailService) SendEmailVerificationSuccessEmail(to string) error {
	subject := "Email Verification Successful"
	body := fmt.Sprintf(`
Your email %s has been successfully verified.

If this wasn't you, please contact our support team immediately.

For your security:
- Time: %s
- If this wasn't you, secure your account immediately

Best regards,
Go-Auth Team
`, to, time.Now().Format("01/02/2006 03:04:05 PM"))

	return e.sendEmail(to, subject, body)
}
