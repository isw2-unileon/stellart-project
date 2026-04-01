package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/database/models"
	"stellart/backend/src/service"

	"github.com/go-chi/chi/v5"
)

type ArtworkHandler struct {
	artworkService *service.ArtworkService
}

func NewArtworkHandler(as *service.ArtworkService) ArtworkHandler {
	return ArtworkHandler{artworkService: as}
}

func (h *ArtworkHandler) CreateArtwork(w http.ResponseWriter, r *http.Request) {
	var artwork models.Artwork
	if err := json.NewDecoder(r.Body).Decode(&artwork); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}
	if err := h.artworkService.CreateArtwork(&artwork); err != nil {
		http.Error(w, "Failed to create artwork: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(artwork)
}

func (h *ArtworkHandler) GetArtwork(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	artwork := h.artworkService.GetArtworkByID(id)
	if artwork == nil {
		http.Error(w, "Artwork not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artwork)
}

func (h *ArtworkHandler) GetArtworksByArtist(w http.ResponseWriter, r *http.Request) {
	artistID := chi.URLParam(r, "artistId")
	artworks, err := h.artworkService.GetArtworksByArtist(artistID)
	if err != nil {
		http.Error(w, "Failed to fetch artworks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}

func (h *ArtworkHandler) SearchSimilar(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Vector []float32 `json:"vector"`
		Limit  int       `json:"limit"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if request.Limit <= 0 {
		request.Limit = 10
	}

	artworks, err := h.artworkService.SearchSimilarArtworks(request.Vector, request.Limit)
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}
