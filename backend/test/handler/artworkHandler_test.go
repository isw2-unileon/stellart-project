package handler_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"stellart/backend/src/database/models"
	"stellart/backend/src/handler"
	"stellart/backend/src/service"
	"stellart/backend/src/settings"
)

type mockArtworkRepo struct {
	mockCreate         func(artwork *models.Artwork) error
	mockSearchSimilar  func(vector []float32, limit int) ([]models.Artwork, error)
	mockGetByArtistID  func(artistID string) ([]models.Artwork, error)
	mockGetById        func(id string) *models.Artwork
	mockIncrementLikes func(artworkID, profileID string) error
	mockDecrementLikes func(artworkID, profileID string) error
	mockGetTrending    func() ([]models.Artwork, error)
	mockDelete         func(id string) error
}

func (m *mockArtworkRepo) Create(artwork *models.Artwork) error {
	if m.mockCreate != nil {
		return m.mockCreate(artwork)
	}
	return nil
}

func (m *mockArtworkRepo) SearchSimilar(vector []float32, limit int) ([]models.Artwork, error) {
	if m.mockSearchSimilar != nil {
		return m.mockSearchSimilar(vector, limit)
	}
	return nil, nil
}

func (m *mockArtworkRepo) GetByArtistID(artistID string) ([]models.Artwork, error) {
	if m.mockGetByArtistID != nil {
		return m.mockGetByArtistID(artistID)
	}
	return nil, nil
}

func (m *mockArtworkRepo) GetById(id string) *models.Artwork {
	if m.mockGetById != nil {
		return m.mockGetById(id)
	}
	return nil
}

func (m *mockArtworkRepo) IncrementLikes(artworkID, profileID string) error {
	if m.mockIncrementLikes != nil {
		return m.mockIncrementLikes(artworkID, profileID)
	}
	return nil
}

func (m *mockArtworkRepo) DecrementLikes(artworkID, profileID string) error {
	if m.mockDecrementLikes != nil {
		return m.mockDecrementLikes(artworkID, profileID)
	}
	return nil
}

func (m *mockArtworkRepo) GetTrending() ([]models.Artwork, error) {
	if m.mockGetTrending != nil {
		return m.mockGetTrending()
	}
	return nil, nil
}

func (m *mockArtworkRepo) Delete(id string) error {
	if m.mockDelete != nil {
		return m.mockDelete(id)
	}
	return nil
}

type mockAIService struct {
	mockIsAIGenerated func(imageURL string) (bool, error)
}

func (m *mockAIService) IsAIGenerated(imageURL string) (bool, error) {
	if m.mockIsAIGenerated != nil {
		return m.mockIsAIGenerated(imageURL)
	}
	return false, nil
}

func newArtworkHandler(repo *mockArtworkRepo, ai *mockAIService) handler.ArtworkHandler {
	svc := service.NewArtworkService(repo, &settings.Config{}, ai)
	return handler.NewArtworkHandler(svc, &settings.Config{})
}

func TestArtworkHandler_CreateArtwork(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		aiResult func(imageURL string) (bool, error)
		wantCode int
	}{
		{
			name:     "AI-generated image rejected",
			body:     `{"artist_id":"a1","title":"Test","image_url":"http://x/img.jpg","product_type":"print"}`,
			aiResult: func(string) (bool, error) { return true, nil },
			wantCode: http.StatusBadRequest,
		},
		{
			name:     "AI service failure",
			body:     `{"artist_id":"a1","title":"Test","image_url":"http://x/img.jpg","product_type":"print"}`,
			aiResult: func(string) (bool, error) { return false, errors.New("ai down") },
			wantCode: http.StatusInternalServerError,
		},
		{
			name:     "Invalid JSON payload",
			body:     `{"artist_id":"a1"`,
			aiResult: func(string) (bool, error) { return false, nil },
			wantCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{}, &mockAIService{mockIsAIGenerated: tt.aiResult})

			r := chi.NewRouter()
			r.Post("/", h.CreateArtwork)

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("CreateArtwork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestArtworkHandler_GetArtwork(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(id string) *models.Artwork
		wantCode int
	}{
		{
			name:     "Artwork found",
			mock:     func(id string) *models.Artwork { return &models.Artwork{ID: id, Title: "Found"} },
			wantCode: http.StatusOK,
		},
		{
			name:     "Artwork not found",
			mock:     func(id string) *models.Artwork { return nil },
			wantCode: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{mockGetById: tt.mock}, &mockAIService{})

			r := chi.NewRouter()
			r.Get("/{id}", h.GetArtwork)

			req := httptest.NewRequest(http.MethodGet, "/art-1", nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("GetArtwork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestArtworkHandler_GetArtworksByArtist(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(artistID string) ([]models.Artwork, error)
		wantCode int
	}{
		{
			name: "Artworks fetched",
			mock: func(artistID string) ([]models.Artwork, error) {
				return []models.Artwork{{ID: "art-1", Title: "One"}}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:     "Database error",
			mock:     func(artistID string) ([]models.Artwork, error) { return nil, errors.New("db error") },
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{mockGetByArtistID: tt.mock}, &mockAIService{})

			r := chi.NewRouter()
			r.Get("/artist/{artistId}", h.GetArtworksByArtist)

			req := httptest.NewRequest(http.MethodGet, "/artist/artist-1", nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("GetArtworksByArtist() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestArtworkHandler_SearchArtworks_MissingQuery(t *testing.T) {
	h := newArtworkHandler(&mockArtworkRepo{}, &mockAIService{})

	r := chi.NewRouter()
	r.Get("/search", h.SearchArtworks)

	req := httptest.NewRequest(http.MethodGet, "/search", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("SearchArtworks() code = %v, want %v", w.Code, http.StatusBadRequest)
	}
}

func TestArtworkHandler_LikeArtwork(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		mock     func(artworkID, profileID string) error
		wantCode int
	}{
		{
			name:     "Liked successfully",
			body:     `{"profile_id":"p1"}`,
			mock:     func(string, string) error { return nil },
			wantCode: http.StatusOK,
		},
		{
			name:     "Missing profile id",
			body:     `{}`,
			mock:     func(string, string) error { return nil },
			wantCode: http.StatusBadRequest,
		},
		{
			name:     "Database error",
			body:     `{"profile_id":"p1"}`,
			mock:     func(string, string) error { return errors.New("db error") },
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{mockIncrementLikes: tt.mock}, &mockAIService{})

			r := chi.NewRouter()
			r.Post("/{id}/like", h.LikeArtwork)

			req := httptest.NewRequest(http.MethodPost, "/art-1/like", strings.NewReader(tt.body))
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("LikeArtwork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestArtworkHandler_UnlikeArtwork(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		mock     func(artworkID, profileID string) error
		wantCode int
	}{
		{
			name:     "Unliked successfully",
			body:     `{"profile_id":"p1"}`,
			mock:     func(string, string) error { return nil },
			wantCode: http.StatusOK,
		},
		{
			name:     "Missing profile id",
			body:     `{}`,
			mock:     func(string, string) error { return nil },
			wantCode: http.StatusBadRequest,
		},
		{
			name:     "Database error",
			body:     `{"profile_id":"p1"}`,
			mock:     func(string, string) error { return errors.New("db error") },
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{mockDecrementLikes: tt.mock}, &mockAIService{})

			r := chi.NewRouter()
			r.Post("/{id}/unlike", h.UnlikeArtwork)

			req := httptest.NewRequest(http.MethodPost, "/art-1/unlike", strings.NewReader(tt.body))
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("UnlikeArtwork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestArtworkHandler_DeleteArtwork(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(id string) error
		wantCode int
	}{
		{
			name:     "Deleted successfully",
			mock:     func(string) error { return nil },
			wantCode: http.StatusOK,
		},
		{
			name:     "Database error",
			mock:     func(string) error { return errors.New("db error") },
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{mockDelete: tt.mock}, &mockAIService{})

			r := chi.NewRouter()
			r.Delete("/{id}", h.DeleteArtwork)

			req := httptest.NewRequest(http.MethodDelete, "/art-1", nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("DeleteArtwork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestArtworkHandler_GetTrendingArtworks(t *testing.T) {
	tests := []struct {
		name     string
		mock     func() ([]models.Artwork, error)
		wantCode int
	}{
		{
			name:     "Trending fetched",
			mock:     func() ([]models.Artwork, error) { return []models.Artwork{{ID: "art-1"}}, nil },
			wantCode: http.StatusOK,
		},
		{
			name:     "Database error",
			mock:     func() ([]models.Artwork, error) { return nil, errors.New("db error") },
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newArtworkHandler(&mockArtworkRepo{mockGetTrending: tt.mock}, &mockAIService{})

			r := chi.NewRouter()
			r.Get("/trending", h.GetTrendingArtworks)

			req := httptest.NewRequest(http.MethodGet, "/trending", nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("GetTrendingArtworks() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}
