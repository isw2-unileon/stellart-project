package service

import (
	"bytes"
	"errors"
	"html/template"
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

type ContactService struct {
	supportEmail string
	emailSender  EmailSender
}

func NewContactService(supportEmail string, emailSender EmailSender) *ContactService {
	return &ContactService{
		supportEmail: supportEmail,
		emailSender:  emailSender,
	}
}

func (s *ContactService) ProcessContact(msg dto.ContactMessage) error {
	if msg.Name == "" || msg.Email == "" || msg.Message == "" {
		return errors.New("name, email and message are required")
	}

	const emailTemplate = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f8fafc; border-radius: 8px; overflow: hidden; }
        .header { background: #eab308; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
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
</html>`

	t, err := template.New("email").Parse(emailTemplate)
	if err != nil {
		return err
	}

	var body bytes.Buffer
	if err := t.Execute(&body, msg); err != nil {
		return err
	}

	return s.emailSender.Send("Acme <onboarding@resend.dev>", s.supportEmail, "New Contact Request: "+msg.Subject, body.String())
}
