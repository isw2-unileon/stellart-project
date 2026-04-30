package models

import "time"

type Order struct {
	ID                  string     `json:"id" db:"id"`
	ArtworkID           string     `json:"artwork_id" db:"artwork_id"`
	BuyerID             string     `json:"buyer_id" db:"buyer_id"`
	SellerID            string     `json:"seller_id" db:"seller_id"`
	ShippingAddressID   string     `json:"shipping_address_id" db:"shipping_address_id"`
	Amount              float64    `json:"amount" db:"amount"`
	Status              string     `json:"status" db:"status"`
	SellerBankAccountID string     `json:"seller_bank_account_id" db:"seller_bank_account_id"`
	TrackingCode        *string    `json:"tracking_code" db:"tracking_code"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
	ShippedAt           *time.Time `json:"shipped_at" db:"shipped_at"`
	DeliveredAt         *time.Time `json:"delivered_at" db:"delivered_at"`
}
