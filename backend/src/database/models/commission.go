package models

import "time"

type CommissionStatus string

const (
	CommissionStatusPending    CommissionStatus = "pending"
	CommissionStatusAccepted   CommissionStatus = "accepted"
	CommissionStatusInProgress CommissionStatus = "in_progress"
	CommissionStatusReview     CommissionStatus = "review"
	CommissionStatusRevised    CommissionStatus = "revised"
	CommissionStatusCompleted  CommissionStatus = "completed"
	CommissionStatusRefunded   CommissionStatus = "refunded"
	CommissionStatusCancelled  CommissionStatus = "cancelled"
)

type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusPaid     PaymentStatus = "paid"
	PaymentStatusReleased PaymentStatus = "released"
	PaymentStatusRefunded PaymentStatus = "refunded"
	PaymentStatusFailed   PaymentStatus = "failed"
)

type RevisionStatus string

const (
	RevisionStatusPending  RevisionStatus = "pending"
	RevisionStatusApproved RevisionStatus = "approved"
	RevisionStatusRejected RevisionStatus = "rejected"
)

type Commission struct {
	ID          string           `json:"id"`
	BuyerID     string           `json:"buyer_id"`
	ArtistID    string           `json:"artist_id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Price       float64          `json:"price"`
	Status      CommissionStatus `json:"status"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Deadline    *time.Time       `json:"deadline"`
}

type AdvancePayment struct {
	ID            string        `json:"id"`
	CommissionID  string        `json:"commission_id"`
	Amount        float64       `json:"amount"`
	Status        PaymentStatus `json:"status"`
	PaymentIntent string        `json:"payment_intent"`
	CreatedAt     time.Time     `json:"created_at"`
	PaidAt        *time.Time    `json:"paid_at"`
}

type WorkUpload struct {
	ID           string    `json:"id"`
	CommissionID string    `json:"commission_id"`
	ImageURL     string    `json:"image_url"`
	Watermarked  bool      `json:"watermarked"`
	IsFinal      bool      `json:"is_final"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
}

type CommissionRevision struct {
	ID           string         `json:"id"`
	CommissionID string         `json:"commission_id"`
	WorkUploadID string         `json:"work_upload_id"`
	RequestNotes string         `json:"request_notes"`
	Status       RevisionStatus `json:"status"`
	CreatedAt    time.Time      `json:"created_at"`
	ResolvedAt   *time.Time     `json:"resolved_at"`
}

type Refund struct {
	ID           string        `json:"id"`
	CommissionID string        `json:"commission_id"`
	Amount       float64       `json:"amount"`
	Reason       string        `json:"reason"`
	Status       PaymentStatus `json:"status"`
	CreatedAt    time.Time     `json:"created_at"`
	ProcessedAt  *time.Time    `json:"processed_at"`
}

type ChatMessage struct {
	ID           string     `json:"id"`
	CommissionID string     `json:"commission_id"`
	SenderID     string     `json:"sender_id"`
	Content      string     `json:"content"`
	CreatedAt    time.Time  `json:"created_at"`
	ReadAt       *time.Time `json:"read_at"`
}
