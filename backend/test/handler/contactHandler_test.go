package handler_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"stellart/backend/src/handler"
	"stellart/backend/src/service"
)

type mockEmailSender struct {
	mockSend func(from, to, subject, html string) error
}

func (m *mockEmailSender) Send(from, to, subject, html string) error {
	if m.mockSend != nil {
		return m.mockSend(from, to, subject, html)
	}
	return nil
}

func TestContactHandler_SubmitContact(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  string
		mockBehavior func(from, to, subject, html string) error
		wantCode     int
	}{
		{
			name:        "Contact submitted successfully",
			requestBody: `{"name":"John Doe","email":"john@example.com","subject":"Help Request","message":"I need some help."}`,
			mockBehavior: func(from, to, subject, html string) error {
				return nil
			},
			wantCode: http.StatusOK,
		},
		{
			name:        "Invalid JSON payload",
			requestBody: `{"name":"John Doe","email":"john@example.com"`,
			mockBehavior: func(from, to, subject, html string) error {
				return nil
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name:        "Missing required fields",
			requestBody: `{"name":"John Doe","subject":"Help Request"}`,
			mockBehavior: func(from, to, subject, html string) error {
				return nil
			},
			// El handler actual devuelve 500 si el servicio lanza error por campos faltantes
			wantCode: http.StatusInternalServerError,
		},
		{
			name:        "Email sender failure",
			requestBody: `{"name":"John Doe","email":"john@example.com","subject":"Help Request","message":"I need some help."}`,
			mockBehavior: func(from, to, subject, html string) error {
				return errors.New("failed to send email")
			},
			wantCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSender := &mockEmailSender{
				mockSend: tt.mockBehavior,
			}

			// ARREGLO: Creamos el servicio primero y se lo pasamos al Handler
			svc := service.NewContactService("support@stellart.com", mockSender)
			h := handler.NewContactHandler(svc)

			r := chi.NewRouter()
			r.Post("/contact", h.SubmitContact)

			req := httptest.NewRequest(http.MethodPost, "/contact", strings.NewReader(tt.requestBody))
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("SubmitContact() code = %v, want %v", w.Code, tt.wantCode)
			}
		})
	}
}

func TestContactHandler_SubmitContact_EmailFormat(t *testing.T) {
	var capturedFrom, capturedTo, capturedSubject, capturedHtml string

	mockSender := &mockEmailSender{
		mockSend: func(from, to, subject, html string) error {
			capturedFrom = from
			capturedTo = to
			capturedSubject = subject
			capturedHtml = html
			return nil
		},
	}

	svc := service.NewContactService("support@stellart.com", mockSender)
	h := handler.NewContactHandler(svc)

	r := chi.NewRouter()
	r.Post("/contact", h.SubmitContact)

	body := `{"name":"Jane Doe","email":"jane@example.com","subject":"Inquiry","message":"Question regarding commissions."}`
	req := httptest.NewRequest(http.MethodPost, "/contact", strings.NewReader(body))
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	expectedFrom := "Acme <onboarding@resend.dev>"
	if capturedFrom != expectedFrom {
		t.Errorf("expected from '%s', got '%s'", expectedFrom, capturedFrom)
	}

	expectedTo := "support@stellart.com"
	if capturedTo != expectedTo {
		t.Errorf("expected to '%s', got '%s'", expectedTo, capturedTo)
	}

	expectedSubject := "New Contact Request: Inquiry"
	if capturedSubject != expectedSubject {
		t.Errorf("expected subject '%s', got '%s'", expectedSubject, capturedSubject)
	}

	if capturedHtml == "" {
		t.Error("expected html body to not be empty")
	}
}
