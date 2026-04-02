package models

import "time"

type Artwork struct {
	ID          string    `json:"id"`
	ArtistID    *string   `json:"artist_id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	ImageURL    string    `json:"image_url"`
	Price       *float64  `json:"price"`
	Tags        []string  `json:"tags"`
	Embedding   []float32 `json:"embedding"`
	CreatedAt   time.Time `json:"created_at"`
	LikesCount  int       `json:"likes_count"`
	ProductType string    `json:"product_type"`
}
