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
)

type mockProfileRepo struct {
	mockGetByID                   func(id string) (*models.Profile, error)
	mockGetOpenCommissionProfiles func() ([]models.Profile, error)
	mockUpdate                    func(profile *models.Profile, skills []models.ProfileSkill) error
	mockUpdateOpenCommissions     func(id string, open bool) error
	mockGetSkillsByProfileID      func(profileID string) ([]models.ProfileSkill, error)
	mockGetMasterSkills           func() ([]models.MasterSkill, error)
	mockGetWishlist               func(profileID string) ([]models.Artwork, error)
	mockAddToWishlist             func(profileID, artworkID string) error
	mockRemoveFromWishlist        func(profileID, artworkID string) error
	mockGetArtistRanking          func() ([]models.ArtistRanking, error)
}

func (m *mockProfileRepo) GetByID(id string) (*models.Profile, error) {
	return m.mockGetByID(id)
}

func (m *mockProfileRepo) GetOpenCommissionProfiles() ([]models.Profile, error) {
	if m.mockGetOpenCommissionProfiles != nil {
		return m.mockGetOpenCommissionProfiles()
	}
	return nil, nil
}

func (m *mockProfileRepo) Update(profile *models.Profile, skills []models.ProfileSkill) error {
	return m.mockUpdate(profile, skills)
}

func (m *mockProfileRepo) UpdateOpenCommissions(id string, open bool) error {
	if m.mockUpdateOpenCommissions != nil {
		return m.mockUpdateOpenCommissions(id, open)
	}
	return nil
}

func (m *mockProfileRepo) GetSkillsByProfileID(profileID string) ([]models.ProfileSkill, error) {
	return m.mockGetSkillsByProfileID(profileID)
}

func (m *mockProfileRepo) GetMasterSkills() ([]models.MasterSkill, error) {
	return m.mockGetMasterSkills()
}

func (m *mockProfileRepo) GetWishlist(profileID string) ([]models.Artwork, error) {
	if m.mockGetWishlist != nil {
		return m.mockGetWishlist(profileID)
	}
	return nil, nil
}

func (m *mockProfileRepo) AddToWishlist(profileID, artworkID string) error {
	if m.mockAddToWishlist != nil {
		return m.mockAddToWishlist(profileID, artworkID)
	}
	return nil
}

func (m *mockProfileRepo) RemoveFromWishlist(profileID, artworkID string) error {
	if m.mockRemoveFromWishlist != nil {
		return m.mockRemoveFromWishlist(profileID, artworkID)
	}
	return nil
}

func (m *mockProfileRepo) GetArtistRanking() ([]models.ArtistRanking, error) {
	if m.mockGetArtistRanking != nil {
		return m.mockGetArtistRanking()
	}
	return nil, nil
}

func TestProfileHandler_GetProfile(t *testing.T) {
	tests := []struct {
		name         string
		requestID    string
		mockBehavior func() (*models.Profile, error)
		wantCode     int
	}{
		{
			name:      "Profile found successfully",
			requestID: "user-123",
			mockBehavior: func() (*models.Profile, error) {
				return &models.Profile{ID: "user-123", FullName: "Stellart Artist"}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:      "Profile not found (nil profile)",
			requestID: "unknown-id",
			mockBehavior: func() (*models.Profile, error) {
				return nil, nil
			},
			wantCode: http.StatusNotFound,
		},
		{
			name:      "Database error",
			requestID: "error-id",
			mockBehavior: func() (*models.Profile, error) {
				return nil, errors.New("database connection lost")
			},
			wantCode: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockProfileRepo{
				mockGetByID: func(id string) (*models.Profile, error) {
					if id != tt.requestID {
						t.Errorf("GetByID got id = %v, want %v", id, tt.requestID)
					}
					return tt.mockBehavior()
				},
			}

			profileService := service.NewProfileService(mockRepo)
			h := handler.NewProfileHandler(profileService)

			r := chi.NewRouter()
			r.Get("/profiles/{id}", h.GetProfile)

			req := httptest.NewRequest(http.MethodGet, "/profiles/"+tt.requestID, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if gotCode := w.Code; gotCode != tt.wantCode {
				t.Errorf("GetProfile() code = %v, wantCode %v", gotCode, tt.wantCode)
			}
		})
	}
}

func TestProfileHandler_GetMasterSkills(t *testing.T) {
	tests := []struct {
		name         string
		mockBehavior func() ([]models.MasterSkill, error)
		wantCode     int
	}{
		{
			name: "Master skills fetched successfully",
			mockBehavior: func() ([]models.MasterSkill, error) {
				return []models.MasterSkill{
					{ID: "skill-1", Name: "Painting"},
					{ID: "skill-2", Name: "Sculpting"},
				}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name: "Database error",
			mockBehavior: func() ([]models.MasterSkill, error) {
				return nil, errors.New("database connection lost")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockProfileRepo{
				mockGetMasterSkills: func() ([]models.MasterSkill, error) {
					return tt.mockBehavior()
				},
			}

			profileService := service.NewProfileService(mockRepo)
			h := handler.NewProfileHandler(profileService)

			r := chi.NewRouter()
			r.Get("/master-skills", h.GetMasterSkills)

			req := httptest.NewRequest(http.MethodGet, "/master-skills", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if gotCode := w.Code; gotCode != tt.wantCode {
				t.Errorf("GetMasterSkills() code = %v, wantCode %v", gotCode, tt.wantCode)
			}
		})
	}
}

func TestProfileHandler_GetProfileSkills(t *testing.T) {
	tests := []struct {
		name         string
		requestID    string
		mockBehavior func() ([]models.ProfileSkill, error)
		wantCode     int
	}{
		{
			name:      "Profile skills fetched successfully",
			requestID: "user-123",
			mockBehavior: func() ([]models.ProfileSkill, error) {
				return []models.ProfileSkill{
					{ProfileID: "user-123", SkillID: "skill-1", Level: 5},
				}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:      "Database error",
			requestID: "user-123",
			mockBehavior: func() ([]models.ProfileSkill, error) {
				return nil, errors.New("db error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockProfileRepo{
				mockGetSkillsByProfileID: func(profileID string) ([]models.ProfileSkill, error) {
					if profileID != tt.requestID {
						t.Errorf("got id = %v, want %v", profileID, tt.requestID)
					}
					return tt.mockBehavior()
				},
			}

			profileService := service.NewProfileService(mockRepo)
			h := handler.NewProfileHandler(profileService)

			r := chi.NewRouter()
			r.Get("/profiles/{id}/skills", h.GetProfileSkills)

			req := httptest.NewRequest(http.MethodGet, "/profiles/"+tt.requestID+"/skills", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if gotCode := w.Code; gotCode != tt.wantCode {
				t.Errorf("GetProfileSkills() code = %v, wantCode %v", gotCode, tt.wantCode)
			}
		})
	}
}

func TestProfileHandler_UpdateProfile(t *testing.T) {
	tests := []struct {
		name         string
		requestID    string
		requestBody  string
		mockBehavior func() error
		wantCode     int
	}{
		{
			name:        "Profile updated successfully",
			requestID:   "user-123",
			requestBody: `{"profile": {"full_name": "New Name"}, "skills": [{"skill_id": "1", "level": 3}]}`,
			mockBehavior: func() error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			requestID:   "user-123",
			requestBody: `{"profile": {"full_name": "New Name"`,
			mockBehavior: func() error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database update failed",
			requestID:   "user-123",
			requestBody: `{"profile": {"full_name": "New Name"}, "skills": []}`,
			mockBehavior: func() error {
				return errors.New("update failed")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockProfileRepo{
				mockUpdate: func(profile *models.Profile, skills []models.ProfileSkill) error {
					return tt.mockBehavior()
				},
			}

			profileService := service.NewProfileService(mockRepo)
			h := handler.NewProfileHandler(profileService)

			r := chi.NewRouter()
			r.Put("/profiles/{id}", h.UpdateProfile)

			req := httptest.NewRequest(http.MethodPut, "/profiles/"+tt.requestID, strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if gotCode := w.Code; gotCode != tt.wantCode {
				t.Errorf("UpdateProfile() code = %v, wantCode %v", gotCode, tt.wantCode)
			}
		})
	}
}

func TestProfileHandler_GetArtistRanking(t *testing.T) {
	tests := []struct {
		name         string
		mockBehavior func() ([]models.ArtistRanking, error)
		wantCode     int
	}{
		{
			name: "Artist ranking fetched successfully",
			mockBehavior: func() ([]models.ArtistRanking, error) {
				return []models.ArtistRanking{
					{ID: "artist-1", FullName: "Artist One", TotalLikes: 100},
				}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name: "Database error",
			mockBehavior: func() ([]models.ArtistRanking, error) {
				return nil, errors.New("database connection lost")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockProfileRepo{
				mockGetArtistRanking: func() ([]models.ArtistRanking, error) {
					return tt.mockBehavior()
				},
			}

			profileService := service.NewProfileService(mockRepo)
			h := handler.NewProfileHandler(profileService)

			r := chi.NewRouter()
			r.Get("/profiles/ranking", h.GetArtistRanking)

			req := httptest.NewRequest(http.MethodGet, "/profiles/ranking", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if gotCode := w.Code; gotCode != tt.wantCode {
				t.Errorf("GetArtistRanking() code = %v, wantCode %v", gotCode, tt.wantCode)
			}
		})
	}
}
