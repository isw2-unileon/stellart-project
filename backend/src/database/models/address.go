package models

type Address struct {
	ID         string `json:"id"`
	ArtistID   string `json:"artist_id"`
	Street     string `json:"street"`
	City       string `json:"city"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
	Label      string `json:"label"`
}
