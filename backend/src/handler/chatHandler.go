package handler

import (
	"log"
	"net/http"

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

type ChatHandler struct {
	service *service.ChatService
}

func NewChatHandler(s *service.ChatService) *ChatHandler {
	return &ChatHandler{service: s}
}

func (h *ChatHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	commissionID := r.URL.Query().Get("commission_id")
	senderID := r.URL.Query().Get("sender_id")

	for {
		messageType, msgBytes, err := conn.ReadMessage()
		if err != nil {
			break
		}

		content := string(msgBytes)

		err = h.service.SendMessage(commissionID, senderID, content)
		if err != nil {
			continue
		}

		err = conn.WriteMessage(messageType, msgBytes)
		if err != nil {
			break
		}
	}
}
