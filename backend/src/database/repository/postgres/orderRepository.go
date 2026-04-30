package postgres

import (
	"database/sql"
	"errors"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type OrderRepository struct {
	DB *sql.DB
}

func NewOrderRepository(db *sql.DB) uis.OrderInterface {
	return &OrderRepository{DB: db}
}

func (r *OrderRepository) GetByID(id string) (*models.Order, error) {
	var order models.Order

	query := `
		SELECT id, artwork_id, buyer_id, seller_id, shipping_address_id, amount, status, seller_bank_account_id, tracking_code, created_at, shipped_at, delivered_at
		FROM orders 
		WHERE id = $1`

	err := r.DB.QueryRow(query, id).Scan(
		&order.ID,
		&order.ArtworkID,
		&order.BuyerID,
		&order.SellerID,
		&order.ShippingAddressID,
		&order.Amount,
		&order.Status,
		&order.SellerBankAccountID,
		&order.TrackingCode,
		&order.CreatedAt,
		&order.ShippedAt,
		&order.DeliveredAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("pedido no encontrado")
		}
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) GetOrdersByRole(userID string, role string) ([]models.Order, error) {
	var orders []models.Order
	var query string

	if role == "buyer" {
		query = `
			SELECT id, artwork_id, buyer_id, seller_id, shipping_address_id, amount, status, seller_bank_account_id, tracking_code, created_at, shipped_at, delivered_at
			FROM orders 
			WHERE buyer_id = $1 
			ORDER BY created_at DESC`
	} else if role == "seller" {
		query = `
			SELECT id, artwork_id, buyer_id, seller_id, shipping_address_id, amount, status, seller_bank_account_id, tracking_code, created_at, shipped_at, delivered_at
			FROM orders 
			WHERE seller_id = $1 
			ORDER BY created_at DESC`
	} else {
		return nil, errors.New("rol inválido")
	}

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var order models.Order
		err := rows.Scan(
			&order.ID,
			&order.ArtworkID,
			&order.BuyerID,
			&order.SellerID,
			&order.ShippingAddressID,
			&order.Amount,
			&order.Status,
			&order.SellerBankAccountID,
			&order.TrackingCode,
			&order.CreatedAt,
			&order.ShippedAt,
			&order.DeliveredAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	if orders == nil {
		orders = make([]models.Order, 0)
	}

	return orders, nil
}

func (r *OrderRepository) Update(order *models.Order) error {
	query := `
		UPDATE orders 
		SET status = $1, tracking_code = $2, shipped_at = $3, delivered_at = $4 
		WHERE id = $5`

	_, err := r.DB.Exec(
		query,
		order.Status,
		order.TrackingCode,
		order.ShippedAt,
		order.DeliveredAt,
		order.ID,
	)

	return err
}
