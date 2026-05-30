package handler_test

import (
	"strings"
	"testing"

	"stellart/backend/src/service"
)

func TestStripeService_CreatePaymentIntent_AmountValidation(t *testing.T) {
	svc := service.NewStripeService("")

	_, _, err := svc.CreatePaymentIntent(0, "eur", nil)
	if err == nil {
		t.Fatal("expected error for amount <= 0")
	}
	if !strings.Contains(err.Error(), "amount must be greater than 0") {
		t.Fatalf("unexpected error: %v", err)
	}
}
