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

func newCommissionHandler(repo *mockCommissionRepo) handler.CommissionHandler {
	return handler.NewCommissionHandler(service.NewCommissionService(repo))
}

// serve wires a single route to a handler func and performs the request.
func serve(method, pattern, target string, body string, h http.HandlerFunc) *httptest.ResponseRecorder {
	r := chi.NewRouter()
	switch method {
	case http.MethodGet:
		r.Get(pattern, h)
	case http.MethodPost:
		r.Post(pattern, h)
	case http.MethodDelete:
		r.Delete(pattern, h)
	default:
		r.Method(method, pattern, h)
	}

	var reqBody *strings.Reader
	if body != "" {
		reqBody = strings.NewReader(body)
	} else {
		reqBody = strings.NewReader("")
	}
	req := httptest.NewRequest(method, target, reqBody)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestCommissionHandler_CreateCommission_Extra(t *testing.T) {
	t.Run("Buyer and artist are the same", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{})
		w := serve(http.MethodPost, "/", "/",
			`{"buyer_id":"u1","artist_id":"u1","title":"T","price":10}`, h.CreateCommission)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})

	t.Run("Valid deadline parsed", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockCreate: func(*models.Commission) error { return nil },
		})
		w := serve(http.MethodPost, "/", "/",
			`{"buyer_id":"b1","artist_id":"a1","title":"T","price":10,"deadline":"2025-01-02T15:04:05Z"}`, h.CreateCommission)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})
}

func TestCommissionHandler_GetCommission(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(id string) (*models.Commission, error)
		wantCode int
	}{
		{"Found", func(id string) (*models.Commission, error) { return &models.Commission{ID: id}, nil }, http.StatusOK},
		{"Not found", func(string) (*models.Commission, error) { return nil, nil }, http.StatusNotFound},
		{"Error", func(string) (*models.Commission, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockGetByID: tt.mock})
			w := serve(http.MethodGet, "/{id}", "/c1", "", h.GetCommission)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_GetBuyerCommissions(t *testing.T) {
	tests := []struct {
		name     string
		target   string
		mock     func(string) ([]models.Commission, error)
		wantCode int
	}{
		{"Success", "/?buyer_id=b1", func(string) ([]models.Commission, error) { return []models.Commission{{ID: "c1"}}, nil }, http.StatusOK},
		{"Missing buyer_id", "/", nil, http.StatusBadRequest},
		{"Error", "/?buyer_id=b1", func(string) ([]models.Commission, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockGetByBuyerID: tt.mock})
			w := serve(http.MethodGet, "/", tt.target, "", h.GetBuyerCommissions)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_GetArtistCommissions(t *testing.T) {
	tests := []struct {
		name     string
		target   string
		mock     func(string) ([]models.Commission, error)
		wantCode int
	}{
		{"Success", "/?artist_id=a1", func(string) ([]models.Commission, error) { return []models.Commission{{ID: "c1"}}, nil }, http.StatusOK},
		{"Missing artist_id", "/", nil, http.StatusBadRequest},
		{"Error", "/?artist_id=a1", func(string) ([]models.Commission, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockGetByArtistID: tt.mock})
			w := serve(http.MethodGet, "/", tt.target, "", h.GetArtistCommissions)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

// statusTransition covers the Accept/Start/SubmitForReview/Cancel handlers which
// share the same GetByID + Update flow.
func TestCommissionHandler_StatusTransitions(t *testing.T) {
	type transition struct {
		name    string
		pattern string
		target  string
		invoke  func(h handler.CommissionHandler) http.HandlerFunc
	}
	transitions := []transition{
		{"Accept", "/{id}/accept", "/c1/accept", func(h handler.CommissionHandler) http.HandlerFunc { return h.AcceptCommission }},
		{"Start", "/{id}/start", "/c1/start", func(h handler.CommissionHandler) http.HandlerFunc { return h.StartCommission }},
		{"SubmitForReview", "/{id}/review", "/c1/review", func(h handler.CommissionHandler) http.HandlerFunc { return h.SubmitForReview }},
		{"Cancel", "/{id}/cancel", "/c1/cancel", func(h handler.CommissionHandler) http.HandlerFunc { return h.CancelCommission }},
	}

	for _, tr := range transitions {
		t.Run(tr.name+" success", func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{
				mockGetByID: func(id string) (*models.Commission, error) { return &models.Commission{ID: id}, nil },
				mockUpdate:  func(*models.Commission) error { return nil },
			})
			w := serve(http.MethodPost, tr.pattern, tr.target, "", tr.invoke(h))
			if w.Code != http.StatusNoContent {
				t.Errorf("%s code = %v, want %v", tr.name, w.Code, http.StatusNoContent)
			}
		})

		t.Run(tr.name+" error", func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{
				mockGetByID: func(string) (*models.Commission, error) { return nil, errors.New("db") },
			})
			w := serve(http.MethodPost, tr.pattern, tr.target, "", tr.invoke(h))
			if w.Code != http.StatusInternalServerError {
				t.Errorf("%s code = %v, want %v", tr.name, w.Code, http.StatusInternalServerError)
			}
		})
	}
}

func TestCommissionHandler_DeleteWorkUpload(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(string) error
		wantCode int
	}{
		{"Success", func(string) error { return nil }, http.StatusNoContent},
		{"Error", func(string) error { return errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockDeleteWorkUpload: tt.mock})
			w := serve(http.MethodDelete, "/uploads/{uploadId}", "/uploads/u1", "", h.DeleteWorkUpload)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_RequestRevision(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetByID:        func(id string) (*models.Commission, error) { return &models.Commission{ID: id}, nil },
			mockUpdate:         func(*models.Commission) error { return nil },
			mockCreateRevision: func(*models.CommissionRevision) error { return nil },
		})
		w := serve(http.MethodPost, "/", "/", `{"commission_id":"c1","work_upload_id":"u1","request_notes":"fix"}`, h.RequestRevision)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{})
		w := serve(http.MethodPost, "/", "/", `{"commission_id":`, h.RequestRevision)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})

	t.Run("Commission not found", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetByID: func(string) (*models.Commission, error) { return nil, nil },
		})
		w := serve(http.MethodPost, "/", "/", `{"commission_id":"c1"}`, h.RequestRevision)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("code = %v, want %v", w.Code, http.StatusInternalServerError)
		}
	})
}

func TestCommissionHandler_GetRevisions(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(string) ([]models.CommissionRevision, error)
		wantCode int
	}{
		{"Success", func(string) ([]models.CommissionRevision, error) { return []models.CommissionRevision{{ID: "r1"}}, nil }, http.StatusOK},
		{"Error", func(string) ([]models.CommissionRevision, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockGetRevisionsByCID: tt.mock})
			w := serve(http.MethodGet, "/{id}/revisions", "/c1/revisions", "", h.GetRevisions)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_ApproveRevision(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetRevisionsByCID: func(string) ([]models.CommissionRevision, error) {
				return []models.CommissionRevision{{ID: "r1", CommissionID: "c1"}}, nil
			},
			mockUpdateRevision: func(*models.CommissionRevision) error { return nil },
			mockGetByID:        func(id string) (*models.Commission, error) { return &models.Commission{ID: id}, nil },
			mockUpdate:         func(*models.Commission) error { return nil },
		})
		w := serve(http.MethodPost, "/revisions/{revisionId}/approve", "/revisions/r1/approve", "", h.ApproveRevision)
		if w.Code != http.StatusNoContent {
			t.Errorf("code = %v, want %v", w.Code, http.StatusNoContent)
		}
	})

	t.Run("Revision not found", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetRevisionsByCID: func(string) ([]models.CommissionRevision, error) { return nil, nil },
		})
		w := serve(http.MethodPost, "/revisions/{revisionId}/approve", "/revisions/r1/approve", "", h.ApproveRevision)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("code = %v, want %v", w.Code, http.StatusInternalServerError)
		}
	})
}

func TestCommissionHandler_RejectRevision(t *testing.T) {
	h := newCommissionHandler(&mockCommissionRepo{
		mockGetRevisionsByCID: func(string) ([]models.CommissionRevision, error) {
			return []models.CommissionRevision{{ID: "r1", CommissionID: "c1"}}, nil
		},
		mockUpdateRevision: func(*models.CommissionRevision) error { return nil },
	})
	w := serve(http.MethodPost, "/revisions/{revisionId}/reject", "/revisions/r1/reject", "", h.RejectRevision)
	if w.Code != http.StatusNoContent {
		t.Errorf("code = %v, want %v", w.Code, http.StatusNoContent)
	}
}

func TestCommissionHandler_RespondToRevision(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetRevisionsByCID: func(string) ([]models.CommissionRevision, error) {
				return []models.CommissionRevision{{ID: "r1", CommissionID: "c1"}}, nil
			},
			mockUpdateRevision: func(*models.CommissionRevision) error { return nil },
		})
		w := serve(http.MethodPost, "/", "/", `{"revision_id":"r1","response_notes":"done"}`, h.RespondToRevision)
		if w.Code != http.StatusNoContent {
			t.Errorf("code = %v, want %v", w.Code, http.StatusNoContent)
		}
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{})
		w := serve(http.MethodPost, "/", "/", `{"revision_id":`, h.RespondToRevision)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})
}

func TestCommissionHandler_CreateRefund(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetByID:      func(id string) (*models.Commission, error) { return &models.Commission{ID: id}, nil },
			mockUpdate:       func(*models.Commission) error { return nil },
			mockCreateRefund: func(*models.Refund) error { return nil },
		})
		w := serve(http.MethodPost, "/", "/", `{"commission_id":"c1","amount":50,"reason":"x"}`, h.CreateRefund)
		if w.Code != http.StatusOK {
			t.Errorf("code = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{})
		w := serve(http.MethodPost, "/", "/", `{"amount":`, h.CreateRefund)
		if w.Code != http.StatusBadRequest {
			t.Errorf("code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})
}

func TestCommissionHandler_GetRefund(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(string) (*models.Refund, error)
		wantCode int
	}{
		{"Found", func(cid string) (*models.Refund, error) { return &models.Refund{CommissionID: cid}, nil }, http.StatusOK},
		{"Not found", func(string) (*models.Refund, error) { return nil, nil }, http.StatusNotFound},
		{"Error", func(string) (*models.Refund, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockGetRefundByCID: tt.mock})
			w := serve(http.MethodGet, "/{id}/refund", "/c1/refund", "", h.GetRefund)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_ProcessRefund(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetRefundByCID: func(cid string) (*models.Refund, error) { return &models.Refund{CommissionID: cid}, nil },
			mockUpdateRefund:   func(*models.Refund) error { return nil },
		})
		w := serve(http.MethodPost, "/{id}/refund/process", "/c1/refund/process", "", h.ProcessRefund)
		if w.Code != http.StatusNoContent {
			t.Errorf("code = %v, want %v", w.Code, http.StatusNoContent)
		}
	})

	t.Run("Refund not found", func(t *testing.T) {
		h := newCommissionHandler(&mockCommissionRepo{
			mockGetRefundByCID: func(string) (*models.Refund, error) { return nil, nil },
		})
		w := serve(http.MethodPost, "/{id}/refund/process", "/c1/refund/process", "", h.ProcessRefund)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("code = %v, want %v", w.Code, http.StatusInternalServerError)
		}
	})
}

func TestCommissionHandler_SendMessage(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		mock     func(*models.ChatMessage) error
		wantCode int
	}{
		{"Success", `{"commission_id":"c1","sender_id":"s1","content":"hi"}`, func(*models.ChatMessage) error { return nil }, http.StatusOK},
		{"Invalid JSON", `{"commission_id":`, nil, http.StatusBadRequest},
		{"Error", `{"commission_id":"c1","sender_id":"s1","content":"hi"}`, func(*models.ChatMessage) error { return errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockCreateChatMessage: tt.mock})
			w := serve(http.MethodPost, "/", "/", tt.body, h.SendMessage)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_GetMessages(t *testing.T) {
	tests := []struct {
		name     string
		mock     func(string) ([]models.ChatMessage, error)
		wantCode int
	}{
		{"Success", func(string) ([]models.ChatMessage, error) { return []models.ChatMessage{{ID: "m1"}}, nil }, http.StatusOK},
		{"Error", func(string) ([]models.ChatMessage, error) { return nil, errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockGetChatMessagesByCID: tt.mock})
			w := serve(http.MethodGet, "/{id}/messages", "/c1/messages", "", h.GetMessages)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestCommissionHandler_MarkMessagesRead(t *testing.T) {
	tests := []struct {
		name     string
		target   string
		mock     func(cid, userID string) error
		wantCode int
	}{
		{"Success", "/c1/messages/read?user_id=u1", func(string, string) error { return nil }, http.StatusNoContent},
		{"Missing user_id", "/c1/messages/read", nil, http.StatusBadRequest},
		{"Error", "/c1/messages/read?user_id=u1", func(string, string) error { return errors.New("db") }, http.StatusInternalServerError},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newCommissionHandler(&mockCommissionRepo{mockMarkMessagesAsRead: tt.mock})
			w := serve(http.MethodPost, "/{id}/messages/read", tt.target, "", h.MarkMessagesRead)
			if w.Code != tt.wantCode {
				t.Errorf("code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}
