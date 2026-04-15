package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"
)

type ContactHandler struct {
	service *service.ContactService
}

func NewContactHandler(s *service.ContactService) ContactHandler {
	return ContactHandler{service: s}
}

func (h *ContactHandler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	var msg dto.ContactMessage

	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.ProcessContact(msg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Message sent successfully",
	})
}
