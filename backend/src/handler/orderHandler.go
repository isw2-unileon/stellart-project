package handler

import (
	"encoding/json"
	"net/http"
	"stellart/backend/src/dto"
	"stellart/backend/src/service"

	"github.com/go-chi/chi/v5"
)

type OrderHandler struct {
	Service *service.OrderService
}

func NewOrderHandler(service *service.OrderService) *OrderHandler {
	return &OrderHandler{Service: service}
}

func (h *OrderHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	// Extract role from query params ("buyer" or "seller")
	role := r.URL.Query().Get("role")
	// Extract user ID from Auth middleware context
	userID := r.Context().Value("userID").(string)

	orders, err := h.Service.GetOrdersByUser(userID, role)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func (h *OrderHandler) ShipOrder(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "id")
	sellerID := r.Context().Value("userID").(string)

	var req dto.UpdateTrackingDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request payload", http.StatusBadRequest)
		return
	}

	err := h.Service.MarkAsShipped(orderID, sellerID, req.TrackingCode)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrderHandler) DeliverOrder(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "id")
	buyerID := r.Context().Value("userID").(string)

	err := h.Service.MarkAsDelivered(orderID, buyerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
