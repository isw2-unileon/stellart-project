package handler

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"stellart/backend/src/service"

	stripe "github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/webhook"
)

type PaymentHandler struct {
	stripeSvc     *service.StripeService
	commissionSvc *service.CommissionService
	orderSvc      *service.OrderService
	webhookSecret string
}

func NewPaymentHandler(stripeSvc *service.StripeService, commissionSvc *service.CommissionService, orderSvc *service.OrderService, webhookSecret string) *PaymentHandler {
	return &PaymentHandler{
		stripeSvc:     stripeSvc,
		commissionSvc: commissionSvc,
		orderSvc:      orderSvc,
		webhookSecret: webhookSecret,
	}
}

// --- POST /payments/create-intent ---

type createIntentRequest struct {
	Amount   float64           `json:"amount"`   // dollars (e.g. 50.00)
	Currency string            `json:"currency"` // e.g. "usd"
	Metadata map[string]string `json:"metadata"` // e.g. {"commission_id": "...", "type": "advance"}
}

type createIntentResponse struct {
	PaymentIntentID string `json:"payment_intent_id"`
	ClientSecret    string `json:"client_secret"`
}

func (h *PaymentHandler) CreateIntent(w http.ResponseWriter, r *http.Request) {
	var req createIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.Amount <= 0 {
		http.Error(w, "Amount must be greater than 0", http.StatusBadRequest)
		return
	}

	// Convert dollars to cents
	amountCents := int64(req.Amount * 100)
	currency := req.Currency
	if currency == "" {
		currency = "eur"
	}

	piID, clientSecret, err := h.stripeSvc.CreatePaymentIntent(amountCents, currency, req.Metadata)
	if err != nil {
		log.Printf("[ERROR] CreateIntent: %v", err)
		http.Error(w, "Failed to create payment intent", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createIntentResponse{
		PaymentIntentID: piID,
		ClientSecret:    clientSecret,
	})
}

// --- POST /webhooks/stripe ---

func (h *PaymentHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	const maxBodyBytes = 65536
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("[Stripe Webhook] Error reading body: %v", err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	// Verify signature if webhook secret is configured
	var event stripe.Event
	if h.webhookSecret != "" {
		event, err = webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), h.webhookSecret)
		if err != nil {
			log.Printf("[Stripe Webhook] Signature verification failed: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	} else {
		// No webhook secret configured — parse without verification (dev only)
		if err := json.Unmarshal(payload, &event); err != nil {
			log.Printf("[Stripe Webhook] Failed to parse event: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	switch event.Type {
	case "payment_intent.succeeded":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
			log.Printf("[Stripe Webhook] Error parsing payment_intent.succeeded: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		log.Printf("[Stripe Webhook] Payment succeeded: %s (amount: %d %s)", pi.ID, pi.Amount, pi.Currency)
		h.handlePaymentSucceeded(&pi)

	case "payment_intent.payment_failed":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err == nil {
			errMsg := "unknown"
			if pi.LastPaymentError != nil {
				errMsg = pi.LastPaymentError.Msg
			}
			log.Printf("[Stripe Webhook] Payment failed: %s — %s", pi.ID, errMsg)
			h.handlePaymentFailed(&pi)
		}

	case "charge.refunded":
		var charge stripe.Charge
		if err := json.Unmarshal(event.Data.Raw, &charge); err == nil {
			log.Printf("[Stripe Webhook] Charge refunded: %s", charge.ID)
			h.handleChargeRefunded(&charge)
		}

	default:
		log.Printf("[Stripe Webhook] Unhandled event type: %s", event.Type)
	}

	w.WriteHeader(http.StatusOK)
}

// handlePaymentSucceeded marks the corresponding payment as paid
// based on metadata attached to the PaymentIntent.
func (h *PaymentHandler) handlePaymentSucceeded(pi *stripe.PaymentIntent) {
	paymentType := pi.Metadata["type"] // "advance", "remaining", or "order"

	switch paymentType {
	case "advance":
		commissionID := pi.Metadata["commission_id"]
		if commissionID == "" {
			return
		}
		if err := h.commissionSvc.MarkPaymentPaid(commissionID); err != nil {
			log.Printf("[Stripe Webhook] Failed to mark advance paid for commission %s: %v", commissionID, err)
		} else {
			log.Printf("[Stripe Webhook] Marked advance as paid for commission %s", commissionID)
		}

	case "remaining":
		commissionID := pi.Metadata["commission_id"]
		if commissionID == "" {
			return
		}
		if err := h.commissionSvc.MarkRemainingPaymentPaid(commissionID); err != nil {
			log.Printf("[Stripe Webhook] Failed to mark remaining paid for commission %s: %v", commissionID, err)
		} else {
			log.Printf("[Stripe Webhook] Marked remaining as paid for commission %s", commissionID)
		}

	case "order":
		if err := h.orderSvc.MarkOrderPaid(pi.ID); err != nil {
			log.Printf("[Stripe Webhook] Failed to mark order paid for PI %s: %v", pi.ID, err)
		} else {
			log.Printf("[Stripe Webhook] Marked order as paid for PI %s", pi.ID)
		}

	default:
		log.Printf("[Stripe Webhook] payment_intent.succeeded with unknown type '%s', PI: %s", paymentType, pi.ID)
	}
}

func (h *PaymentHandler) handlePaymentFailed(pi *stripe.PaymentIntent) {
	paymentType := pi.Metadata["type"]
	if paymentType == "order" {
		if err := h.orderSvc.MarkOrderFailed(pi.ID); err != nil {
			log.Printf("[Stripe Webhook] Failed to mark order failed for PI %s: %v", pi.ID, err)
		}
	}
}

func (h *PaymentHandler) handleChargeRefunded(charge *stripe.Charge) {
	if charge.PaymentIntent == nil {
		return
	}
	piID := charge.PaymentIntent.ID
	log.Printf("[Stripe Webhook] Processing refund for PaymentIntent %s", piID)
	// The refund is already tracked in our DB via ProcessRefund.
	// This webhook confirms Stripe processed it.
}
