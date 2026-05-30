package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"stellart/backend/src/database/models"
	"stellart/backend/src/handler"
	"stellart/backend/src/service"
)

type mockOrderRepo struct {
	mockCreate             func(order *models.Order) (*models.Order, error)
	mockGetByID            func(id string) (*models.Order, error)
	mockGetByPaymentIntent func(paymentIntent string) (*models.Order, error)
	mockGetOrdersByRole    func(userID string, role string) ([]models.Order, error)
	mockUpdate             func(order *models.Order) error
}

func (m *mockOrderRepo) Create(order *models.Order) (*models.Order, error) {
	if m.mockCreate != nil {
		return m.mockCreate(order)
	}
	return order, nil
}

func (m *mockOrderRepo) GetByID(id string) (*models.Order, error) {
	if m.mockGetByID != nil {
		return m.mockGetByID(id)
	}
	return nil, nil
}

func (m *mockOrderRepo) GetByPaymentIntent(paymentIntent string) (*models.Order, error) {
	if m.mockGetByPaymentIntent != nil {
		return m.mockGetByPaymentIntent(paymentIntent)
	}
	return nil, nil
}

func (m *mockOrderRepo) GetOrdersByRole(userID string, role string) ([]models.Order, error) {
	if m.mockGetOrdersByRole != nil {
		return m.mockGetOrdersByRole(userID, role)
	}
	return nil, nil
}

func (m *mockOrderRepo) Update(order *models.Order) error {
	if m.mockUpdate != nil {
		return m.mockUpdate(order)
	}
	return nil
}

func newPaymentHandler(repo *mockCommissionRepo, orderRepo *mockOrderRepo) *handler.PaymentHandler {
	return handler.NewPaymentHandler(
		service.NewStripeService(""),
		service.NewCommissionService(repo, nil),
		service.NewOrderService(orderRepo, nil),
		"",
	)
}

func postJSON(h http.HandlerFunc, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
	w := httptest.NewRecorder()
	h(w, req)
	return w
}

func TestPaymentHandler_CreateIntent(t *testing.T) {
	h := newPaymentHandler(&mockCommissionRepo{}, &mockOrderRepo{})

	w := postJSON(h.CreateIntent, "/payments/create-intent", `{"amount":`)
	if w.Code != http.StatusBadRequest {
		t.Errorf("invalid JSON code = %v, want %v", w.Code, http.StatusBadRequest)
	}

	w = postJSON(h.CreateIntent, "/payments/create-intent", `{"amount":0}`)
	if w.Code != http.StatusBadRequest {
		t.Errorf("amount<=0 code = %v, want %v", w.Code, http.StatusBadRequest)
	}
}

func TestPaymentHandler_HandleWebhook(t *testing.T) {
	t.Run("payment_intent.succeeded advance", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{
			mockGetAdvancePaymentByCID: func(cid string) (*models.AdvancePayment, error) {
				return &models.AdvancePayment{CommissionID: cid}, nil
			},
			mockUpdateAdvancePayment: func(p *models.AdvancePayment) error { return nil },
		}, &mockOrderRepo{})

		body := `{"id":"evt_1","type":"payment_intent.succeeded","data":{"object":{"id":"pi_1","metadata":{"type":"advance","commission_id":"c1"}}}}`
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", body)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("payment_intent.succeeded remaining", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{
			mockGetRemainingPaymentByCID: func(cid string) (*models.RemainingPayment, error) {
				return &models.RemainingPayment{CommissionID: cid}, nil
			},
			mockUpdateRemainingPayment: func(p *models.RemainingPayment) error { return nil },
		}, &mockOrderRepo{})

		body := `{"id":"evt_1","type":"payment_intent.succeeded","data":{"object":{"id":"pi_2","metadata":{"type":"remaining","commission_id":"c2"}}}}`
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", body)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("payment_intent.succeeded order", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{}, &mockOrderRepo{
			mockGetByPaymentIntent: func(paymentIntent string) (*models.Order, error) {
				return &models.Order{ID: "o1", PaymentIntent: &paymentIntent}, nil
			},
			mockUpdate: func(order *models.Order) error { return nil },
		})

		body := `{"id":"evt_1","type":"payment_intent.succeeded","data":{"object":{"id":"pi_3","metadata":{"type":"order"}}}}`
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", body)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("payment_intent.payment_failed order", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{}, &mockOrderRepo{
			mockGetByPaymentIntent: func(paymentIntent string) (*models.Order, error) {
				return &models.Order{ID: "o2", PaymentIntent: &paymentIntent}, nil
			},
			mockUpdate: func(order *models.Order) error { return nil },
		})

		body := `{"id":"evt_1","type":"payment_intent.payment_failed","data":{"object":{"id":"pi_4","metadata":{"type":"order"}}}}`
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", body)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("charge.refunded", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{}, &mockOrderRepo{})
		body := `{"id":"evt_1","type":"charge.refunded","data":{"object":{"id":"ch_1","payment_intent":{"id":"pi_5"}}}}`
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", body)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("unknown event type", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{}, &mockOrderRepo{})
		body := `{"id":"evt_1","type":"customer.created","data":{"object":{"id":"cus_1"}}}`
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", body)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("malformed body", func(t *testing.T) {
		h := newPaymentHandler(&mockCommissionRepo{}, &mockOrderRepo{})
		w := postJSON(h.HandleWebhook, "/webhooks/stripe", `{"id":`)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})
}
