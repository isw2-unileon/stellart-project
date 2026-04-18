package uis

import "stellart/backend/src/database/models"

type AddressInterface interface {
	Create(address *models.Address) error
}
