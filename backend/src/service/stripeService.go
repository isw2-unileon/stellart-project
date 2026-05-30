package service

import (
	"context"
	"fmt"
	"log"

	stripe "github.com/stripe/stripe-go/v82"
)

type StripeService struct {
	client *stripe.Client
}

func NewStripeService(secretKey string) *StripeService {
	if secretKey == "" {
		log.Println("[Stripe] WARNING: STRIPE_SECRET_KEY is empty — payments will fail")
	}
	return &StripeService{
		client: stripe.NewClient(secretKey),
	}
}

// CreatePaymentIntent creates a Stripe PaymentIntent and returns the ID + client secret.
// amount is in the smallest currency unit (e.g. cents for USD).
// metadata is optional key-value pairs stored on the intent (e.g. commission_id, order_id).
func (s *StripeService) CreatePaymentIntent(amount int64, currency string, metadata map[string]string) (string, string, error) {
	if amount <= 0 {
		return "", "", fmt.Errorf("amount must be greater than 0")
	}
	if currency == "" {
		currency = "usd"
	}

	params := &stripe.PaymentIntentCreateParams{
		Amount:   stripe.Int64(amount),
		Currency: stripe.String(currency),
		AutomaticPaymentMethods: &stripe.PaymentIntentCreateAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	if len(metadata) > 0 {
		params.Metadata = make(map[string]string, len(metadata))
		for k, v := range metadata {
			params.Metadata[k] = v
		}
	}

	pi, err := s.client.V1PaymentIntents.Create(context.TODO(), params)
	if err != nil {
		return "", "", fmt.Errorf("stripe: failed to create payment intent: %w", err)
	}

	log.Printf("[Stripe] PaymentIntent created: %s (amount: %d %s)", pi.ID, amount, currency)
	return pi.ID, pi.ClientSecret, nil
}

// GetPaymentIntent retrieves a PaymentIntent by ID and returns its current status.
// Useful to verify whether a payment actually succeeded before fulfilling an order.
func (s *StripeService) GetPaymentIntent(id string) (*stripe.PaymentIntent, error) {
	pi, err := s.client.V1PaymentIntents.Retrieve(context.TODO(), id, nil)
	if err != nil {
		return nil, fmt.Errorf("stripe: failed to retrieve payment intent %s: %w", id, err)
	}
	return pi, nil
}

// CreateRefund issues a refund against a PaymentIntent.
// If amountCents is 0, the full amount is refunded.
func (s *StripeService) CreateRefund(paymentIntentID string, amountCents int64) (string, error) {
	params := &stripe.RefundCreateParams{
		PaymentIntent: stripe.String(paymentIntentID),
	}
	if amountCents > 0 {
		params.Amount = stripe.Int64(amountCents)
	}

	r, err := s.client.V1Refunds.Create(context.TODO(), params)
	if err != nil {
		return "", fmt.Errorf("stripe: failed to create refund for %s: %w", paymentIntentID, err)
	}

	log.Printf("[Stripe] Refund created: %s for PaymentIntent %s (amount: %d)", r.ID, paymentIntentID, amountCents)
	return r.ID, nil
}