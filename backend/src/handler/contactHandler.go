package handler

import (
	"bytes"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"

	"stellart/backend/src/dto"

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
	return NewContactHandler(supportEmail, NewResendEmailSender(apiKey))
}

func (h *ContactHandler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req dto.ContactMessage
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding contact request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Email == "" || req.Message == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	if h.emailSender == nil {
		log.Printf("Email sender not configured")
		http.Error(w, "Email service not configured", http.StatusInternalServerError)
		return
	}

	htmlBody, err := generateEmailHTML(req)
	if err != nil {
		log.Printf("Error generating email HTML: %v", err)
		http.Error(w, "Error preparing email", http.StatusInternalServerError)
		return
	}

	subject := "Stellart Contact: " + req.Subject
	if req.Subject == "" {
		subject = "New Stellart Contact Message"
	}

	fromEmail := "Stellart Support <onboarding@resend.dev>"

	err = h.emailSender.Send(
		fromEmail,
		h.supportEmail,
		subject,
		htmlBody,
	)

	if err != nil {
		log.Printf("Error sending email: %v", err)
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Contact form submitted successfully"})
}

func generateEmailHTML(req dto.ContactMessage) (string, error) {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; }
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
                <div class="label">Email</div>
                <div class="value"><a href="mailto:{{.Email}}">{{.Email}}</a></div>
            </div>
            <div class="field">
                <div class="label">Subject</div>
                <div class="value">{{if .Subject}}{{.Subject}}{{else}}Not provided{{end}}</div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="message-box">{{.Message}}</div>
            </div>
        </div>
    </div>
</body>
</html>
`
	t, err := template.New("email").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, req); err != nil {
		return "", err
	}

	return buf.String(), nil
}
