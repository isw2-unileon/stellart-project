package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"stellart/backend/src/database/models"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"
	"stellart/backend/src/settings"

	"github.com/go-chi/chi/v5"
)

type ArtworkHandler struct {
	artworkService *service.ArtworkService
	config         *settings.Config
}

func NewArtworkHandler(as *service.ArtworkService, cfg *settings.Config) ArtworkHandler {
	return ArtworkHandler{
		artworkService: as,
		config:         cfg,
	}
}

func (h *ArtworkHandler) CreateArtwork(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateArtwork
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	artwork := models.Artwork{
		ArtistID:    &req.ArtistID,
		Title:       req.Title,
		Description: &req.Description,
		ImageURL:    req.ImageURL,
		Price:       &req.Price,
		Tags:        req.Tags,
		ProductType: req.ProductType,
	}

	if err := h.artworkService.CreateArtwork(&artwork); err != nil {
		if err.Error() == "AI_DETECTED" {
			http.Error(w, `{"error": "Upload rejected: AI-generated image detected."}`, http.StatusBadRequest)
			return
		}
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
	var req dto.SearchSimilarRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Limit <= 0 {
		req.Limit = 10
	}

	artworks, err := h.artworkService.SearchSimilarArtworks(req.Vector, req.Limit)
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}

func (h *ArtworkHandler) SearchArtworks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "The search parameter 'q' is required.", http.StatusBadRequest)
		return
	}

	artworks, err := h.artworkService.SearchArtworks(query)
	if err != nil {
		http.Error(w, "Error searching for works", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}

func (h *ArtworkHandler) ReportArtwork(w http.ResponseWriter, r *http.Request) {
	artworkID := chi.URLParam(r, "id")

	var req dto.ReportArtworkRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if h.config.ResendAPIKey == "" || h.config.ContactEmail == "" {
		http.Error(w, `{"error": "Email service not configured"}`, http.StatusInternalServerError)
		return
	}

	textBody := fmt.Sprintf("New Artwork Report\n\nArtwork ID: %s\nReported by User ID: %s\nReason: %s", artworkID, req.ReporterID, req.Reason)

	payload := map[string]interface{}{
		"from":    "Stellart Moderation <onboarding@resend.dev>",
		"to":      []string{h.config.ContactEmail},
		"subject": "Artwork Report: " + artworkID,
		"text":    textBody,
	}

	jsonPayload, _ := json.Marshal(payload)

	httpReq, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonPayload))
	if err != nil {
		http.Error(w, `{"error": "Failed to create request"}`, http.StatusInternalServerError)
		return
	}

	httpReq.Header.Set("Authorization", "Bearer "+h.config.ResendAPIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil || resp.StatusCode >= 400 {
		http.Error(w, `{"error": "Failed to send email"}`, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Report sent successfully"})
}

func (h *ArtworkHandler) LikeArtwork(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Artwork ID is required", http.StatusBadRequest)
		return
	}

	var reqBody struct {
		ProfileID string `json:"profile_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil || reqBody.ProfileID == "" {
		http.Error(w, "Profile ID is required in request body", http.StatusBadRequest)
		return
	}

	err := h.artworkService.LikeArtwork(id, reqBody.ProfileID)
	if err != nil {
		http.Error(w, "Failed to like artwork", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Artwork liked successfully"})
}

func (h *ArtworkHandler) GetTrendingArtworks(w http.ResponseWriter, r *http.Request) {
	artworks, err := h.artworkService.GetTrendingArtworks()
	if err != nil {
		http.Error(w, "Failed to fetch trending artworks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}

func (h *ArtworkHandler) UnlikeArtwork(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Artwork ID is required", http.StatusBadRequest)
		return
	}

	var reqBody struct {
		ProfileID string `json:"profile_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil || reqBody.ProfileID == "" {
		http.Error(w, "Profile ID is required in request body", http.StatusBadRequest)
		return
	}

	err := h.artworkService.UnlikeArtwork(id, reqBody.ProfileID)
	if err != nil {
		http.Error(w, "Failed to unlike artwork", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ArtworkHandler) DeleteArtwork(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Invalid artwork ID", http.StatusBadRequest)
		return
	}

	err := h.artworkService.DeleteArtwork(id)
	if err != nil {
		http.Error(w, "Failed to delete artwork", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
