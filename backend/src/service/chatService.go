package service

import (
	"errors"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/dto"
)

type ChatService struct {
	repo uis.ChatRepository
}

func NewChatService(repo uis.ChatRepository) *ChatService {
	return &ChatService{repo: repo}
}

func (s *ChatService) SendMessage(commID, senderID, content string) error {
	if content == "" {
		return errors.New("content cannot be empty")
	}
	return s.repo.SaveMessage(commID, senderID, content)
}

func (s *ChatService) GetHistory(commID string) ([]dto.ChatMessage, error) {
	if commID == "" {
		return nil, errors.New("commission ID is required")
	}
	return s.repo.GetHistory(commID)
}
