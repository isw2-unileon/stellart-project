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

// Mock del Repositorio de Direcciones
type mockAddressRepo struct {
	mockCreate         func(a *models.Address) error
	mockGetByProfileID func(profileID string) ([]models.Address, error)
	mockUpdate         func(a *models.Address) error
	mockDelete         func(id string) error
}

func (m *mockAddressRepo) Create(a *models.Address) error {
	if m.mockCreate != nil {
		return m.mockCreate(a)
	}
	return nil
}

func (m *mockAddressRepo) GetByProfileID(profileID string) ([]models.Address, error) {
	if m.mockGetByProfileID != nil {
		return m.mockGetByProfileID(profileID)
	}
	return nil, nil
}

func (m *mockAddressRepo) Update(a *models.Address) error {
	if m.mockUpdate != nil {
		return m.mockUpdate(a)
	}
	return nil
}

func (m *mockAddressRepo) Delete(id string) error {
	if m.mockDelete != nil {
		return m.mockDelete(id)
	}
	return nil
}

var dummyConfig = &settings.Config{}

func TestAddressHandler_CreateAddress(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  string
		mockBehavior func(a *models.Address) error
		wantCode     int
	}{
		{
			name:        "Address created successfully",
			requestBody: `{"artist_id":"artist-123", "address_label":"Home", "street":"123 Main St", "city":"Madrid", "postal_code":"28001", "country":"Spain"}`,
			mockBehavior: func(a *models.Address) error {
				return nil
			},
			wantCode: http.StatusCreated,
		},
		{
			name:        "Missing Artist ID returns Unauthorized",
			requestBody: `{"address_label":"Home", "street":"123 Main St", "city":"Madrid", "postal_code":"28001", "country":"Spain"}`,
			mockBehavior: func(a *models.Address) error {
				return nil
			},
			wantCode: http.StatusUnauthorized,
		},
		{
			name:        "Invalid JSON payload",
			requestBody: `{"artist_id":"artist-123", "address_label":"Home"`,
			mockBehavior: func(a *models.Address) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database error",
			requestBody: `{"artist_id":"artist-123", "address_label":"Home", "street":"123 Main St", "city":"Madrid", "postal_code":"28001", "country":"Spain"}`,
			mockBehavior: func(a *models.Address) error {
				return errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockAddressRepo{
				mockCreate: tt.mockBehavior,
			}

			addressService := service.NewAddressService(mockRepo, dummyConfig)
			h := handler.NewAddressHandler(addressService, dummyConfig)

			r := chi.NewRouter()
			r.Post("/", h.CreateAddress)

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("CreateAddress() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestAddressHandler_GetAddresses(t *testing.T) {
	tests := []struct {
		name         string
		artistID     string
		mockBehavior func(profileID string) ([]models.Address, error)
		wantCode     int
	}{
		{
			name:     "Addresses fetched successfully",
			artistID: "artist-123",
			mockBehavior: func(profileID string) ([]models.Address, error) {
				return []models.Address{
					{ID: "addr-1", ArtistID: profileID, Label: "Home", City: "Madrid"},
					{ID: "addr-2", ArtistID: profileID, Label: "Office", City: "Barcelona"},
				}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:     "No addresses found returns empty array",
			artistID: "artist-123",
			mockBehavior: func(profileID string) ([]models.Address, error) {
				return nil, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:     "Database error",
			artistID: "artist-123",
			mockBehavior: func(profileID string) ([]models.Address, error) {
				return nil, errors.New("db error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockAddressRepo{
				mockGetByProfileID: tt.mockBehavior,
			}

			addressService := service.NewAddressService(mockRepo, dummyConfig)
			h := handler.NewAddressHandler(addressService, dummyConfig)

			r := chi.NewRouter()
			r.Get("/{artistId}", h.GetAddresses)

			req := httptest.NewRequest(http.MethodGet, "/"+tt.artistID, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("GetAddresses() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestAddressHandler_UpdateAddress(t *testing.T) {
	tests := []struct {
		name         string
		addressID    string
		requestBody  string
		mockBehavior func(a *models.Address) error
		wantCode     int
	}{
		{
			name:        "Address updated successfully",
			addressID:   "addr-123",
			requestBody: `{"address_label":"New Home", "street":"456 New St", "city":"Valencia", "postal_code":"46001", "country":"Spain"}`,
			mockBehavior: func(a *models.Address) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			addressID:   "addr-123",
			requestBody: `{"address_label":"New Home"`,
			mockBehavior: func(a *models.Address) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database error",
			addressID:   "addr-123",
			requestBody: `{"address_label":"New Home", "city":"Valencia"}`,
			mockBehavior: func(a *models.Address) error {
				return errors.New("db error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockAddressRepo{
				mockUpdate: tt.mockBehavior,
			}

			addressService := service.NewAddressService(mockRepo, dummyConfig)
			h := handler.NewAddressHandler(addressService, dummyConfig)

			r := chi.NewRouter()
			r.Put("/{id}", h.UpdateAddress)

			req := httptest.NewRequest(http.MethodPut, "/"+tt.addressID, strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("UpdateAddress() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestAddressHandler_DeleteAddress(t *testing.T) {
	tests := []struct {
		name         string
		addressID    string
		mockBehavior func(id string) error
		wantCode     int
	}{
		{
			name:      "Address deleted successfully",
			addressID: "addr-123",
			mockBehavior: func(id string) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:      "Database error",
			addressID: "addr-123",
			mockBehavior: func(id string) error {
				return errors.New("db error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockAddressRepo{
				mockDelete: tt.mockBehavior,
			}

			addressService := service.NewAddressService(mockRepo, dummyConfig)
			h := handler.NewAddressHandler(addressService, dummyConfig)

			r := chi.NewRouter()
			r.Delete("/{id}", h.DeleteAddress)

			req := httptest.NewRequest(http.MethodDelete, "/"+tt.addressID, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("DeleteAddress() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}
