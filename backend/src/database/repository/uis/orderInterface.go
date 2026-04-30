package uis

import "stellart/backend/src/database/models"

type OrderInterface interface {
	GetByID(id string) (*models.Order, error)
	GetOrdersByRole(userID string, role string) ([]models.Order, error)
	Update(order *models.Order) error
}
