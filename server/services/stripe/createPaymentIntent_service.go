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
	user models.StripeUser,
) (*stripe.PaymentIntent, error) {
	customerParams := &stripe.CustomerCreateParams{
		Email: stripe.String(user.Email),
		Name:  stripe.String(user.Name),
	}

	stripeCustomer, err := s.client.V1Customers.Create(ctx, customerParams)
	if err != nil {
		return nil, err
	}

	// Create metadata for cart items
	metadata := make(map[string]string)

	// Add cart summary to metadata
	for i, item := range cartItems {
		prefix := "item_" + strconv.Itoa(i+1) + "_"
		metadata[prefix+"name"] = item.Name
		metadata[prefix+"quantity"] = strconv.Itoa(item.Quantity)
		metadata[prefix+"price"] = strconv.FormatFloat(item.Price, 'f', 2, 64)
	}

	// Add total items count
	metadata["total_items"] = strconv.Itoa(len(cartItems))

	params := &stripe.PaymentIntentCreateParams{
		Amount:   stripe.Int64(amount),
		Currency: stripe.String(currency),
		Customer: stripe.String(stripeCustomer.ID),
		AutomaticPaymentMethods: &stripe.PaymentIntentCreateAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
		Metadata: metadata,
	}

	return s.client.V1PaymentIntents.Create(ctx, params)
}
