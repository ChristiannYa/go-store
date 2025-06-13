package services

import (
	"context"
	"go-store/models"
	"strconv"

	"github.com/stripe/stripe-go/v82"
)

func (s *StripeService) CreatePaymentIntent(
	ctx context.Context,
	amount int64,
	currency string,
	cartItems []models.CartItem,
) (*stripe.PaymentIntent, error) {
	// Create metadata for cart items
	metadata := make(map[string]string)

	// Add cart summary to metadata
	for i, item := range cartItems {
		prefix := "item_" + strconv.Itoa(i) + "_"
		metadata[prefix+"name"] = item.Name
		metadata[prefix+"quantity"] = strconv.Itoa(item.Quantity)
		metadata[prefix+"price"] = strconv.FormatFloat(item.Price, 'f', 2, 64)
	} /* This does the following:
	item_0_name: "Wireless Headphones"
	item_0_quantity: "2"
	item_1_name: "Phone Case"
	item_1_quantity: "1"
	*/

	// Add total items count
	metadata["total_items"] = strconv.Itoa(len(cartItems))

	params := &stripe.PaymentIntentCreateParams{
		Amount:   stripe.Int64(amount),
		Currency: stripe.String(currency),
		AutomaticPaymentMethods: &stripe.PaymentIntentCreateAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
		Metadata: metadata,
	}

	return s.client.V1PaymentIntents.Create(ctx, params)
}
