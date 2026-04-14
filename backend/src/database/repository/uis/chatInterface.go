package uis

import "stellart/backend/src/dto"

type ChatRepository interface {
	SaveMessage(commissionID, senderID, content string) error
	GetHistory(commissionID string) ([]dto.ChatMessage, error)
}
