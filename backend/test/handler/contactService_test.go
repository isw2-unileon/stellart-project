package handler_test

import (
	"errors"
	"strings"
	"testing"

	"stellart/backend/src/dto"
	"stellart/backend/src/service"
)

func TestContactService_ProcessContact(t *testing.T) {
	t.Run("Sends email with subject", func(t *testing.T) {
		var captured string
		sender := &mockEmailSender{
			mockSend: func(from, to, subject, html string) error {
				captured = subject
				return nil
			},
		}
		svc := service.NewContactService("support@stellart.com", sender)

		err := svc.ProcessContact(dto.ContactMessage{
			Name:    "Jane",
			Email:   "jane@example.com",
			Subject: "Question",
			Message: "Hello there",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if captured != "New Contact Request: Question" {
			t.Errorf("subject = %q, want %q", captured, "New Contact Request: Question")
		}
	})

	t.Run("Renders fallback when subject is empty", func(t *testing.T) {
		var capturedHTML string
		sender := &mockEmailSender{
			mockSend: func(from, to, subject, html string) error {
				capturedHTML = html
				return nil
			},
		}
		svc := service.NewContactService("support@stellart.com", sender)

		err := svc.ProcessContact(dto.ContactMessage{
			Name:    "Jane",
			Email:   "jane@example.com",
			Message: "No subject here",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !strings.Contains(capturedHTML, "Not provided") {
			t.Error("expected the email body to render the 'Not provided' subject fallback")
		}
	})

	t.Run("Validation fails when required fields missing", func(t *testing.T) {
		svc := service.NewContactService("support@stellart.com", &mockEmailSender{})

		cases := []dto.ContactMessage{
			{Email: "a@b.com", Message: "m"},
			{Name: "n", Message: "m"},
			{Name: "n", Email: "a@b.com"},
		}
		for _, c := range cases {
			if err := svc.ProcessContact(c); err == nil {
				t.Errorf("expected validation error for %+v", c)
			}
		}
	})

	t.Run("Propagates sender error", func(t *testing.T) {
		sender := &mockEmailSender{
			mockSend: func(from, to, subject, html string) error {
				return errors.New("smtp down")
			},
		}
		svc := service.NewContactService("support@stellart.com", sender)

		err := svc.ProcessContact(dto.ContactMessage{
			Name:    "Jane",
			Email:   "jane@example.com",
			Subject: "Hi",
			Message: "body",
		})
		if err == nil {
			t.Error("expected error from email sender to propagate")
		}
	})
}
