package utils

import (
	"reflect"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	validate.RegisterValidation("password_complexity", validatePasswordComplexity)
	validate.RegisterValidation("alpha_spaces", validateAlphaSpaces)

	// Use JSON field names in validation errors instead of struct field names
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

// Only letters, spaces, hyphens, and apostrophes
func validateAlphaSpaces(fl validator.FieldLevel) bool {
	value := fl.Field().String()

	for _, char := range value {
		if !unicode.IsLetter(char) && char != ' ' && char != '-' && char != '\'' {
			return false
		}
	}
	return true
}

func validatePasswordComplexity(fl validator.FieldLevel) bool {
	password := fl.Field().String()

	if len(password) < 6 {
		return false
	}

	var hasLower, hasUpper, hasDigit, hasSpecial bool

	for _, char := range password {
		switch {
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= '0' && char <= '9':
			hasDigit = true
		case !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')):
			hasSpecial = true
		}

		// Early exit if all conditions are met
		if hasLower && hasUpper && hasDigit && hasSpecial {
			return true
		}
	}

	return hasLower && hasUpper && hasDigit && hasSpecial
}

func ValidateStruct(s any) map[string]string {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	errors := make(map[string]string)
	for _, err := range err.(validator.ValidationErrors) {
		field := err.Field()
		var message string

		switch err.Tag() {
		case "required":
			message = getFieldDisplayName(field) + " is required"
		case "min":
			message = getFieldDisplayName(field) + " must be at least " + err.Param() + " characters"
		case "email":
			message = "Invalid email address"
		case "password_complexity":
			message = "Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		case "eqfield":
			message = "Passwords don't match"
		case "alpha_spaces":
			message = getFieldDisplayName(field) + " can only contain letters, spaces, hyphens, and apostrophes"
		default:
			message = getFieldDisplayName(field) + " is invalid"
		}

		errors[field] = message
	}

	return errors
}

func getFieldDisplayName(field string) string {
	parts := strings.Split(field, "_")
	for i, part := range parts {
		if len(part) > 0 {
			parts[i] = strings.ToUpper(part[:1]) + part[1:]
		}
	}
	return strings.Join(parts, " ")
}
