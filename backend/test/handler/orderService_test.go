package handler_test

import (
	"errors"
	"testing"

	"stellart/backend/src/database/models"
	"stellart/backend/src/service"
)

func TestOrderService_MarkOrderPaid(t *testing.T) {
	repo := &mockOrderRepo{
		mockGetByPaymentIntent: func(pi string) (*models.Order, error) {
			return &models.Order{ID: "o1", PaymentIntent: &pi}, nil
		},
		mockUpdate: func(order *models.Order) error {
			if order.Status != "paid" {
				t.Fatalf("expected status paid, got %s", order.Status)
			}
			return nil
		},
	}
	svc := service.NewOrderService(repo, nil)
	if err := svc.MarkOrderPaid("pi_1"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestOrderService_MarkOrderPaid_NotFound(t *testing.T) {
	repo := &mockOrderRepo{
		mockGetByPaymentIntent: func(string) (*models.Order, error) {
			return nil, errors.New("not found")
		},
	}
	svc := service.NewOrderService(repo, nil)
	if err := svc.MarkOrderPaid("pi_missing"); err == nil {
		t.Fatal("expected error")
	}
}

func TestOrderService_MarkOrderFailed(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		repo := &mockOrderRepo{
			mockGetByPaymentIntent: func(pi string) (*models.Order, error) {
				return &models.Order{ID: "o2", PaymentIntent: &pi}, nil
			},
			mockUpdate: func(order *models.Order) error {
				if order.Status != "failed" {
					t.Fatalf("expected status failed, got %s", order.Status)
				}
				return nil
			},
		}
		svc := service.NewOrderService(repo, nil)
		if err := svc.MarkOrderFailed("pi_2"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("missing order is ignored", func(t *testing.T) {
		repo := &mockOrderRepo{
			mockGetByPaymentIntent: func(string) (*models.Order, error) {
				return nil, errors.New("not found")
			},
		}
		svc := service.NewOrderService(repo, nil)
		if err := svc.MarkOrderFailed("pi_missing"); err != nil {
			t.Fatalf("expected nil error, got: %v", err)
		}
	})
}

func TestOrderService_GetOrdersByUser(t *testing.T) {
	repo := &mockOrderRepo{
		mockGetOrdersByRole: func(userID, role string) ([]models.Order, error) {
			if userID != "u1" || role != "buyer" {
				t.Fatalf("unexpected args: %s %s", userID, role)
			}
			return []models.Order{{ID: "o1"}}, nil
		},
	}
	svc := service.NewOrderService(repo, nil)
	got, err := svc.GetOrdersByUser("u1", "buyer")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 1 || got[0].ID != "o1" {
		t.Fatalf("unexpected result: %+v", got)
	}
}

func TestOrderService_MarkAsShipped(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		repo := &mockOrderRepo{
			mockGetByID: func(string) (*models.Order, error) {
				return &models.Order{ID: "o1", SellerID: "s1"}, nil
			},
			mockUpdate: func(order *models.Order) error {
				if order.Status != "shipped" {
					t.Fatalf("status should be shipped, got %s", order.Status)
				}
				if order.TrackingCode == nil || *order.TrackingCode != "trk" {
					t.Fatal("tracking code not set")
				}
				if order.Carrier == nil || *order.Carrier != "dhl" {
					t.Fatal("carrier not set")
				}
				return nil
			},
		}
		svc := service.NewOrderService(repo, nil)
		if err := svc.MarkAsShipped("o1", "s1", "trk", "dhl"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("unauthorized", func(t *testing.T) {
		repo := &mockOrderRepo{
			mockGetByID: func(string) (*models.Order, error) {
				return &models.Order{ID: "o1", SellerID: "other"}, nil
			},
		}
		svc := service.NewOrderService(repo, nil)
		if err := svc.MarkAsShipped("o1", "s1", "trk", "dhl"); err == nil {
			t.Fatal("expected unauthorized error")
		}
	})
}

func TestOrderService_MarkAsDelivered(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		repo := &mockOrderRepo{
			mockGetByID: func(string) (*models.Order, error) {
				return &models.Order{ID: "o1", BuyerID: "b1"}, nil
			},
			mockUpdate: func(order *models.Order) error {
				if order.Status != "delivered" {
					t.Fatalf("status should be delivered, got %s", order.Status)
				}
				return nil
			},
		}
		svc := service.NewOrderService(repo, nil)
		if err := svc.MarkAsDelivered("o1", "b1"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("unauthorized", func(t *testing.T) {
		repo := &mockOrderRepo{
			mockGetByID: func(string) (*models.Order, error) {
				return &models.Order{ID: "o1", BuyerID: "other"}, nil
			},
		}
		svc := service.NewOrderService(repo, nil)
		if err := svc.MarkAsDelivered("o1", "b1"); err == nil {
			t.Fatal("expected unauthorized error")
		}
	})
}
