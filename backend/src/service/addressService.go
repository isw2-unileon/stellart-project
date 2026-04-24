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

func (s *AddressService) GetAddressesByProfile(profileID string) ([]models.Address, error) {
	return s.repo.GetByProfileID(profileID)
}

func (s *AddressService) UpdateAddress(address *models.Address) error {
	return s.repo.Update(address)
}

func (s *AddressService) DeleteAddress(id string) error {
	return s.repo.Delete(id)
}
