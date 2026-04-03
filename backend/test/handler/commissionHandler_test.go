package handler_test

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"stellart/backend/src/database/models"
	"stellart/backend/src/handler"
	"stellart/backend/src/service"
)

type mockCommissionRepo struct {
	mockCreate                   func(c *models.Commission) error
	mockGetByID                  func(id string) (*models.Commission, error)
	mockGetByBuyerID             func(buyerID string) ([]models.Commission, error)
	mockGetByArtistID            func(artistID string) ([]models.Commission, error)
	mockUpdate                   func(c *models.Commission) error
	mockCreateAdvancePayment     func(p *models.AdvancePayment) error
	mockGetAdvancePaymentByCID   func(cid string) (*models.AdvancePayment, error)
	mockUpdateAdvancePayment     func(p *models.AdvancePayment) error
	mockCreateRemainingPayment   func(p *models.RemainingPayment) error
	mockGetRemainingPaymentByCID func(cid string) (*models.RemainingPayment, error)
	mockUpdateRemainingPayment   func(p *models.RemainingPayment) error
	mockCreateWorkUpload         func(u *models.WorkUpload) error
	mockGetWorkUploadsByCID      func(cid string) ([]models.WorkUpload, error)
	mockUpdateWorkUpload         func(u *models.WorkUpload) error
	mockCreateRevision           func(r *models.CommissionRevision) error
	mockGetRevisionsByCID        func(cid string) ([]models.CommissionRevision, error)
	mockUpdateRevision           func(r *models.CommissionRevision) error
	mockCreateRefund             func(r *models.Refund) error
	mockGetRefundByCID           func(cid string) (*models.Refund, error)
	mockUpdateRefund             func(r *models.Refund) error
	mockCreateChatMessage        func(m *models.ChatMessage) error
	mockGetChatMessagesByCID     func(cid string) ([]models.ChatMessage, error)
	mockMarkMessagesAsRead       func(cid, userID string) error
}

func (m *mockCommissionRepo) Create(c *models.Commission) error {
	if m.mockCreate != nil {
		return m.mockCreate(c)
	}
	return nil
}

func (m *mockCommissionRepo) GetByID(id string) (*models.Commission, error) {
	if m.mockGetByID != nil {
		return m.mockGetByID(id)
	}
	return nil, nil
}

func (m *mockCommissionRepo) Update(c *models.Commission) error {
	if m.mockUpdate != nil {
		return m.mockUpdate(c)
	}
	return nil
}

func (m *mockCommissionRepo) CreateAdvancePayment(p *models.AdvancePayment) error {
	if m.mockCreateAdvancePayment != nil {
		return m.mockCreateAdvancePayment(p)
	}
	return nil
}

func (m *mockCommissionRepo) GetAdvancePaymentByCommissionID(cid string) (*models.AdvancePayment, error) {
	if m.mockGetAdvancePaymentByCID != nil {
		return m.mockGetAdvancePaymentByCID(cid)
	}
	return nil, nil
}

func (m *mockCommissionRepo) UpdateAdvancePayment(p *models.AdvancePayment) error {
	if m.mockUpdateAdvancePayment != nil {
		return m.mockUpdateAdvancePayment(p)
	}
	return nil
}

func (m *mockCommissionRepo) CreateRemainingPayment(p *models.RemainingPayment) error {
	if m.mockCreateRemainingPayment != nil {
		return m.mockCreateRemainingPayment(p)
	}
	return nil
}

func (m *mockCommissionRepo) GetRemainingPaymentByCommissionID(cid string) (*models.RemainingPayment, error) {
	if m.mockGetRemainingPaymentByCID != nil {
		return m.mockGetRemainingPaymentByCID(cid)
	}
	return nil, nil
}

func (m *mockCommissionRepo) UpdateRemainingPayment(p *models.RemainingPayment) error {
	if m.mockUpdateRemainingPayment != nil {
		return m.mockUpdateRemainingPayment(p)
	}
	return nil
}

func (m *mockCommissionRepo) CreateWorkUpload(u *models.WorkUpload) error {
	if m.mockCreateWorkUpload != nil {
		return m.mockCreateWorkUpload(u)
	}
	return nil
}

func (m *mockCommissionRepo) GetWorkUploadsByCommissionID(cid string) ([]models.WorkUpload, error) {
	if m.mockGetWorkUploadsByCID != nil {
		return m.mockGetWorkUploadsByCID(cid)
	}
	return nil, nil
}

func (m *mockCommissionRepo) UpdateWorkUpload(u *models.WorkUpload) error {
	if m.mockUpdateWorkUpload != nil {
		return m.mockUpdateWorkUpload(u)
	}
	return nil
}

func (m *mockCommissionRepo) GetByBuyerID(buyerID string) ([]models.Commission, error) {
	if m.mockGetByBuyerID != nil {
		return m.mockGetByBuyerID(buyerID)
	}
	return nil, nil
}

func (m *mockCommissionRepo) GetByArtistID(artistID string) ([]models.Commission, error) {
	if m.mockGetByArtistID != nil {
		return m.mockGetByArtistID(artistID)
	}
	return nil, nil
}

func (m *mockCommissionRepo) CreateRevision(r *models.CommissionRevision) error {
	if m.mockCreateRevision != nil {
		return m.mockCreateRevision(r)
	}
	return nil
}

func (m *mockCommissionRepo) GetRevisionsByCommissionID(cid string) ([]models.CommissionRevision, error) {
	if m.mockGetRevisionsByCID != nil {
		return m.mockGetRevisionsByCID(cid)
	}
	return nil, nil
}

func (m *mockCommissionRepo) UpdateRevision(r *models.CommissionRevision) error {
	if m.mockUpdateRevision != nil {
		return m.mockUpdateRevision(r)
	}
	return nil
}

func (m *mockCommissionRepo) CreateRefund(r *models.Refund) error {
	if m.mockCreateRefund != nil {
		return m.mockCreateRefund(r)
	}
	return nil
}

func (m *mockCommissionRepo) GetRefundByCommissionID(cid string) (*models.Refund, error) {
	if m.mockGetRefundByCID != nil {
		return m.mockGetRefundByCID(cid)
	}
	return nil, nil
}

func (m *mockCommissionRepo) UpdateRefund(r *models.Refund) error {
	if m.mockUpdateRefund != nil {
		return m.mockUpdateRefund(r)
	}
	return nil
}

func (m *mockCommissionRepo) CreateChatMessage(mg *models.ChatMessage) error {
	if m.mockCreateChatMessage != nil {
		return m.mockCreateChatMessage(mg)
	}
	return nil
}

func (m *mockCommissionRepo) GetChatMessagesByCommissionID(cid string) ([]models.ChatMessage, error) {
	if m.mockGetChatMessagesByCID != nil {
		return m.mockGetChatMessagesByCID(cid)
	}
	return nil, nil
}

func (m *mockCommissionRepo) MarkMessagesAsRead(cid, userID string) error {
	if m.mockMarkMessagesAsRead != nil {
		return m.mockMarkMessagesAsRead(cid, userID)
	}
	return nil
}

func TestCommissionHandler_CreateCommission(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  string
		mockBehavior func(c *models.Commission) error
		wantCode     int
	}{
		{
			name:        "Commission created successfully",
			requestBody: `{"commission_id":"comm-123","buyer_id":"buyer-1","artist_id":"artist-1","title":"Test Commission","description":"Test","price":100.00}`,
			mockBehavior: func(c *models.Commission) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			requestBody: `{"commission_id":"comm-123"`,
			mockBehavior: func(c *models.Commission) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database error",
			requestBody: `{"commission_id":"comm-123","buyer_id":"buyer-1","artist_id":"artist-1","title":"Test","price":100}`,
			mockBehavior: func(c *models.Commission) error {
				return errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockCreate: tt.mockBehavior,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/", h.CreateCommission)

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("CreateCommission() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_CreateAdvancePayment(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  string
		mockBehavior func(p *models.AdvancePayment) error
		wantCode     int
	}{
		{
			name:        "Advance payment created successfully",
			requestBody: `{"payment_id":"pay-123","commission_id":"comm-123","amount":50.00,"payment_intent":"pi_123"}`,
			mockBehavior: func(p *models.AdvancePayment) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			requestBody: `{"payment_id":"pay-123"`,
			mockBehavior: func(p *models.AdvancePayment) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database error",
			requestBody: `{"payment_id":"pay-123","commission_id":"comm-123","amount":50.00,"payment_intent":"pi_123"}`,
			mockBehavior: func(p *models.AdvancePayment) error {
				return errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockCreateAdvancePayment: tt.mockBehavior,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/", h.CreateAdvancePayment)

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("CreateAdvancePayment() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_CreateRemainingPayment(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  string
		mockBehavior func(p *models.RemainingPayment) error
		wantCode     int
	}{
		{
			name:        "Remaining payment created successfully",
			requestBody: `{"payment_id":"rem-123","commission_id":"comm-123","amount":50.00,"payment_intent":"pi_123"}`,
			mockBehavior: func(p *models.RemainingPayment) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			requestBody: `{"payment_id":"rem-123"`,
			mockBehavior: func(p *models.RemainingPayment) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database error",
			requestBody: `{"payment_id":"rem-123","commission_id":"comm-123","amount":50.00,"payment_intent":"pi_123"}`,
			mockBehavior: func(p *models.RemainingPayment) error {
				return errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockCreateRemainingPayment: tt.mockBehavior,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/", h.CreateRemainingPayment)

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("CreateRemainingPayment() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_MarkPaymentPaid(t *testing.T) {
	tests := []struct {
		name         string
		commissionID string
		paymentMock  func(cid string) (*models.AdvancePayment, error)
		updateMock   func(p *models.AdvancePayment) error
		wantCode     int
	}{
		{
			name:         "Payment marked as paid successfully",
			commissionID: "comm-123",
			paymentMock: func(cid string) (*models.AdvancePayment, error) {
				return &models.AdvancePayment{
					ID:           "pay-123",
					CommissionID: cid,
					Amount:       50.00,
					Status:       models.PaymentStatusPending,
				}, nil
			},
			updateMock: func(p *models.AdvancePayment) error {
				return nil
			},
			wantCode: http.StatusNoContent,
		},
		{
			name:         "Payment not found",
			commissionID: "comm-123",
			paymentMock: func(cid string) (*models.AdvancePayment, error) {
				return nil, nil
			},
			updateMock: func(p *models.AdvancePayment) error {
				return nil
			},
			wantCode: http.StatusInternalServerError,
		},
		{
			name:         "Database error on fetch",
			commissionID: "comm-123",
			paymentMock: func(cid string) (*models.AdvancePayment, error) {
				return nil, errors.New("db error")
			},
			updateMock: func(p *models.AdvancePayment) error {
				return nil
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockGetAdvancePaymentByCID: tt.paymentMock,
				mockUpdateAdvancePayment:   tt.updateMock,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/{commissionId}/payment/mark-paid", h.MarkPaymentPaid)

			req := httptest.NewRequest(http.MethodPost, "/comm-123/payment/mark-paid", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("MarkPaymentPaid() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_UploadWork(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  string
		mockBehavior func(u *models.WorkUpload) error
		wantCode     int
	}{
		{
			name:        "Work uploaded successfully without clean image",
			requestBody: `{"upload_id":"upload-123","commission_id":"comm-123","image_url":"http://example.com/watermarked.jpg","watermarked":true,"is_final":false,"notes":"Test preview"}`,
			mockBehavior: func(u *models.WorkUpload) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Work uploaded successfully with clean image",
			requestBody: `{"upload_id":"upload-123","commission_id":"comm-123","image_url":"http://example.com/watermarked.jpg","clean_image_url":"http://example.com/clean.jpg","watermarked":true,"is_final":false,"notes":"Test preview"}`,
			mockBehavior: func(u *models.WorkUpload) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Final version uploaded",
			requestBody: `{"upload_id":"final-123","commission_id":"comm-123","image_url":"http://example.com/final.jpg","watermarked":false,"is_final":true,"notes":"Final version"}`,
			mockBehavior: func(u *models.WorkUpload) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			requestBody: `{"upload_id":"upload-123"`,
			mockBehavior: func(u *models.WorkUpload) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Database error",
			requestBody: `{"upload_id":"upload-123","commission_id":"comm-123","image_url":"http://example.com/test.jpg","watermarked":true,"is_final":false}`,
			mockBehavior: func(u *models.WorkUpload) error {
				return errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockCreateWorkUpload: tt.mockBehavior,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/", h.UploadWork)

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("UploadWork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_GetWorkUploads(t *testing.T) {
	tests := []struct {
		name         string
		commissionID string
		mockBehavior func(cid string) ([]models.WorkUpload, error)
		wantCode     int
	}{
		{
			name:         "Work uploads fetched successfully",
			commissionID: "comm-123",
			mockBehavior: func(cid string) ([]models.WorkUpload, error) {
				return []models.WorkUpload{
					{
						ID:            "upload-1",
						CommissionID:  cid,
						ImageURL:      "http://example.com/img1.jpg",
						CleanImageURL: "http://example.com/clean1.jpg",
						Watermarked:   true,
						IsFinal:       false,
						Notes:         "Preview 1",
						CreatedAt:     time.Now(),
					},
					{
						ID:            "upload-2",
						CommissionID:  cid,
						ImageURL:      "http://example.com/img2.jpg",
						CleanImageURL: "http://example.com/clean2.jpg",
						Watermarked:   false,
						IsFinal:       true,
						Notes:         "Final version",
						CreatedAt:     time.Now(),
					},
				}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:         "No work uploads",
			commissionID: "comm-123",
			mockBehavior: func(cid string) ([]models.WorkUpload, error) {
				return []models.WorkUpload{}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:         "Database error",
			commissionID: "comm-123",
			mockBehavior: func(cid string) ([]models.WorkUpload, error) {
				return nil, errors.New("db error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockGetWorkUploadsByCID: tt.mockBehavior,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Get("/{commissionId}/work-uploads", h.GetWorkUploads)

			req := httptest.NewRequest(http.MethodGet, "/comm-123/work-uploads", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("GetWorkUploads() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_MarkRemainingPaymentPaid(t *testing.T) {
	tests := []struct {
		name         string
		commissionID string
		paymentMock  func(cid string) (*models.RemainingPayment, error)
		updateMock   func(p *models.RemainingPayment) error
		wantCode     int
	}{
		{
			name:         "Remaining payment marked as paid successfully",
			commissionID: "comm-123",
			paymentMock: func(cid string) (*models.RemainingPayment, error) {
				return &models.RemainingPayment{
					ID:           "rem-123",
					CommissionID: cid,
					Amount:       50.00,
					Status:       models.PaymentStatusPending,
				}, nil
			},
			updateMock: func(p *models.RemainingPayment) error {
				return nil
			},
			wantCode: http.StatusNoContent,
		},
		{
			name:         "Remaining payment not found",
			commissionID: "comm-123",
			paymentMock: func(cid string) (*models.RemainingPayment, error) {
				return nil, nil
			},
			updateMock: func(p *models.RemainingPayment) error {
				return nil
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockGetRemainingPaymentByCID: tt.paymentMock,
				mockUpdateRemainingPayment:   tt.updateMock,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/{commissionId}/remaining-payment/mark-paid", h.MarkRemainingPaymentPaid)

			req := httptest.NewRequest(http.MethodPost, "/comm-123/remaining-payment/mark-paid", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("MarkRemainingPaymentPaid() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_GetRemainingPayment(t *testing.T) {
	tests := []struct {
		name         string
		commissionID string
		mockBehavior func(cid string) (*models.RemainingPayment, error)
		wantCode     int
	}{
		{
			name:         "Remaining payment found",
			commissionID: "comm-123",
			mockBehavior: func(cid string) (*models.RemainingPayment, error) {
				return &models.RemainingPayment{
					ID:           "rem-123",
					CommissionID: cid,
					Amount:       50.00,
					Status:       models.PaymentStatusPaid,
				}, nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:         "Remaining payment not found",
			commissionID: "comm-123",
			mockBehavior: func(cid string) (*models.RemainingPayment, error) {
				return nil, nil
			},
			wantCode: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockGetRemainingPaymentByCID: tt.mockBehavior,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Get("/{commissionId}/remaining-payment", h.GetRemainingPayment)

			req := httptest.NewRequest(http.MethodGet, "/comm-123/remaining-payment", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("GetRemainingPayment() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionModels(t *testing.T) {
	t.Run("WorkUpload JSON serialization with clean_image_url", func(t *testing.T) {
		upload := models.WorkUpload{
			ID:            "upload-1",
			CommissionID:  "comm-1",
			ImageURL:      "http://example.com/watermarked.jpg",
			CleanImageURL: "http://example.com/clean.jpg",
			Watermarked:   true,
			IsFinal:       false,
			Notes:         "Test notes",
			CreatedAt:     time.Now(),
		}

		data, err := json.Marshal(upload)
		if err != nil {
			t.Fatalf("Failed to marshal WorkUpload: %v", err)
		}

		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err != nil {
			t.Fatalf("Failed to unmarshal: %v", err)
		}

		if result["clean_image_url"] != "http://example.com/clean.jpg" {
			t.Errorf("Expected clean_image_url, got %v", result["clean_image_url"])
		}
	})

	t.Run("RemainingPayment status constants", func(t *testing.T) {
		if models.PaymentStatusPending != "pending" {
			t.Errorf("Expected pending, got %s", models.PaymentStatusPending)
		}
		if models.PaymentStatusPaid != "paid" {
			t.Errorf("Expected paid, got %s", models.PaymentStatusPaid)
		}
		if models.PaymentStatusReleased != "released" {
			t.Errorf("Expected released, got %s", models.PaymentStatusReleased)
		}
	})
}

func TestCommissionHandler_ApproveWork(t *testing.T) {
	tests := []struct {
		name         string
		commissionID string
		commMock     func(id string) (*models.Commission, error)
		uploadMock   func(cid string) ([]models.WorkUpload, error)
		updateComm   func(c *models.Commission) error
		updateUpload func(u *models.WorkUpload) error
		wantCode     int
	}{
		{
			name:         "Work approved successfully",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return &models.Commission{
					ID:     id,
					Status: models.CommissionStatusReview,
				}, nil
			},
			uploadMock: func(cid string) ([]models.WorkUpload, error) {
				return []models.WorkUpload{
					{ID: "upload-1", CommissionID: cid},
				}, nil
			},
			updateComm: func(c *models.Commission) error {
				return nil
			},
			updateUpload: func(u *models.WorkUpload) error {
				return nil
			},
			wantCode: http.StatusNoContent,
		},
		{
			name:         "Commission not found",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return nil, nil
			},
			uploadMock: func(cid string) ([]models.WorkUpload, error) {
				return nil, nil
			},
			updateComm: func(c *models.Commission) error {
				return nil
			},
			updateUpload: func(u *models.WorkUpload) error {
				return nil
			},
			wantCode: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockGetByID:             tt.commMock,
				mockGetWorkUploadsByCID: tt.uploadMock,
				mockUpdate:              tt.updateComm,
				mockUpdateWorkUpload:    tt.updateUpload,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/{id}/approve", h.ApproveWork)

			req := httptest.NewRequest(http.MethodPost, "/comm-123/approve", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("ApproveWork() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_DenyCommission(t *testing.T) {
	tests := []struct {
		name         string
		commissionID string
		commMock     func(id string) (*models.Commission, error)
		paymentMock  func(cid string) (*models.AdvancePayment, error)
		updateComm   func(c *models.Commission) error
		createRefund func(r *models.Refund) error
		updateRefund func(r *models.Refund) error
		wantCode     int
	}{
		{
			name:         "Commission denied successfully with refund",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return &models.Commission{ID: id, Status: models.CommissionStatusPending}, nil
			},
			paymentMock: func(cid string) (*models.AdvancePayment, error) {
				return &models.AdvancePayment{ID: "pay-123", CommissionID: cid, Amount: 50, Status: models.PaymentStatusPaid}, nil
			},
			updateComm: func(c *models.Commission) error {
				return nil
			},
			createRefund: func(r *models.Refund) error {
				return nil
			},
			updateRefund: func(r *models.Refund) error {
				return nil
			},
			wantCode: http.StatusNoContent,
		},
		{
			name:         "Commission denied successfully without payment",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return &models.Commission{ID: id, Status: models.CommissionStatusPending}, nil
			},
			paymentMock: func(cid string) (*models.AdvancePayment, error) {
				return nil, nil
			},
			updateComm: func(c *models.Commission) error {
				return nil
			},
			wantCode: http.StatusNoContent,
		},
		{
			name:         "Commission not found",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return nil, nil
			},
			wantCode: http.StatusNotFound,
		},
		{
			name:         "Database error on get commission",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return nil, errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
		{
			name:         "Database error on update commission",
			commissionID: "comm-123",
			commMock: func(id string) (*models.Commission, error) {
				return &models.Commission{ID: id, Status: models.CommissionStatusPending}, nil
			},
			paymentMock: func(cid string) (*models.AdvancePayment, error) {
				return nil, nil
			},
			updateComm: func(c *models.Commission) error {
				return errors.New("database error")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockCommissionRepo{
				mockGetByID:                tt.commMock,
				mockGetAdvancePaymentByCID: tt.paymentMock,
				mockUpdate:                 tt.updateComm,
				mockCreateRefund:           tt.createRefund,
				mockUpdateRefund:           tt.updateRefund,
			}

			commissionService := service.NewCommissionService(mockRepo)
			h := handler.NewCommissionHandler(commissionService)

			r := chi.NewRouter()
			r.Post("/{id}/deny", h.DenyCommission)

			req := httptest.NewRequest(http.MethodPost, "/comm-123/deny", nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("DenyCommission() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func BenchmarkCommissionHandler_CreateCommission(b *testing.B) {
	mockRepo := &mockCommissionRepo{
		mockCreate: func(c *models.Commission) error {
			return nil
		},
	}

	commissionService := service.NewCommissionService(mockRepo)
	h := handler.NewCommissionHandler(commissionService)

	r := chi.NewRouter()
	r.Post("/", h.CreateCommission)

	body := `{"commission_id":"comm-123","buyer_id":"buyer-1","artist_id":"artist-1","title":"Test","price":100}`

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}
}

func BenchmarkCommissionHandler_UploadWork(b *testing.B) {
	mockRepo := &mockCommissionRepo{
		mockCreateWorkUpload: func(u *models.WorkUpload) error {
			return nil
		},
	}

	commissionService := service.NewCommissionService(mockRepo)
	h := handler.NewCommissionHandler(commissionService)

	r := chi.NewRouter()
	r.Post("/", h.UploadWork)

	body := `{"upload_id":"upload-123","commission_id":"comm-123","image_url":"http://example.com/test.jpg","clean_image_url":"http://example.com/clean.jpg","watermarked":true,"is_final":false}`

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}
}
