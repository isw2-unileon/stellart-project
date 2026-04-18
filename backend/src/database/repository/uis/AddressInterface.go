package uis

import "stellart/backend/src/database/models"

type AddressInterface interface {
	Create(address *models.Address) error
	GetByProfileID(profileID string) ([]models.Address, error)
	Update(address *models.Address) error
	Delete(id string) error
}
