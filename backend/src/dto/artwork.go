package dto

import "stellart/backend/src/database/models"

type CreateArtwork struct {
	ArtistID    string   `json:"artist_id" validate:"required"`
	Title       string   `json:"title" validate:"required"`
	Description string   `json:"description"`
	ImageURL    string   `json:"image_url" validate:"required"`
	Price       float64  `json:"price"`
	Tags        []string `json:"tags"`
	ProductType string   `json:"product_type" validate:"required"`
}

type UpdateArtwork struct {
	Title       *string   `json:"title"`
	Description *string   `json:"description"`
	ImageURL    *string   `json:"image_url"`
	Price       *float64  `json:"price"`
	Tags        *[]string `json:"tags"`
	ProductType *string   `json:"product_type"`
}

type SearchSimilarRequest struct {
	Vector []float32 `json:"vector"`
	Limit  int       `json:"limit"`
}

type ReportArtworkRequest struct {
	ReporterID string `json:"reporterId"`
	Reason     string `json:"reason"`
}

type ArtworkResponse struct {
	models.Artwork
	ArtistName string `json:"artist_name"`
}
