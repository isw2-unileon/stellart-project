package uis

import "stellart/backend/src/database/models"

type ArtworkInterface interface {
	Create(artwork *models.Artwork) error
	GetById(id string) *models.Artwork
	GetByArtistID(artistID string) ([]models.Artwork, error)
	SearchSimilar(vector []float32, limit int) ([]models.Artwork, error)
}
