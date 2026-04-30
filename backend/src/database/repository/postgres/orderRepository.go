package postgres

import (
	"database/sql"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type OrderRepository struct {
	DB *sql.DB
}

func NewOrderRepository(db *sql.DB) uis.OrderInterface {
	return &OrderRepository{DB: db}
}

func (r *OrderRepository) Create(order *models.Order) (*models.Order, error) {
	query := `
		INSERT INTO orders (artwork_id, buyer_id, seller_id, shipping_address_id, amount, status)
		VALUES ($1, $2, $3, $4, $5, 'pending')
		RETURNING id, created_at`

	err := r.DB.QueryRow(
		query,
		order.ArtworkID,
		order.BuyerID,
		order.SellerID,
		order.ShippingAddressID,
		order.Amount,
	).Scan(&order.ID, &order.CreatedAt)

	return order, err
}

func (r *OrderRepository) GetByID(id string) (*models.Order, error) {
	var order models.Order
	query := `SELECT id, artwork_id, buyer_id, seller_id, shipping_address_id, amount, status, tracking_code, carrier, created_at
			  FROM orders WHERE id = $1`

	err := r.DB.QueryRow(query, id).Scan(
		&order.ID, &order.ArtworkID, &order.BuyerID, &order.SellerID,
		&order.ShippingAddressID, &order.Amount, &order.Status,
		&order.TrackingCode, &order.Carrier, &order.CreatedAt,
	)
	return &order, err
}

func (r *OrderRepository) GetOrdersByRole(userID string, role string) ([]models.Order, error) {
	var query string
	if role == "buyer" {
		query = `SELECT id, artwork_id, buyer_id, seller_id, shipping_address_id, amount, status, tracking_code, carrier, created_at
			FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC`
	} else {
		query = `SELECT id, artwork_id, buyer_id, seller_id, shipping_address_id, amount, status, tracking_code, carrier, created_at
			FROM orders WHERE seller_id = $1 ORDER BY created_at DESC`
	}

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		rows.Scan(
			&order.ID, &order.ArtworkID, &order.BuyerID, &order.SellerID,
			&order.ShippingAddressID, &order.Amount, &order.Status,
			&order.TrackingCode, &order.Carrier, &order.CreatedAt,
		)
		orders = append(orders, order)
	}
	return orders, nil
}

func (r *OrderRepository) Update(order *models.Order) error {
	query := `UPDATE orders SET status = $1, tracking_code = $2, carrier = $3 WHERE id = $4`
	_, err := r.DB.Exec(query, order.Status, order.TrackingCode, order.Carrier, order.ID)
	return err
}
