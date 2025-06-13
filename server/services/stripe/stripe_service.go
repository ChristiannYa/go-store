package services

import (
	"os"

	"github.com/stripe/stripe-go/v82"
)

type StripeService struct {
	client *stripe.Client
}

func NewStripeService() *StripeService {
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")

	return &StripeService{
		client: stripe.NewClient(stripeKey),
	}
}
