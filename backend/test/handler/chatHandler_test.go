package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/websocket"

	"stellart/backend/src/dto"
	"stellart/backend/src/handler"
	"stellart/backend/src/service"
)

type savedMessage struct {
	commissionID string
	senderID     string
	content      string
}

type mockChatRepo struct {
	mu       sync.Mutex
	saved    []savedMessage
	saveErr  error
	mockHist func(commissionID string) ([]dto.ChatMessage, error)
}

func (m *mockChatRepo) SaveMessage(commissionID, senderID, content string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.saved = append(m.saved, savedMessage{commissionID, senderID, content})
	return m.saveErr
}

func (m *mockChatRepo) GetHistory(commissionID string) ([]dto.ChatMessage, error) {
	if m.mockHist != nil {
		return m.mockHist(commissionID)
	}
	return nil, nil
}

func (m *mockChatRepo) savedCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.saved)
}

func dialChat(t *testing.T, repo *mockChatRepo) (*websocket.Conn, func()) {
	t.Helper()

	svc := service.NewChatService(repo)
	h := handler.NewChatHandler(svc)

	server := httptest.NewServer(http.HandlerFunc(h.HandleWebSocket))
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	conn, _, err := websocket.DefaultDialer.Dial(wsURL+"?commission_id=c1&sender_id=s1", nil)
	if err != nil {
		server.Close()
		t.Fatalf("failed to dial websocket: %v", err)
	}

	cleanup := func() {
		conn.Close()
		server.Close()
	}
	return conn, cleanup
}

func TestChatHandler_HandleWebSocket_EchoAndPersist(t *testing.T) {
	repo := &mockChatRepo{}
	conn, cleanup := dialChat(t, repo)
	defer cleanup()

	if err := conn.WriteMessage(websocket.TextMessage, []byte("hello")); err != nil {
		t.Fatalf("write failed: %v", err)
	}

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("read failed: %v", err)
	}

	if string(msg) != "hello" {
		t.Errorf("expected echo 'hello', got %q", string(msg))
	}

	if repo.savedCount() != 1 {
		t.Fatalf("expected 1 persisted message, got %d", repo.savedCount())
	}
	got := repo.saved[0]
	if got.commissionID != "c1" || got.senderID != "s1" || got.content != "hello" {
		t.Errorf("unexpected persisted message: %+v", got)
	}
}

func TestChatHandler_HandleWebSocket_EmptyContentKeepsConnection(t *testing.T) {
	repo := &mockChatRepo{}
	conn, cleanup := dialChat(t, repo)
	defer cleanup()

	// Empty content makes the service return an error; the handler should skip
	// it (no echo, no persistence) but keep the connection open.
	if err := conn.WriteMessage(websocket.TextMessage, []byte("")); err != nil {
		t.Fatalf("write empty failed: %v", err)
	}
	if err := conn.WriteMessage(websocket.TextMessage, []byte("valid")); err != nil {
		t.Fatalf("write valid failed: %v", err)
	}

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("read failed: %v", err)
	}

	if string(msg) != "valid" {
		t.Errorf("expected echo 'valid', got %q", string(msg))
	}

	if repo.savedCount() != 1 {
		t.Errorf("expected only the valid message persisted, got %d", repo.savedCount())
	}
}
