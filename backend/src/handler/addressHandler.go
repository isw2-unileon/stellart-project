package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/database/models"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"
	"stellart/backend/src/settings"
)

type AddressHandler struct {
	addressService *service.AddressService
	config         *settings.Config
}

func NewAddressHandler(as *service.AddressService, cfg *settings.Config) AddressHandler {
	return AddressHandler{
		addressService: as,
		config:         cfg,
	}
}

func (h *AddressHandler) CreateAddress(w http.ResponseWriter, r *http.Request) {
	var addressDTO dto.CreateShippingAddressDTO

	if err := json.NewDecoder(r.Body).Decode(&addressDTO); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if addressDTO.ArtistID == "" {
		http.Error(w, "Unauthorized: User ID required in payload", http.StatusUnauthorized)
		return
	}

	address := &models.Address{
		ArtistID:   addressDTO.ArtistID,
		Label:      addressDTO.AddressLabel,
		Street:     addressDTO.Street,
		City:       addressDTO.City,
		PostalCode: addressDTO.PostalCode,
		Country:    addressDTO.Country,
	}

	if err := h.addressService.CreateAddress(address); err != nil {
		http.Error(w, "Failed to create address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(address)
}
