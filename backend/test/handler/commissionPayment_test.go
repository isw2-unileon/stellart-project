package handler_test

import (
	"errors"
	"net/http"
	"testing"

	"stellart/backend/src/database/models"
	"stellart/backend/src/handler"
	"stellart/backend/src/service"
)

func newCommissionPaymentHandler(repo *mockCommissionRepo) handler.CommissionHandler {
	return handler.NewCommissionHandler(service.NewCommissionService(repo, service.NewStripeService("")))
}

func TestCommissionHandler_CreateAdvancePayment(t *testing.T) {
	t.Run("invalid json", func(t *testing.T) {
		h := newCommissionPaymentHandler(&mockCommissionRepo{})
		w := serve(http.MethodPost, "/", "/", `{"commission_id":`, h.CreateAdvancePayment)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})
}

func TestCommissionHandler_CreateRemainingPayment(t *testing.T) {
	t.Run("invalid json", func(t *testing.T) {
		h := newCommissionPaymentHandler(&mockCommissionRepo{})
		w := serve(http.MethodPost, "/", "/", `{"commission_id":`, h.CreateRemainingPayment)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})
}

func TestCommissionHandler_MarkPaymentPaid(t *testing.T) {
	tests := []struct {
		name       string
		getMock    func(cid string) (*models.AdvancePayment, error)
		updateMock func(p *models.AdvancePayment) error
		wantCode   int
	}{
		{
			name: "success",
			getMock: func(cid string) (*models.AdvancePayment, error) {
				return &models.AdvancePayment{CommissionID: cid, PaymentIntent: ""}, nil
			},
			updateMock: func(*models.AdvancePayment) error { return nil },
			wantCode:   http.StatusNoContent,
		},
		{
			name:       "not found",
			getMock:    func(string) (*models.AdvancePayment, error) { return nil, nil },
			updateMock: func(*models.AdvancePayment) error { return nil },
			wantCode:   http.StatusInternalServerError,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionPaymentHandler(&mockCommissionRepo{
				mockGetAdvancePaymentByCID: tt.getMock,
				mockUpdateAdvancePayment:   tt.updateMock,
			})
			w := serve(http.MethodPost, "/{id}/payment/mark-paid", "/c1/payment/mark-paid", "", h.MarkPaymentPaid)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_MarkRemainingPaymentPaid(t *testing.T) {
	h := newCommissionPaymentHandler(&mockCommissionRepo{
		mockGetRemainingPaymentByCID: func(cid string) (*models.RemainingPayment, error) {
			return &models.RemainingPayment{CommissionID: cid, PaymentIntent: ""}, nil
		},
		mockUpdateRemainingPayment: func(*models.RemainingPayment) error { return nil },
	})
	w := serve(http.MethodPost, "/{id}/remaining-payment/mark-paid", "/c1/remaining-payment/mark-paid", "", h.MarkRemainingPaymentPaid)
	if w.Code != http.StatusNoContent {
		t.Errorf("code = %v, want %v", w.Code, http.StatusNoContent)
	}
}

func TestCommissionHandler_GetAdvancePayment(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(cid string) (*models.AdvancePayment, error)
		wantCode int
	}{
		{"found", func(cid string) (*models.AdvancePayment, error) {
			return &models.AdvancePayment{CommissionID: cid}, nil
		}, http.StatusOK},
		{"not found", func(string) (*models.AdvancePayment, error) { return nil, nil }, http.StatusNotFound},
		{"error", func(string) (*models.AdvancePayment, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionPaymentHandler(&mockCommissionRepo{mockGetAdvancePaymentByCID: tt.mock})
			w := serve(http.MethodGet, "/{id}/payment", "/c1/payment", "", h.GetAdvancePayment)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_GetRemainingPayment(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(cid string) (*models.RemainingPayment, error)
		wantCode int
	}{
		{"found", func(cid string) (*models.RemainingPayment, error) {
			return &models.RemainingPayment{CommissionID: cid}, nil
		}, http.StatusOK},
		{"not found", func(string) (*models.RemainingPayment, error) { return nil, nil }, http.StatusNotFound},
		{"error", func(string) (*models.RemainingPayment, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionPaymentHandler(&mockCommissionRepo{mockGetRemainingPaymentByCID: tt.mock})
			w := serve(http.MethodGet, "/{id}/remaining-payment", "/c1/remaining-payment", "", h.GetRemainingPayment)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_ReleasePayment(t *testing.T) {
	t.Run("success with remaining", func(t *testing.T) {
		h := newCommissionPaymentHandler(&mockCommissionRepo{
			mockGetAdvancePaymentByCID: func(cid string) (*models.AdvancePayment, error) {
				return &models.AdvancePayment{CommissionID: cid, Status: models.PaymentStatusPaid, PaymentIntent: ""}, nil
			},
			mockUpdateAdvancePayment: func(*models.AdvancePayment) error { return nil },
			mockGetRemainingPaymentByCID: func(cid string) (*models.RemainingPayment, error) {
				return &models.RemainingPayment{CommissionID: cid, Status: models.PaymentStatusPaid, PaymentIntent: ""}, nil
			},
			mockUpdateRemainingPayment: func(*models.RemainingPayment) error { return nil },
		})
		w := serve(http.MethodPost, "/{id}/payment/release", "/c1/payment/release", "", h.ReleasePayment)
		if w.Code != http.StatusNoContent {
			t.Errorf("code = %v, want %v", w.Code, http.StatusNoContent)
		}
	})

	t.Run("error when advance missing", func(t *testing.T) {
		h := newCommissionPaymentHandler(&mockCommissionRepo{
			mockGetAdvancePaymentByCID: func(string) (*models.AdvancePayment, error) { return nil, nil },
		})
		w := serve(http.MethodPost, "/{id}/payment/release", "/c1/payment/release", "", h.ReleasePayment)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("code = %v, want %v", w.Code, http.StatusInternalServerError)
		}
	})
}
