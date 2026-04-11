package dto

type WSMessage struct {
	Type      string `json:"type"`
	SenderID  string `json:"sender_id,omitempty"`
	Content   string `json:"content,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
}
