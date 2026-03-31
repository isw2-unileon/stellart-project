package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type MockEmailSender struct {
	SendFunc func(from, to, subject, html string) error
}

func (m *MockEmailSender) Send(from, to, subject, html string) error {
	if m.SendFunc != nil {
		return m.SendFunc(from, to, subject, html)
	}
	return nil
}

func TestContactHandler_SubmitContact_Success(t *testing.T) {
	mockSender := &MockEmailSender{
		SendFunc: func(from, to, subject, html string) error {
			return nil
		},
	}
	handler := NewContactHandler("support@test.com", mockSender)

	reqBody := ContactRequest{
		Name:    "John Doe",
		Title:   "Test Title",
		Message: "Test message content",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.SubmitContact(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected status %d, got %d", http.StatusNoContent, w.Code)
	}
}

func TestContactHandler_SubmitContact_InvalidMethod(t *testing.T) {
	mockSender := &MockEmailSender{}
	handler := NewContactHandler("support@test.com", mockSender)

	req := httptest.NewRequest(http.MethodGet, "/contact", nil)
	w := httptest.NewRecorder()

	handler.SubmitContact(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status %d, got %d", http.StatusMethodNotAllowed, w.Code)
	}
}

func TestContactHandler_SubmitContact_InvalidPayload(t *testing.T) {
	mockSender := &MockEmailSender{}
	handler := NewContactHandler("support@test.com", mockSender)

	req := httptest.NewRequest(http.MethodPost, "/contact", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.SubmitContact(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestContactHandler_SubmitContact_NilEmailSender(t *testing.T) {
	handler := NewContactHandler("support@test.com", nil)

	reqBody := ContactRequest{
		Name:    "John",
		Title:   "Test",
		Message: "Message",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.SubmitContact(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestContactHandler_SubmitContact_EmailSendError(t *testing.T) {
	mockSender := &MockEmailSender{
		SendFunc: func(from, to, subject, html string) error {
			return errors.New("email failed")
		},
	}
	handler := NewContactHandler("support@test.com", mockSender)

	reqBody := ContactRequest{
		Name:    "John",
		Title:   "Test",
		Message: "Message",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.SubmitContact(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestBuildEmailBody(t *testing.T) {
	req := ContactRequest{
		Name:    "Jane Doe",
		Title:   "Bug Report",
		Message: "This is a test message",
	}

	html := BuildEmailBody(req)

	if html == "" {
		t.Error("expected non-empty HTML")
	}

	if !bytes.Contains([]byte(html), []byte("Jane Doe")) {
		t.Error("HTML should contain Name")
	}

	if !bytes.Contains([]byte(html), []byte("Bug Report")) {
		t.Error("HTML should contain Title")
	}

	if !bytes.Contains([]byte(html), []byte("This is a test message")) {
		t.Error("HTML should contain Message")
	}

	if !bytes.Contains([]byte(html), []byte("New Contact Message")) {
		t.Error("HTML should contain header")
	}
}

func TestNewContactHandler(t *testing.T) {
	mockSender := &MockEmailSender{}
	email := "test@example.com"
	handler := NewContactHandler(email, mockSender)

	if handler.supportEmail != email {
		t.Errorf("expected supportEmail %s, got %s", email, handler.supportEmail)
	}

	if handler.emailSender != mockSender {
		t.Error("expected emailSender to be set")
	}
}

func TestContactHandler_SubmitContact_SendsCorrectEmailData(t *testing.T) {
	var capturedFrom, capturedTo, capturedSubject, capturedHtml string

	mockSender := &MockEmailSender{
		SendFunc: func(from, to, subject, html string) error {
			capturedFrom = from
			capturedTo = to
			capturedSubject = subject
			capturedHtml = html
			return nil
		},
	}
	handler := NewContactHandler("support@stellart.com", mockSender)

	reqBody := ContactRequest{
		Name:    "Test User",
		Title:   "Help Request",
		Message: "Need assistance",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.SubmitContact(w, req)

	if capturedFrom != "Stellart Support <noreply@resend.dev>" {
		t.Errorf("expected from '%s', got '%s'", "Stellart Support <noreply@resend.dev>", capturedFrom)
	}

	if capturedTo != "support@stellart.com" {
		t.Errorf("expected to '%s', got '%s'", "support@stellart.com", capturedTo)
	}

	if capturedSubject != "[Stellart Support] Help Request" {
		t.Errorf("expected subject '%s', got '%s'", "[Stellart Support] Help Request", capturedSubject)
	}

	if capturedHtml == "" {
		t.Error("expected non-empty html")
	}
}
