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

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOrderDTO
	json.NewDecoder(r.Body).Decode(&req)
	order, err := h.Service.CreateOrder(req.BuyerID, req)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) ShipOrder(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "id")
	var req dto.UpdateTrackingDTO
	json.NewDecoder(r.Body).Decode(&req)

	err := h.Service.MarkAsShipped(orderID, req.SellerID, req.TrackingCode, req.Carrier)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *OrderHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	role := r.URL.Query().Get("role")
	userID := r.URL.Query().Get("userId")
	orders, _ := h.Service.GetOrdersByUser(userID, role)
	json.NewEncoder(w).Encode(orders)
}

func (h *OrderHandler) DeliverOrder(w http.ResponseWriter, r *http.Request) {
	orderID := chi.URLParam(r, "id")
	buyerID := r.URL.Query().Get("user_id")
	err := h.Service.MarkAsDelivered(orderID, buyerID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusOK)
}
