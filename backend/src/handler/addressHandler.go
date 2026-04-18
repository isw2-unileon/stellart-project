package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/database/models"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"
	"stellart/backend/src/settings"

	"github.com/go-chi/chi/v5"
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

func (h *AddressHandler) GetAddresses(w http.ResponseWriter, r *http.Request) {
	artistID := chi.URLParam(r, "artistId")

	addresses, err := h.addressService.GetAddressesByProfile(artistID)
	if err != nil {
		http.Error(w, "Failed to fetch addresses: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if addresses == nil {
		addresses = []models.Address{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(addresses)
}

func (h *AddressHandler) UpdateAddress(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var addressDTO dto.CreateShippingAddressDTO

	if err := json.NewDecoder(r.Body).Decode(&addressDTO); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	address := &models.Address{
		ID:         id,
		Label:      addressDTO.AddressLabel,
		Street:     addressDTO.Street,
		City:       addressDTO.City,
		PostalCode: addressDTO.PostalCode,
		Country:    addressDTO.Country,
	}

	if err := h.addressService.UpdateAddress(address); err != nil {
		http.Error(w, "Failed to update address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(address)
}

func (h *AddressHandler) DeleteAddress(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.addressService.DeleteAddress(id); err != nil {
		http.Error(w, "Failed to delete address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Address deleted successfully"})
}
