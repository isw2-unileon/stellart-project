package uis

import "stellart/backend/src/database/models"

type CommissionRepository interface {
	Create(commission *models.Commission) error
	GetByID(id string) (*models.Commission, error)
	GetByBuyerID(buyerID string) ([]models.Commission, error)
	GetByArtistID(artistID string) ([]models.Commission, error)
	Update(commission *models.Commission) error

	CreateAdvancePayment(payment *models.AdvancePayment) error
	GetAdvancePaymentByCommissionID(commissionID string) (*models.AdvancePayment, error)
	UpdateAdvancePayment(payment *models.AdvancePayment) error

	CreateRemainingPayment(payment *models.RemainingPayment) error
	GetRemainingPaymentByCommissionID(commissionID string) (*models.RemainingPayment, error)
	UpdateRemainingPayment(payment *models.RemainingPayment) error

	CreateWorkUpload(upload *models.WorkUpload) error
	GetWorkUploadsByCommissionID(commissionID string) ([]models.WorkUpload, error)
	UpdateWorkUpload(upload *models.WorkUpload) error

	CreateRevision(revision *models.CommissionRevision) error
	GetRevisionsByCommissionID(commissionID string) ([]models.CommissionRevision, error)
	UpdateRevision(revision *models.CommissionRevision) error

	CreateRefund(refund *models.Refund) error
	GetRefundByCommissionID(commissionID string) (*models.Refund, error)
	UpdateRefund(refund *models.Refund) error

	CreateChatMessage(message *models.ChatMessage) error
	GetChatMessagesByCommissionID(commissionID string) ([]models.ChatMessage, error)
	MarkMessagesAsRead(commissionID, userID string) error
}
