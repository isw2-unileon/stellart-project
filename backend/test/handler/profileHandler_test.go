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

func TestProfileHandler_GetProfile(t *testing.T) {

	tests := []struct {
		name         string                          // Test name.
		requestID    string                          // The ID we will pass in the URL to fetch the profile.
		mockBehavior func() (*models.Profile, error) // What the mock repository should return when GetByID is called with this requestID.
		wantCode     int                             // The HTTP status code we expect the handler to return for this test case.
	}{
		{
			name:      "Profile found successfully",
			requestID: "user-123",
			mockBehavior: func() (*models.Profile, error) {
				// Simulate that the profile is found successfully
				return &models.Profile{ID: "user-123", FullName: "Stellart Artist"}, nil
			},
			wantCode: http.StatusOK, // Waiting 200 code.
		},
		{
			name:      "Profile not found (nil profile)",
			requestID: "unknown-id",
			mockBehavior: func() (*models.Profile, error) {
				// Simulate that the profile is not found (nil profile, no error)
				return nil, nil
			},
			wantCode: http.StatusNotFound, // Waiting 404 code.
		},
		{
			name:      "Database error",
			requestID: "error-id",
			mockBehavior: func() (*models.Profile, error) {
				// Simulate a database error.
				return nil, errors.New("database connection lost")
			},
			wantCode: http.StatusNotFound, // Waiting 404 code.
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Prepare the mock repository with the behavior defined for this test case.
			mockRepo := &mockProfileRepo{
				mockGetByID: func(id string) (*models.Profile, error) {
					// Veruify if the ID passed to GetByID matches the requestID for the test case.
					if id != tt.requestID {
						t.Errorf("GetByID got id = %v, want %v", id, tt.requestID)
					}
					return tt.mockBehavior()
				},
			}

			// Initialize the handler with the mock repository.
			profileService := service.NewProfileService(mockRepo)
			h := handler.NewProfileHandler(profileService)

			r := chi.NewRouter()
			r.Get("/profiles/{id}", h.GetProfile)

			// Prepare the request and the response recorder.
			req := httptest.NewRequest(http.MethodGet, "/profiles/"+tt.requestID, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			// Compare the result obtained with the expected one.
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
			name:      "Profile updated successfully",
			requestID: "user-123",
			// A fake JSON simulating the payload that the frontend should send.
			requestBody: `{"profile": {"full_name": "New Name"}, "skills": [{"skill_id": "1", "level": 3}]}`,
			mockBehavior: func() error {
				return nil // Mock returns nil telling no error occurred during the update.
			},
			wantCode: http.StatusNoContent,
		},
		{
			name:      "Invalid JSON payload",
			requestID: "user-123",
			// A fake broken JSON simulating a case where the frontend sends an invalid payload.
			requestBody: `{"profile": {"full_name": "New Name"`,
			mockBehavior: func() error {
				return nil // This mock won't even be called because the handler should fail before trying to update due to invalid JSON.
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database update failed",
			requestID:   "user-123",
			requestBody: `{"profile": {"full_name": "New Name"}, "skills": []}`,
			mockBehavior: func() error {
				return errors.New("update failed") // Simulate a database error during the update.
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
