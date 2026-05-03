package dto

type UpdateTrackingDTO struct {
	TrackingCode string `json:"tracking_code" validate:"required"`
	Carrier      string `json:"carrier" validate:"required"`
	SellerID     string `json:"seller_id" validate:"required"`
}
type CreateOrderDTO struct {
	ArtworkID         string  `json:"artwork_id" validate:"required"`
	SellerID          string  `json:"seller_id" validate:"required"`
	ShippingAddressID string  `json:"shipping_address_id" validate:"required"`
	Amount            float64 `json:"amount" validate:"required"`
	BuyerID           string  `json:"buyer_id"`
}
