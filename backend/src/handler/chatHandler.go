package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"stellart/backend/src/database/models"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"

	"github.com/gorilla/websocket"
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
			if clients, ok := h.clients[message.CommissionID]; ok {
				for conn := range clients {
					err := conn.WriteMessage(websocket.TextMessage, message.Message)
					if err != nil {
						conn.Close()
						delete(clients, conn)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *ChatHub) RegisterClient(commissionID string, conn *websocket.Conn) {
	h.register <- RegisterClient{CommissionID: commissionID, Conn: conn}
}

func (h *ChatHub) UnregisterClient(commissionID string, conn *websocket.Conn) {
	h.unregister <- UnregisterClient{CommissionID: commissionID, Conn: conn}
}

type ChatHandler struct {
	commissionService *service.CommissionService
	hub               *ChatHub
}

func NewChatHandler(cs *service.CommissionService, hub *ChatHub) ChatHandler {
	return ChatHandler{
		commissionService: cs,
		hub:               hub,
	}
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
			msgBytes, _ := json.Marshal(dto.WSMessage{
				Type:      "message",
				SenderID:  msg.SenderID,
				Content:   msg.Content,
				CreatedAt: msg.CreatedAt.String(),
			})
			conn.WriteMessage(websocket.TextMessage, msgBytes)
		}
	}

	go h.readLoop(commissionID, userID, conn)
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

		var wsMsg dto.WSMessage
		if err := json.Unmarshal(messageBytes, &wsMsg); err != nil {
			continue
		}

		if wsMsg.Type == "message" && wsMsg.Content != "" {
			dbMsg := &models.ChatMessage{
				CommissionID: commissionID,
				SenderID:     userID,
				Content:      wsMsg.Content,
			}

			if err := h.commissionService.SendMessage(dbMsg); err != nil {
				log.Printf("Error saving message: %v", err)
				continue
			}

			wsMsg.SenderID = userID
			broadcastBytes, _ := json.Marshal(wsMsg)

			h.hub.broadcast <- BroadcastMessage{
				CommissionID: commissionID,
				Message:      broadcastBytes,
				SenderID:     userID,
			}
		}
	}
}
