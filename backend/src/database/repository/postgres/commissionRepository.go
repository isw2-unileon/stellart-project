package postgres

import (
	"database/sql"
	"errors"
	"log"
	"time"

	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type postgresCommissionRepo struct {
	db *sql.DB
}

func NewCommissionRepository(db *sql.DB) uis.CommissionRepository {
	return &postgresCommissionRepo{
		db: db,
	}
}

func (r *postgresCommissionRepo) Create(commission *models.Commission) error {
	query := `
		INSERT INTO public.commissions (buyer_id, artist_id, title, description, price, status, deadline)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		commission.BuyerID,
		commission.ArtistID,
		commission.Title,
		commission.Description,
		commission.Price,
		commission.Status,
		commission.Deadline,
	).Scan(&commission.ID, &commission.CreatedAt, &commission.UpdatedAt)
}

func (r *postgresCommissionRepo) GetByID(id string) (*models.Commission, error) {
	query := `
		SELECT id, buyer_id, artist_id, title, description, price, status, created_at, updated_at, deadline
		FROM public.commissions
		WHERE id = $1`

	var c models.Commission
	err := r.db.QueryRow(query, id).Scan(
		&c.ID, &c.BuyerID, &c.ArtistID, &c.Title, &c.Description,
		&c.Price, &c.Status, &c.CreatedAt, &c.UpdatedAt, &c.Deadline,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &c, nil
}

func (r *postgresCommissionRepo) GetByBuyerID(buyerID string) ([]models.Commission, error) {
	query := `
		SELECT id, buyer_id, artist_id, title, description, price, status, created_at, updated_at, deadline
		FROM public.commissions
		WHERE buyer_id = $1
		ORDER BY created_at DESC`

	return r.scanCommissions(query, buyerID)
}

func (r *postgresCommissionRepo) GetByArtistID(artistID string) ([]models.Commission, error) {
	query := `
		SELECT id, buyer_id, artist_id, title, description, price, status, created_at, updated_at, deadline
		FROM public.commissions
		WHERE artist_id = $1
		ORDER BY created_at DESC`

	return r.scanCommissions(query, artistID)
}

func (r *postgresCommissionRepo) scanCommissions(query string, arg interface{}) ([]models.Commission, error) {
	rows, err := r.db.Query(query, arg)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var commissions []models.Commission
	for rows.Next() {
		var c models.Commission
		err := rows.Scan(
			&c.ID, &c.BuyerID, &c.ArtistID, &c.Title, &c.Description,
			&c.Price, &c.Status, &c.CreatedAt, &c.UpdatedAt, &c.Deadline,
		)
		if err != nil {
			return nil, err
		}
		commissions = append(commissions, c)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return commissions, nil
}

func (r *postgresCommissionRepo) Update(commission *models.Commission) error {
	query := `
		UPDATE public.commissions
		SET title = $1, description = $2, price = $3, status = $4, deadline = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $6
		RETURNING updated_at`

	return r.db.QueryRow(query,
		commission.Title,
		commission.Description,
		commission.Price,
		commission.Status,
		commission.Deadline,
		commission.ID,
	).Scan(&commission.UpdatedAt)
}

func (r *postgresCommissionRepo) CreateAdvancePayment(payment *models.AdvancePayment) error {
	log.Printf("[DEBUG] Repo.CreateAdvancePayment - Inserting payment: %+v", payment)

	query := `
		INSERT INTO public.advance_payments (commission_id, amount, status, payment_intent)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`

	err := r.db.QueryRow(query,
		payment.CommissionID,
		payment.Amount,
		payment.Status,
		payment.PaymentIntent,
	).Scan(&payment.ID, &payment.CreatedAt)

	if err != nil {
		log.Printf("[ERROR] Repo.CreateAdvancePayment - DB error: %v", err)
		return err
	}

	log.Printf("[DEBUG] Repo.CreateAdvancePayment - Success, created_at: %v", payment.CreatedAt)
	return nil
}

func (r *postgresCommissionRepo) GetAdvancePaymentByCommissionID(commissionID string) (*models.AdvancePayment, error) {
	query := `
		SELECT id, commission_id, amount, status, payment_intent, created_at, paid_at
		FROM public.advance_payments
		WHERE commission_id = $1`

	var p models.AdvancePayment
	err := r.db.QueryRow(query, commissionID).Scan(
		&p.ID, &p.CommissionID, &p.Amount, &p.Status,
		&p.PaymentIntent, &p.CreatedAt, &p.PaidAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *postgresCommissionRepo) UpdateAdvancePayment(payment *models.AdvancePayment) error {
	query := `
		UPDATE public.advance_payments
		SET status = $1, paid_at = $2
		WHERE id = $3`

	_, err := r.db.Exec(query, payment.Status, payment.PaidAt, payment.ID)
	return err
}

func (r *postgresCommissionRepo) CreateRemainingPayment(payment *models.RemainingPayment) error {
	query := `
		INSERT INTO public.remaining_payments (commission_id, amount, status, payment_intent)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`

	return r.db.QueryRow(query,
		payment.CommissionID,
		payment.Amount,
		payment.Status,
		payment.PaymentIntent,
	).Scan(&payment.ID, &payment.CreatedAt)
}

func (r *postgresCommissionRepo) GetRemainingPaymentByCommissionID(commissionID string) (*models.RemainingPayment, error) {
	query := `
		SELECT id, commission_id, amount, status, payment_intent, created_at, paid_at
		FROM public.remaining_payments
		WHERE commission_id = $1`

	var p models.RemainingPayment
	err := r.db.QueryRow(query, commissionID).Scan(
		&p.ID, &p.CommissionID, &p.Amount, &p.Status,
		&p.PaymentIntent, &p.CreatedAt, &p.PaidAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *postgresCommissionRepo) UpdateRemainingPayment(payment *models.RemainingPayment) error {
	query := `
		UPDATE public.remaining_payments
		SET status = $1, paid_at = $2
		WHERE id = $3`

	_, err := r.db.Exec(query, payment.Status, payment.PaidAt, payment.ID)
	return err
}

func (r *postgresCommissionRepo) CreateWorkUpload(upload *models.WorkUpload) error {
	query := `
		INSERT INTO public.work_uploads (commission_id, image_url, clean_image_url, watermarked, is_final, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at`

	return r.db.QueryRow(query,
		upload.CommissionID,
		upload.ImageURL,
		upload.CleanImageURL,
		upload.Watermarked,
		upload.IsFinal,
		upload.Notes,
	).Scan(&upload.ID, &upload.CreatedAt)
}

func (r *postgresCommissionRepo) GetWorkUploadsByCommissionID(commissionID string) ([]models.WorkUpload, error) {
	query := `
		SELECT id, commission_id, image_url, clean_image_url, watermarked, is_final, notes, created_at
		FROM public.work_uploads
		WHERE commission_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query, commissionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var uploads []models.WorkUpload
	for rows.Next() {
		var u models.WorkUpload
		err := rows.Scan(&u.ID, &u.CommissionID, &u.ImageURL, &u.CleanImageURL, &u.Watermarked, &u.IsFinal, &u.Notes, &u.CreatedAt)
		if err != nil {
			return nil, err
		}
		uploads = append(uploads, u)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return uploads, nil
}

func (r *postgresCommissionRepo) UpdateWorkUpload(upload *models.WorkUpload) error {
	query := `
		UPDATE public.work_uploads
		SET is_final = $1
		WHERE id = $2`

	_, err := r.db.Exec(query, upload.IsFinal, upload.ID)
	return err
}

func (r *postgresCommissionRepo) CreateRevision(revision *models.CommissionRevision) error {
	query := `
		INSERT INTO public.commission_revisions (commission_id, work_upload_id, request_notes, response_notes, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at`

	return r.db.QueryRow(query,
		revision.CommissionID,
		revision.WorkUploadID,
		revision.RequestNotes,
		revision.ResponseNotes,
		revision.Status,
	).Scan(&revision.ID, &revision.CreatedAt)
}

func (r *postgresCommissionRepo) GetRevisionsByCommissionID(commissionID string) ([]models.CommissionRevision, error) {
	query := `
		SELECT id, commission_id, work_upload_id, request_notes, response_notes, status, created_at, resolved_at
		FROM public.commission_revisions
		WHERE commission_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query, commissionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var revisions []models.CommissionRevision
	for rows.Next() {
		var rev models.CommissionRevision
		err := rows.Scan(&rev.ID, &rev.CommissionID, &rev.WorkUploadID, &rev.RequestNotes, &rev.ResponseNotes, &rev.Status, &rev.CreatedAt, &rev.ResolvedAt)
		if err != nil {
			return nil, err
		}
		revisions = append(revisions, rev)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return revisions, nil
}

func (r *postgresCommissionRepo) UpdateRevision(revision *models.CommissionRevision) error {
	query := `
		UPDATE public.commission_revisions
		SET status = $1, resolved_at = $2
		WHERE id = $3`

	resolvedAt := time.Now()
	if revision.Status == models.RevisionStatusPending {
		resolvedAt = time.Time{}
	}

	_, err := r.db.Exec(query, revision.Status, resolvedAt, revision.ID)
	return err
}

func (r *postgresCommissionRepo) CreateRefund(refund *models.Refund) error {
	query := `
		INSERT INTO public.refunds (commission_id, amount, reason, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`

	return r.db.QueryRow(query,
		refund.CommissionID,
		refund.Amount,
		refund.Reason,
		refund.Status,
	).Scan(&refund.ID, &refund.CreatedAt)
}

func (r *postgresCommissionRepo) GetRefundByCommissionID(commissionID string) (*models.Refund, error) {
	query := `
		SELECT id, commission_id, amount, reason, status, created_at, processed_at
		FROM public.refunds
		WHERE commission_id = $1`

	var ref models.Refund
	err := r.db.QueryRow(query, commissionID).Scan(
		&ref.ID, &ref.CommissionID, &ref.Amount, &ref.Reason, &ref.Status, &ref.CreatedAt, &ref.ProcessedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &ref, nil
}

func (r *postgresCommissionRepo) UpdateRefund(refund *models.Refund) error {
	query := `
		UPDATE public.refunds
		SET status = $1, processed_at = $2
		WHERE id = $3`

	processedAt := time.Now()
	if refund.Status == models.PaymentStatusPending {
		processedAt = time.Time{}
	}

	_, err := r.db.Exec(query, refund.Status, processedAt, refund.ID)
	return err
}

func (r *postgresCommissionRepo) CreateChatMessage(message *models.ChatMessage) error {
	query := `
		INSERT INTO public.chat_messages (commission_id, sender_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`

	return r.db.QueryRow(query,
		message.CommissionID,
		message.SenderID,
		message.Content,
	).Scan(&message.ID, &message.CreatedAt)
}

func (r *postgresCommissionRepo) GetChatMessagesByCommissionID(commissionID string) ([]models.ChatMessage, error) {
	query := `
		SELECT id, commission_id, sender_id, content, created_at, read_at
		FROM public.chat_messages
		WHERE commission_id = $1
		ORDER BY created_at ASC`

	rows, err := r.db.Query(query, commissionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.ChatMessage
	for rows.Next() {
		var m models.ChatMessage
		err := rows.Scan(&m.ID, &m.CommissionID, &m.SenderID, &m.Content, &m.CreatedAt, &m.ReadAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *postgresCommissionRepo) MarkMessagesAsRead(commissionID, userID string) error {
	query := `
		UPDATE public.chat_messages
		SET read_at = CURRENT_TIMESTAMP
		WHERE commission_id = $1 AND sender_id != $2 AND read_at IS NULL`

	_, err := r.db.Exec(query, commissionID, userID)
	return err
}
