package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"stellart/backend/src/database/models"
	"stellart/backend/src/service"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type ChatHub struct {
	clients    map[string]map[*websocket.Conn]bool
	broadcast  chan BroadcastMessage
	register   chan RegisterClient
	unregister chan UnregisterClient
	mu         sync.RWMutex
}

type BroadcastMessage struct {
	CommissionID string
	Message      []byte
	SenderID     string
}

type RegisterClient struct {
	CommissionID string
	Conn         *websocket.Conn
}

type UnregisterClient struct {
	CommissionID string
	Conn         *websocket.Conn
}

func NewChatHub() *ChatHub {
	return &ChatHub{
		clients:    make(map[string]map[*websocket.Conn]bool),
		broadcast:  make(chan BroadcastMessage),
		register:   make(chan RegisterClient),
		unregister: make(chan UnregisterClient),
	}
}

func (h *ChatHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.CommissionID] == nil {
				h.clients[client.CommissionID] = make(map[*websocket.Conn]bool)
			}
			h.clients[client.CommissionID][client.Conn] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.CommissionID]; ok {
				if _, ok := clients[client.Conn]; ok {
					delete(clients, client.Conn)
					client.Conn.Close()
					if len(clients) == 0 {
						delete(h.clients, client.CommissionID)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			clients := h.clients[message.CommissionID]
			h.mu.RUnlock()

			for client := range clients {
				err := client.WriteMessage(websocket.TextMessage, message.Message)
				if err != nil {
					client.Close()
					h.unregister <- UnregisterClient{
						CommissionID: message.CommissionID,
						Conn:         client,
					}
				}
			}
		}
	}
}

func (h *ChatHub) RegisterClient(commissionID string, conn *websocket.Conn) {
	h.register <- RegisterClient{
		CommissionID: commissionID,
		Conn:         conn,
	}
}

func (h *ChatHub) UnregisterClient(commissionID string, conn *websocket.Conn) {
	h.unregister <- UnregisterClient{
		CommissionID: commissionID,
		Conn:         conn,
	}
}

func (h *ChatHub) Broadcast(commissionID, senderID string, message []byte) {
	h.broadcast <- BroadcastMessage{
		CommissionID: commissionID,
		Message:      message,
		SenderID:     senderID,
	}
}

type ChatHandler struct {
	hub               *ChatHub
	commissionService *service.CommissionService
}

func NewChatHandler(hub *ChatHub, cs *service.CommissionService) *ChatHandler {
	return &ChatHandler{
		hub:               hub,
		commissionService: cs,
	}
}

type WSMessage struct {
	Type      string `json:"type"`
	SenderID  string `json:"sender_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

func (h *ChatHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	commissionID := r.URL.Query().Get("commission_id")
	userID := r.URL.Query().Get("user_id")

	if commissionID == "" || userID == "" {
		http.Error(w, "commission_id and user_id required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	h.hub.RegisterClient(commissionID, conn)

	messages, err := h.commissionService.GetMessages(commissionID)
	if err == nil {
		for _, msg := range messages {
			msgBytes, _ := json.Marshal(WSMessage{
				Type:      "message",
				SenderID:  msg.SenderID,
				Content:   msg.Content,
				CreatedAt: msg.CreatedAt.String(),
			})
			conn.WriteMessage(websocket.TextMessage, msgBytes)
		}
	}

	go h.readLoop(commissionID, userID, conn)
	go h.writeLoop(commissionID, conn)
}

func (h *ChatHandler) readLoop(commissionID, userID string, conn *websocket.Conn) {
	defer func() {
		h.hub.UnregisterClient(commissionID, conn)
		conn.Close()
	}()

	for {
		_, messageBytes, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var wsMsg WSMessage
		if err := json.Unmarshal(messageBytes, &wsMsg); err != nil {
			continue
		}

		chatMsg := &models.ChatMessage{
			ID:           generateID(),
			CommissionID: commissionID,
			SenderID:     userID,
			Content:      wsMsg.Content,
		}

		if err := h.commissionService.SendMessage(chatMsg); err != nil {
			log.Printf("Error saving message: %v", err)
			continue
		}

		wsMsg.CreatedAt = chatMsg.CreatedAt.String()
		wsMsg.Type = "message"

		broadcastBytes, _ := json.Marshal(wsMsg)
		h.hub.Broadcast(commissionID, userID, broadcastBytes)
	}
}

func (h *ChatHandler) writeLoop(commissionID string, conn *websocket.Conn) {
	defer conn.Close()
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func generateID() string {
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), rand.Intn(100000))
}
