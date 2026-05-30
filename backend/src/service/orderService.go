package service

import (
	"fmt"
	"log"
	"math"

	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/dto"
)

type OrderService struct {
	Repo      uis.OrderInterface
	StripeSvc *StripeService
}

func NewOrderService(repo uis.OrderInterface, stripeSvc *StripeService) *OrderService {
	return &OrderService{Repo: repo, StripeSvc: stripeSvc}
}

// CreateOrderResponse includes the client_secret for Stripe frontend confirmation.
type CreateOrderResponse struct {
	Order        *models.Order `json:"order"`
	ClientSecret string        `json:"client_secret"`
}

func (s *OrderService) CreateOrder(buyerID string, req dto.CreateOrderDTO) (*CreateOrderResponse, error) {
	// 1. Create Stripe PaymentIntent
	amountCents := int64(math.Round(req.Amount * 100))
	metadata := map[string]string{
		"type":       "order",
		"artwork_id": req.ArtworkID,
		"buyer_id":   buyerID,
	}

	piID, clientSecret, err := s.StripeSvc.CreatePaymentIntent(amountCents, "eur", metadata)
	if err != nil {
		log.Printf("[ERROR] CreateOrder - Stripe error: %v", err)
		return nil, fmt.Errorf("stripe: %w", err)
	}

	// 2. Insert order with real payment_intent ID
	order := &models.Order{
		ArtworkID:         req.ArtworkID,
		BuyerID:           buyerID,
		SellerID:          req.SellerID,
		ShippingAddressID: &req.ShippingAddressID,
		Amount:            req.Amount,
		PaymentIntent:     &piID,
	}

	createdOrder, err := s.Repo.Create(order)
	if err != nil {
		return nil, err
	}

	log.Printf("[Order] Created order %s with Stripe PI %s", createdOrder.ID, piID)
	return &CreateOrderResponse{Order: createdOrder, ClientSecret: clientSecret}, nil
}

func (s *OrderService) MarkOrderPaid(paymentIntentID string) error {
	order, err := s.Repo.GetByPaymentIntent(paymentIntentID)
	if err != nil {
		return fmt.Errorf("order not found for PI %s: %w", paymentIntentID, err)
	}
	order.Status = "paid"
	return s.Repo.Update(order)
}

func (s *OrderService) MarkOrderFailed(paymentIntentID string) error {
	order, err := s.Repo.GetByPaymentIntent(paymentIntentID)
	if err != nil {
		return nil // no order for this PI, skip
	}
	order.Status = "failed"
	return s.Repo.Update(order)
}

func (s *OrderService) GetOrdersByUser(userID string, role string) ([]models.Order, error) {
	return s.Repo.GetOrdersByRole(userID, role)
}

func (s *OrderService) MarkAsShipped(orderID string, sellerID string, trackingCode string, carrier string) error {
	order, err := s.Repo.GetByID(orderID)
	if err != nil || order.SellerID != sellerID {
		return fmt.Errorf("unauthorized")
	}

	order.Status = "shipped"
	order.TrackingCode = &trackingCode
	order.Carrier = &carrier
	return s.Repo.Update(order)
}

func (s *OrderService) MarkAsDelivered(orderID string, buyerID string) error {
	order, err := s.Repo.GetByID(orderID)
	if err != nil || order.BuyerID != buyerID {
		return fmt.Errorf("unauthorized")
	}
	order.Status = "delivered"
	return s.Repo.Update(order)
}
