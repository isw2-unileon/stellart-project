package postgres

import (
	"database/sql"
	"stellart/backend/src/dto"
)

type ChatRepository struct {
	db *sql.DB
}

func NewChatRepository(db *sql.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) SaveMessage(commissionID, senderID, content string) error {
	query := `INSERT INTO chat_messages (commission_id, sender_id, content) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(query, commissionID, senderID, content)
	return err
}

func (r *ChatRepository) GetHistory(commissionID string) ([]dto.ChatMessage, error) {
	return nil, nil
}
