package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/database/models"
	"stellart/backend/src/service"

	"github.com/go-chi/chi/v5"
)

type ProfileHandler struct {
	profileService *service.ProfileService
}

func NewProfileHandler(ps *service.ProfileService) ProfileHandler {
	return ProfileHandler{profileService: ps}
}

type UpdateProfileRequest struct {
	Profile models.Profile        `json:"profile"`
	Skills  []models.ProfileSkill `json:"skills"`
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
	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.profileService.UpdateProfile(&req.Profile, req.Skills); err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
