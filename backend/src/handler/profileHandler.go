package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"

	"github.com/go-chi/chi/v5"
)

type ProfileHandler struct {
	profileService *service.ProfileService
}

func NewProfileHandler(ps *service.ProfileService) ProfileHandler {
	return ProfileHandler{profileService: ps}
}

func (h *ProfileHandler) GetOpenCommissionProfiles(w http.ResponseWriter, r *http.Request) {
	profiles, err := h.profileService.GetOpenCommissionProfiles()
	if err != nil {
		http.Error(w, "Failed to fetch open commissions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profiles)
}

func (h *ProfileHandler) GetMasterSkills(w http.ResponseWriter, r *http.Request) {
	skills, err := h.profileService.GetMasterSkills()
	if err != nil {
		http.Error(w, "Failed to fetch master skills", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(skills)
}

func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	p, err := h.profileService.GetProfile(id)
	if err != nil || p == nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func (h *ProfileHandler) GetProfileSkills(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	skills, err := h.profileService.GetProfileSkills(id)
	if err != nil {
		http.Error(w, "Failed to fetch skills", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(skills)
}

func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.profileService.UpdateProfile(&req.Profile, req.Skills); err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ProfileHandler) UpdateOpenCommissions(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req dto.UpdateOpenCommissions

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.profileService.UpdateOpenCommissions(id, req.OpenCommissions); err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ProfileHandler) GetWishlist(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	artworks, err := h.profileService.GetWishlist(id)
	if err != nil {
		http.Error(w, "Failed to fetch wishlist", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}

func (h *ProfileHandler) AddToWishlist(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req dto.AddToWishlist

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.profileService.AddToWishlist(id, req.ArtworkID); err != nil {
		http.Error(w, "Failed to add to wishlist: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *ProfileHandler) RemoveFromWishlist(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	artworkID := chi.URLParam(r, "artworkId")

	if err := h.profileService.RemoveFromWishlist(id, artworkID); err != nil {
		http.Error(w, "Failed to remove from wishlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ProfileHandler) GetArtistRanking(w http.ResponseWriter, r *http.Request) {
	ranking, err := h.profileService.GetArtistRanking()
	if err != nil {
		http.Error(w, "Failed to fetch ranking", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ranking)
}
