package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"stellart/backend/src/database/models"
	"stellart/backend/src/service"

	"github.com/go-chi/chi/v5"
)

type CommissionHandler struct {
	commissionService *service.CommissionService
}

func NewCommissionHandler(cs *service.CommissionService) CommissionHandler {
	return CommissionHandler{commissionService: cs}
}

type CreateCommissionRequest struct {
	CommissionID string  `json:"commission_id"`
	BuyerID      string  `json:"buyer_id"`
	ArtistID     string  `json:"artist_id"`
	Title        string  `json:"title"`
	Description  string  `json:"description"`
	Price        float64 `json:"price"`
	Deadline     string  `json:"deadline"`
}

func (h *CommissionHandler) CreateCommission(w http.ResponseWriter, r *http.Request) {
	var req CreateCommissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// NO asignamos ID manualmente, dejamos que el repositorio/BD lo haga
	commission := &models.Commission{
		BuyerID:     req.BuyerID,
		ArtistID:    req.ArtistID,
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
	}

	if req.Deadline != "" {
		parsedDeadline, err := parseTime(req.Deadline)
		if err == nil && parsedDeadline != nil {
			commission.Deadline = parsedDeadline
		}
	}

	if err := h.commissionService.CreateCommission(commission); err != nil {
		log.Printf("[ERROR] CreateCommission failed: %v", err)
		http.Error(w, "Failed to create commission: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commission)
}

func (h *CommissionHandler) GetCommission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	commission, err := h.commissionService.GetCommission(id)
	if err != nil {
		http.Error(w, "Failed to fetch commission", http.StatusInternalServerError)
		return
	}
	if commission == nil {
		http.Error(w, "Commission not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commission)
}

func (h *CommissionHandler) GetBuyerCommissions(w http.ResponseWriter, r *http.Request) {
	buyerID := r.URL.Query().Get("buyer_id")
	if buyerID == "" {
		http.Error(w, "buyer_id required", http.StatusBadRequest)
		return
	}
	commissions, err := h.commissionService.GetBuyerCommissions(buyerID)
	if err != nil {
		http.Error(w, "Failed to fetch commissions", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commissions)
}

func (h *CommissionHandler) GetArtistCommissions(w http.ResponseWriter, r *http.Request) {
	artistID := r.URL.Query().Get("artist_id")
	if artistID == "" {
		http.Error(w, "artist_id required", http.StatusBadRequest)
		return
	}
	commissions, err := h.commissionService.GetArtistCommissions(artistID)
	if err != nil {
		http.Error(w, "Failed to fetch commissions", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commissions)
}

func (h *CommissionHandler) AcceptCommission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.commissionService.AcceptCommission(id); err != nil {
		http.Error(w, "Failed to accept commission", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) StartCommission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.commissionService.StartCommission(id); err != nil {
		http.Error(w, "Failed to start commission", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) SubmitForReview(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.commissionService.SubmitForReview(id); err != nil {
		http.Error(w, "Failed to submit for review", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) ApproveWork(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.commissionService.ApproveWork(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Commission not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to approve work", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) CancelCommission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.commissionService.CancelCommission(id); err != nil {
		http.Error(w, "Failed to cancel commission", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) DenyCommission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.commissionService.DenyCommission(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Commission not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to deny commission", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type CreatePaymentRequest struct {
	PaymentID     string  `json:"payment_id"`
	CommissionID  string  `json:"commission_id"`
	Amount        float64 `json:"amount"`
	PaymentIntent string  `json:"payment_intent"`
}

func (h *CommissionHandler) CreateAdvancePayment(w http.ResponseWriter, r *http.Request) {
	log.Printf("[DEBUG] CreateAdvancePayment called - Method: %s, Path: %s", r.Method, r.URL.Path)

	var req CreatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] CreateAdvancePayment - Invalid payload: %v", err)
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	log.Printf("[DEBUG] CreateAdvancePayment - Request: %+v", req)

	payment := &models.AdvancePayment{
		CommissionID:  req.CommissionID,
		Amount:        req.Amount,
		PaymentIntent: req.PaymentIntent,
	}

	if err := h.commissionService.CreateAdvancePayment(payment); err != nil {
		log.Printf("[ERROR] CreateAdvancePayment - Service error: %v", err)
		http.Error(w, "Failed to create payment: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[DEBUG] CreateAdvancePayment - Success, payment ID: %s", payment.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *CommissionHandler) GetAdvancePayment(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	payment, err := h.commissionService.GetAdvancePayment(commissionID)
	if err != nil {
		http.Error(w, "Failed to fetch payment", http.StatusInternalServerError)
		return
	}
	if payment == nil {
		http.Error(w, "Payment not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *CommissionHandler) MarkPaymentPaid(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	if err := h.commissionService.MarkPaymentPaid(commissionID); err != nil {
		http.Error(w, "Failed to mark payment as paid", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) ReleasePayment(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	if err := h.commissionService.ReleasePayment(commissionID); err != nil {
		http.Error(w, "Failed to release payment", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) CreateRemainingPayment(w http.ResponseWriter, r *http.Request) {
	log.Printf("[DEBUG] CreateRemainingPayment called - Method: %s, Path: %s", r.Method, r.URL.Path)

	var req CreatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] CreateRemainingPayment - Invalid payload: %v", err)
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	log.Printf("[DEBUG] CreateRemainingPayment - Request: %+v", req)

	payment := &models.RemainingPayment{
		CommissionID:  req.CommissionID,
		Amount:        req.Amount,
		PaymentIntent: req.PaymentIntent,
	}

	if err := h.commissionService.CreateRemainingPayment(payment); err != nil {
		log.Printf("[ERROR] CreateRemainingPayment - Service error: %v", err)
		http.Error(w, "Failed to create remaining payment: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[DEBUG] CreateRemainingPayment - Success, payment ID: %s", payment.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *CommissionHandler) GetRemainingPayment(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	payment, err := h.commissionService.GetRemainingPayment(commissionID)
	if err != nil {
		http.Error(w, "Failed to fetch remaining payment", http.StatusInternalServerError)
		return
	}
	if payment == nil {
		http.Error(w, "Payment not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *CommissionHandler) MarkRemainingPaymentPaid(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	if err := h.commissionService.MarkRemainingPaymentPaid(commissionID); err != nil {
		http.Error(w, "Failed to mark remaining payment as paid", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type UploadWorkRequest struct {
	UploadID      string `json:"upload_id"`
	CommissionID  string `json:"commission_id"`
	ImageURL      string `json:"image_url"`
	CleanImageURL string `json:"clean_image_url"`
	Watermarked   bool   `json:"watermarked"`
	IsFinal       bool   `json:"is_final"`
	Notes         string `json:"notes"`
}

func (h *CommissionHandler) UploadWork(w http.ResponseWriter, r *http.Request) {
	var req UploadWorkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	upload := &models.WorkUpload{
		CommissionID:  req.CommissionID,
		ImageURL:      req.ImageURL,
		CleanImageURL: req.CleanImageURL,
		Watermarked:   req.Watermarked,
		IsFinal:       req.IsFinal,
		Notes:         req.Notes,
	}

	if err := h.commissionService.CreateWorkUpload(upload); err != nil {
		log.Printf("[ERROR] UploadWork - Service error: %v", err)
		http.Error(w, "Failed to upload work", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(upload)
}

func (h *CommissionHandler) GetWorkUploads(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	uploads, err := h.commissionService.GetWorkUploads(commissionID)
	if err != nil {
		http.Error(w, "Failed to fetch uploads", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(uploads)
}

type RequestRevisionRequest struct {
	RevisionID   string `json:"revision_id"`
	CommissionID string `json:"commission_id"`
	WorkUploadID string `json:"work_upload_id"`
	RequestNotes string `json:"request_notes"`
}

func (h *CommissionHandler) RequestRevision(w http.ResponseWriter, r *http.Request) {
	var req RequestRevisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	revision := &models.CommissionRevision{
		CommissionID: req.CommissionID,
		WorkUploadID: req.WorkUploadID,
		RequestNotes: req.RequestNotes,
	}

	if err := h.commissionService.RequestRevision(revision); err != nil {
		log.Printf("[ERROR] RequestRevision - Service error: %v", err)
		http.Error(w, "Failed to request revision", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(revision)
}

func (h *CommissionHandler) GetRevisions(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	revisions, err := h.commissionService.GetRevisions(commissionID)
	if err != nil {
		http.Error(w, "Failed to fetch revisions", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(revisions)
}

func (h *CommissionHandler) ApproveRevision(w http.ResponseWriter, r *http.Request) {
	revisionID := chi.URLParam(r, "revisionId")
	if err := h.commissionService.ApproveRevision(revisionID); err != nil {
		http.Error(w, "Failed to approve revision", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CommissionHandler) RejectRevision(w http.ResponseWriter, r *http.Request) {
	revisionID := chi.URLParam(r, "revisionId")
	if err := h.commissionService.RejectRevision(revisionID); err != nil {
		http.Error(w, "Failed to reject revision", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type RespondToRevisionRequest struct {
	RevisionID    string `json:"revision_id"`
	ResponseNotes string `json:"response_notes"`
}

func (h *CommissionHandler) RespondToRevision(w http.ResponseWriter, r *http.Request) {
	var req RespondToRevisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.commissionService.RespondToRevision(req.RevisionID, req.ResponseNotes); err != nil {
		http.Error(w, "Failed to respond to revision", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type CreateRefundRequest struct {
	RefundID     string  `json:"refund_id"`
	CommissionID string  `json:"commission_id"`
	Amount       float64 `json:"amount"`
	Reason       string  `json:"reason"`
}

func (h *CommissionHandler) CreateRefund(w http.ResponseWriter, r *http.Request) {
	var req CreateRefundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	refund := &models.Refund{
		CommissionID: req.CommissionID,
		Amount:       req.Amount,
		Reason:       req.Reason,
	}

	if err := h.commissionService.CreateRefund(refund); err != nil {
		log.Printf("[ERROR] CreateRefund - Service error: %v", err)
		http.Error(w, "Failed to create refund", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(refund)
}

func (h *CommissionHandler) GetRefund(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	refund, err := h.commissionService.GetRefund(commissionID)
	if err != nil {
		http.Error(w, "Failed to fetch refund", http.StatusInternalServerError)
		return
	}
	if refund == nil {
		http.Error(w, "Refund not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(refund)
}

func (h *CommissionHandler) ProcessRefund(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	if err := h.commissionService.ProcessRefund(commissionID); err != nil {
		http.Error(w, "Failed to process refund", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type SendMessageRequest struct {
	MessageID    string `json:"message_id"`
	CommissionID string `json:"commission_id"`
	SenderID     string `json:"sender_id"`
	Content      string `json:"content"`
}

func (h *CommissionHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	message := &models.ChatMessage{
		CommissionID: req.CommissionID,
		SenderID:     req.SenderID,
		Content:      req.Content,
	}

	if err := h.commissionService.SendMessage(message); err != nil {
		log.Printf("[ERROR] SendMessage - Service error: %v", err)
		http.Error(w, "Failed to send message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

func (h *CommissionHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	messages, err := h.commissionService.GetMessages(commissionID)
	if err != nil {
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (h *CommissionHandler) MarkMessagesRead(w http.ResponseWriter, r *http.Request) {
	commissionID := chi.URLParam(r, "id")
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id required", http.StatusBadRequest)
		return
	}
	if err := h.commissionService.MarkMessagesRead(commissionID, userID); err != nil {
		http.Error(w, "Failed to mark messages as read", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func parseTime(s string) (*time.Time, error) {
	if s == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}
