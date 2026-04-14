package dto

import "time"

type ChatMessage struct {
	ID           string     `json:"id"`
	CommissionID string     `json:"commission_id"`
	SenderID     string     `json:"sender_id"`
	Content      string     `json:"content"`
	CreatedAt    time.Time  `json:"created_at"`
	ReadAt       *time.Time `json:"read_at,omitempty"`
}
