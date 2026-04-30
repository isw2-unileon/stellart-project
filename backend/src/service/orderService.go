package service

import (
	"fmt"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/dto"
)

type OrderService struct {
	Repo uis.OrderInterface
}

func NewOrderService(repo uis.OrderInterface) *OrderService {
	return &OrderService{Repo: repo}
}

func (s *OrderService) CreateOrder(buyerID string, req dto.CreateOrderDTO) (*models.Order, error) {
	order := &models.Order{
		ArtworkID:         req.ArtworkID,
		BuyerID:           buyerID,
		SellerID:          req.SellerID,
		ShippingAddressID: &req.ShippingAddressID,
		Amount:            req.Amount,
	}
	return s.Repo.Create(order)
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
