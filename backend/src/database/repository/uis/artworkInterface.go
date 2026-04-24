package uis

import "stellart/backend/src/database/models"

type ArtworkInterface interface {
	Create(artwork *models.Artwork) error
	SearchSimilar(vector []float32, limit int) ([]models.Artwork, error)
	GetByArtistID(artistID string) ([]models.Artwork, error)
	GetById(id string) *models.Artwork
	IncrementLikes(artworkID string, profileID string) error
	DecrementLikes(artworkID string, profileID string) error
	GetTrending() ([]models.Artwork, error)
	Delete(id string) error
}
