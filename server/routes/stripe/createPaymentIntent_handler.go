package stripe

import (
	"encoding/json"
	"go-store/models"
	"log"
	"math"
	"net/http"

	stripeServices "go-store/services/stripe"
)

func CreatePaymentIntent(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req models.CreatePaymentIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Invalid JSON body",
		)
		log.Println(err)
		return
	}

	// Validate cart items
	if len(req.CartItems) == 0 {
		WriteMessageResponse(
			w,
			http.StatusBadRequest,
			"Cart cannot be empty",
		)
		return
	}

	// Calculate total amount (convert dollars to cents)
	// for security reasons
	var totalAmount int64 = 0
	for _, item := range req.CartItems {
		if item.Quantity <= 0 {
			WriteMessageResponse(
				w,
				http.StatusBadRequest,
				"Item's quantity must be greater than 0",
			)
			return
		}
		if item.Price <= 0 {
			WriteMessageResponse(
				w,
				http.StatusBadRequest,
				"Item's price must be greater than 0",
			)
			return
		}

		// Convert price to cents and multiply by quantity
		itemTotal := int64(math.Round(item.Price * 100 * float64(item.Quantity)))
		totalAmount += itemTotal
	}

	stripeService := stripeServices.NewStripeService()

	// Create payment intent
	currency := "usd"
	paymentIntent, err := stripeService.CreatePaymentIntent(
		/* TODO: Test r.Context() */
		r.Context(),
		totalAmount,
		currency,
		req.CartItems,
	)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to create payment intent",
		)
		return
	}

	// Return payment intent
	WritePaymentIntentResponse(
		w,
		http.StatusOK,
		paymentIntent,
		req.CartItems,
	)
}
