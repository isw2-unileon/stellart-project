package service

import (
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/settings"
	"stellart/backend/src/utils"
)

type ArtworkService struct {
	repo   uis.ArtworkInterface
	config *settings.Config
}

func NewArtworkService(repo uis.ArtworkInterface, cfg *settings.Config) *ArtworkService {
	return &ArtworkService{
		repo:   repo,
		config: cfg,
	}
}

func (s *ArtworkService) GetArtworkByID(id string) *models.Artwork {
	return s.repo.GetById(id)
}

func (s *ArtworkService) GetArtworksByArtist(artistID string) ([]models.Artwork, error) {
	return s.repo.GetByArtistID(artistID)
}

func (s *ArtworkService) SearchSimilarArtworks(vector []float32, limit int) ([]models.Artwork, error) {
	return s.repo.SearchSimilar(vector, limit)
}

func (s *ArtworkService) CreateArtwork(artwork *models.Artwork) error {
	textToEmbed := "Title: " + artwork.Title

	if artwork.Description != nil && *artwork.Description != "" {
		textToEmbed += ". Description: " + *artwork.Description
	}

	if len(artwork.Tags) > 0 {
		textToEmbed += ". Tags: "
		for i, tag := range artwork.Tags {
			textToEmbed += tag
			if i < len(artwork.Tags)-1 {
				textToEmbed += ", "
			}
		}
	}

	embedding, err := utils.GenerateTextEmbedding(textToEmbed, s.config.CohereAPIKey)
	if err != nil {
		return err
	}

	artwork.Embedding = embedding

	return s.repo.Create(artwork)
}

func (s *ArtworkService) SearchArtworks(query string) ([]models.Artwork, error) {
	embedding, err := utils.GenerateTextEmbedding(query, s.config.CohereAPIKey)
	if err != nil {
		return nil, err
	}

	return s.repo.SearchSimilar(embedding, 10)
}

func (s *ArtworkService) LikeArtwork(id string) error {
	return s.repo.IncrementLikes(id)
}

func (s *ArtworkService) GetTrendingArtworks() ([]models.Artwork, error) {
	return s.repo.GetTrending()
}

func (s *ArtworkService) UnlikeArtwork(id string) error {
	return s.repo.DecrementLikes(id)
}
