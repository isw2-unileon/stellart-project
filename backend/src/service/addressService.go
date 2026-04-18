package service

import (
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/settings"
)

type AddressService struct {
	repo   uis.AddressInterface
	config *settings.Config
}

func NewAddressService(repo uis.AddressInterface, cfg *settings.Config) *AddressService {
	return &AddressService{
		repo:   repo,
		config: cfg,
	}
}

func (s *AddressService) CreateAddress(address *models.Address) error {

	return s.repo.Create(address)
}
