package service

import (
	"fmt"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"time"
)

type OrderService struct {
	Repo uis.OrderInterface
}

func NewOrderService(repo uis.OrderInterface) *OrderService {
	return &OrderService{Repo: repo}
}

func (s *OrderService) GetOrdersByUser(userID string, role string) ([]models.Order, error) {
	return s.Repo.GetOrdersByRole(userID, role)
}

func (s *OrderService) MarkAsShipped(orderID string, sellerID string, trackingCode string) error {
	order, err := s.Repo.GetByID(orderID)
	if err != nil {
		return err
	}

	if order.SellerID != sellerID {
		return fmt.Errorf("unauthorized: only the seller can ship the order")
	}

	now := time.Now()
	order.Status = "shipped"
	order.TrackingCode = &trackingCode
	order.ShippedAt = &now

	return s.Repo.Update(order)
}

func (s *OrderService) MarkAsDelivered(orderID string, buyerID string) error {
	order, err := s.Repo.GetByID(orderID)
	if err != nil {
		return err
	}

	if order.BuyerID != buyerID {
		return fmt.Errorf("unauthorized: only the buyer can mark the order as delivered")
	}

	now := time.Now()
	order.Status = "delivered"
	order.DeliveredAt = &now

	return s.Repo.Update(order)
}
