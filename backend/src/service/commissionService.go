package service

import (
	"errors"
	"time"

	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type CommissionService struct {
	commissionRepo uis.CommissionRepository
}

func NewCommissionService(repo uis.CommissionRepository) *CommissionService {
	return &CommissionService{
		commissionRepo: repo,
	}
}

func (s *CommissionService) CreateCommission(commission *models.Commission) error {
	commission.Status = models.CommissionStatusPending
	return s.commissionRepo.Create(commission)
}

func (s *CommissionService) GetCommission(id string) (*models.Commission, error) {
	return s.commissionRepo.GetByID(id)
}

func (s *CommissionService) GetBuyerCommissions(buyerID string) ([]models.Commission, error) {
	return s.commissionRepo.GetByBuyerID(buyerID)
}

func (s *CommissionService) GetArtistCommissions(artistID string) ([]models.Commission, error) {
	return s.commissionRepo.GetByArtistID(artistID)
}

func (s *CommissionService) AcceptCommission(id string) error {
	commission, err := s.commissionRepo.GetByID(id)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}

	commission.Status = models.CommissionStatusAccepted
	return s.commissionRepo.Update(commission)
}

func (s *CommissionService) StartCommission(id string) error {
	commission, err := s.commissionRepo.GetByID(id)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}

	commission.Status = models.CommissionStatusInProgress
	return s.commissionRepo.Update(commission)
}

func (s *CommissionService) SubmitForReview(id string) error {
	commission, err := s.commissionRepo.GetByID(id)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}

	commission.Status = models.CommissionStatusReview
	return s.commissionRepo.Update(commission)
}

func (s *CommissionService) ApproveWork(commissionID string) error {
	commission, err := s.commissionRepo.GetByID(commissionID)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}

	uploads, err := s.commissionRepo.GetWorkUploadsByCommissionID(commissionID)
	if err != nil {
		return err
	}

	for i := range uploads {
		uploads[i].IsFinal = true
		s.commissionRepo.UpdateWorkUpload(&uploads[i])
	}

	commission.Status = models.CommissionStatusCompleted
	return s.commissionRepo.Update(commission)
}

func (s *CommissionService) CreateAdvancePayment(payment *models.AdvancePayment) error {
	payment.Status = models.PaymentStatusPending
	return s.commissionRepo.CreateAdvancePayment(payment)
}

func (s *CommissionService) GetAdvancePayment(commissionID string) (*models.AdvancePayment, error) {
	return s.commissionRepo.GetAdvancePaymentByCommissionID(commissionID)
}

func (s *CommissionService) MarkPaymentPaid(commissionID string) error {
	payment, err := s.commissionRepo.GetAdvancePaymentByCommissionID(commissionID)
	if err != nil {
		return err
	}
	if payment == nil {
		return errors.New("payment not found")
	}

	now := time.Now()
	payment.Status = models.PaymentStatusPaid
	payment.PaidAt = &now
	return s.commissionRepo.UpdateAdvancePayment(payment)
}

func (s *CommissionService) CreateRemainingPayment(payment *models.RemainingPayment) error {
	payment.Status = models.PaymentStatusPending
	return s.commissionRepo.CreateRemainingPayment(payment)
}

func (s *CommissionService) GetRemainingPayment(commissionID string) (*models.RemainingPayment, error) {
	return s.commissionRepo.GetRemainingPaymentByCommissionID(commissionID)
}

func (s *CommissionService) MarkRemainingPaymentPaid(commissionID string) error {
	payment, err := s.commissionRepo.GetRemainingPaymentByCommissionID(commissionID)
	if err != nil {
		return err
	}
	if payment == nil {
		return errors.New("payment not found")
	}

	now := time.Now()
	payment.Status = models.PaymentStatusPaid
	payment.PaidAt = &now
	return s.commissionRepo.UpdateRemainingPayment(payment)
}

func (s *CommissionService) ReleasePayment(commissionID string) error {
	advancePayment, err := s.commissionRepo.GetAdvancePaymentByCommissionID(commissionID)
	if err != nil {
		return err
	}
	if advancePayment == nil {
		return errors.New("advance payment not found")
	}

	now := time.Now()
	advancePayment.Status = models.PaymentStatusReleased
	advancePayment.PaidAt = &now
	if err := s.commissionRepo.UpdateAdvancePayment(advancePayment); err != nil {
		return err
	}

	remainingPayment, err := s.commissionRepo.GetRemainingPaymentByCommissionID(commissionID)
	if err != nil {
		return err
	}
	if remainingPayment != nil {
		remainingPayment.Status = models.PaymentStatusReleased
		remainingPayment.PaidAt = &now
		return s.commissionRepo.UpdateRemainingPayment(remainingPayment)
	}

	return nil
}

func (s *CommissionService) CreateWorkUpload(upload *models.WorkUpload) error {
	return s.commissionRepo.CreateWorkUpload(upload)
}

func (s *CommissionService) GetWorkUploads(commissionID string) ([]models.WorkUpload, error) {
	return s.commissionRepo.GetWorkUploadsByCommissionID(commissionID)
}

func (s *CommissionService) RequestRevision(revision *models.CommissionRevision) error {
	revision.Status = models.RevisionStatusPending

	commission, err := s.commissionRepo.GetByID(revision.CommissionID)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}
	commission.Status = models.CommissionStatusRevised
	s.commissionRepo.Update(commission)

	return s.commissionRepo.CreateRevision(revision)
}

func (s *CommissionService) GetRevisions(commissionID string) ([]models.CommissionRevision, error) {
	return s.commissionRepo.GetRevisionsByCommissionID(commissionID)
}

func (s *CommissionService) ApproveRevision(revisionID string) error {
	revisions, err := s.commissionRepo.GetRevisionsByCommissionID("")
	if err != nil {
		return err
	}

	var revision *models.CommissionRevision
	for i := range revisions {
		if revisions[i].ID == revisionID {
			revision = &revisions[i]
			break
		}
	}
	if revision == nil {
		return errors.New("revision not found")
	}

	revision.Status = models.RevisionStatusApproved
	err = s.commissionRepo.UpdateRevision(revision)
	if err != nil {
		return err
	}

	commission, err := s.commissionRepo.GetByID(revision.CommissionID)
	if err != nil {
		return err
	}
	commission.Status = models.CommissionStatusInProgress
	return s.commissionRepo.Update(commission)
}

func (s *CommissionService) RejectRevision(revisionID string) error {
	revisions, err := s.commissionRepo.GetRevisionsByCommissionID("")
	if err != nil {
		return err
	}

	var revision *models.CommissionRevision
	for i := range revisions {
		if revisions[i].ID == revisionID {
			revision = &revisions[i]
			break
		}
	}
	if revision == nil {
		return errors.New("revision not found")
	}

	revision.Status = models.RevisionStatusRejected
	return s.commissionRepo.UpdateRevision(revision)
}

func (s *CommissionService) CreateRefund(refund *models.Refund) error {
	refund.Status = models.PaymentStatusPending

	commission, err := s.commissionRepo.GetByID(refund.CommissionID)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}
	commission.Status = models.CommissionStatusRefunded
	s.commissionRepo.Update(commission)

	return s.commissionRepo.CreateRefund(refund)
}

func (s *CommissionService) GetRefund(commissionID string) (*models.Refund, error) {
	return s.commissionRepo.GetRefundByCommissionID(commissionID)
}

func (s *CommissionService) ProcessRefund(commissionID string) error {
	refund, err := s.commissionRepo.GetRefundByCommissionID(commissionID)
	if err != nil {
		return err
	}
	if refund == nil {
		return errors.New("refund not found")
	}

	refund.Status = models.PaymentStatusRefunded
	return s.commissionRepo.UpdateRefund(refund)
}

func (s *CommissionService) CancelCommission(id string) error {
	commission, err := s.commissionRepo.GetByID(id)
	if err != nil {
		return err
	}
	if commission == nil {
		return errors.New("commission not found")
	}

	commission.Status = models.CommissionStatusCancelled
	return s.commissionRepo.Update(commission)
}

func (s *CommissionService) SendMessage(message *models.ChatMessage) error {
	return s.commissionRepo.CreateChatMessage(message)
}

func (s *CommissionService) GetMessages(commissionID string) ([]models.ChatMessage, error) {
	return s.commissionRepo.GetChatMessagesByCommissionID(commissionID)
}

func (s *CommissionService) MarkMessagesRead(commissionID, userID string) error {
	return s.commissionRepo.MarkMessagesAsRead(commissionID, userID)
}
