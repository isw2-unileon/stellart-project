package dto

type CreateShippingAddressDTO struct {
	ArtistID     string `json:"artist_id"`
	AddressLabel string `json:"address_label"`
	Street       string `json:"street"`
	City         string `json:"city"`
	PostalCode   string `json:"postal_code"`
	Country      string `json:"country"`
}
