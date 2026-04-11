package dto

type CreateCommission struct {
	CommissionID string  `json:"commission_id"`
	BuyerID      string  `json:"buyer_id" validate:"required"`
	ArtistID     string  `json:"artist_id" validate:"required"`
	Title        string  `json:"title" validate:"required"`
	Description  string  `json:"description" validate:"required"`
	Price        float64 `json:"price" validate:"required,gt=0"`
	Deadline     string  `json:"deadline"`
}

type UpdateCommissionStatus struct {
	Status string `json:"status" validate:"required"`
}

type CreatePayment struct {
	PaymentID     string  `json:"payment_id"`
	CommissionID  string  `json:"commission_id"`
	Amount        float64 `json:"amount"`
	PaymentIntent string  `json:"payment_intent"`
}

type UploadWork struct {
	UploadID      string `json:"upload_id"`
	CommissionID  string `json:"commission_id"`
	ImageURL      string `json:"image_url"`
	CleanImageURL string `json:"clean_image_url"`
	Watermarked   bool   `json:"watermarked"`
	IsFinal       bool   `json:"is_final"`
	Notes         string `json:"notes"`
}

type RequestRevision struct {
	RevisionID   string `json:"revision_id"`
	CommissionID string `json:"commission_id"`
	WorkUploadID string `json:"work_upload_id"`
	RequestNotes string `json:"request_notes"`
}

type RespondToRevision struct {
	RevisionID    string `json:"revision_id"`
	ResponseNotes string `json:"response_notes"`
}

type CreateRefund struct {
	RefundID     string  `json:"refund_id"`
	CommissionID string  `json:"commission_id"`
	Amount       float64 `json:"amount"`
	Reason       string  `json:"reason"`
}

type SendMessage struct {
	MessageID    string `json:"message_id"`
	CommissionID string `json:"commission_id"`
	SenderID     string `json:"sender_id"`
	Content      string `json:"content"`
}
