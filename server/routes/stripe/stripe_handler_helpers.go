package stripe

import (
	"encoding/json"
	"net/http"

	"go-store/models"

	"github.com/stripe/stripe-go/v82"
)

// For error responses
func WriteMessageResponse(
	w http.ResponseWriter,
	statusCode int,
	message string,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

// For payment intent responses
func WritePaymentIntentResponse(
	w http.ResponseWriter,
	statusCode int,
	paymentIntent *stripe.PaymentIntent,
	cartItems []models.CartItem,
) {
	response := models.PaymentIntentResponse{
		ClientSecret: paymentIntent.ClientSecret,
		ID:           paymentIntent.ID,
		Amount:       paymentIntent.Amount,
		Currency:     string(paymentIntent.Currency),
		CartItems:    cartItems,
	}

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
