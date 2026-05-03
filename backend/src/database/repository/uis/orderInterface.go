package uis

import "stellart/backend/src/database/models"

type OrderInterface interface {
	Create(order *models.Order) (*models.Order, error)
	GetByID(id string) (*models.Order, error)
	GetOrdersByRole(userID string, role string) ([]models.Order, error)
	Update(order *models.Order) error
}
