package handler

import (
	"bytes"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/resend/resend-go/v3"
)

type EmailSender interface {
	Send(from, to, subject, html string) error
}

type ResendEmailSender struct {
	apiKey string
}

func NewResendEmailSender(apiKey string) *ResendEmailSender {
	return &ResendEmailSender{apiKey: apiKey}
}

func (s *ResendEmailSender) Send(from, to, subject, html string) error {
	client := resend.NewClient(s.apiKey)
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}
	_, err := client.Emails.Send(params)
	return err
}

type ContactHandler struct {
	supportEmail string
	emailSender  EmailSender
}

func NewContactHandler(supportEmail string, emailSender EmailSender) ContactHandler {
	return ContactHandler{
		supportEmail: supportEmail,
		emailSender:  emailSender,
	}
}

func NewContactHandlerWithEnv(supportEmail string) ContactHandler {
	apiKey := os.Getenv("RESEND_API_KEY")
	emailSender := NewResendEmailSender(apiKey)
	return NewContactHandler(supportEmail, emailSender)
}

type ContactRequest struct {
	Name    string `json:"name"`
	Title   string `json:"title"`
	Message string `json:"message"`
}

func (h *ContactHandler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if h.emailSender == nil {
		log.Println("Email service not configured")
		http.Error(w, "Email service not configured", http.StatusInternalServerError)
		return
	}

	emailBody := buildEmailBody(req)

	err := h.emailSender.Send(
		"Stellart Support <noreply@resend.dev>",
		h.supportEmail,
		"[Stellart Support] "+req.Title,
		emailBody,
	)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	log.Printf("Contact email sent from %s", req.Name)
	w.WriteHeader(http.StatusNoContent)
}

func BuildEmailBody(req ContactRequest) string {
	return buildEmailBody(req)
}

func buildEmailBody(req ContactRequest) string {
	tmpl := `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0f172a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
        .field { margin-bottom: 16px; }
        .label { font-weight: bold; color: #475569; font-size: 12px; text-transform: uppercase; }
        .value { margin-top: 4px; }
        .message-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Message</h1>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name</div>
                <div class="value">{{.Name}}</div>
            </div>
            <div class="field">
                <div class="label">Title</div>
                <div class="value">{{.Title}}</div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="message-box">{{.Message}}</div>
            </div>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("email").Parse(tmpl)
	var html bytes.Buffer
	t.Execute(&html, req)
	return html.String()
}
