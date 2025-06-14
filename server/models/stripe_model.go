package models

type CartItem struct {
	/* Must matcn front end's CartItem type */
	ID       int     `json:"id"`
	Quantity int     `json:"quantity"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
}

type StripeUser struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type CreatePaymentIntentRequest struct {
	CartItems []CartItem `json:"cart_items"`
	User      StripeUser `json:"user"`
}

type PaymentIntentResponse struct {
	ClientSecret string     `json:"client_secret"`
	ID           string     `json:"id"`
	Amount       int64      `json:"amount"`
	Currency     string     `json:"currency"`
	CartItems    []CartItem `json:"cart_items"`
}
