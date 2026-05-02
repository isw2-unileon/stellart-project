package service

import (
	"errors"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/settings"
	"stellart/backend/src/utils"
)

type IAIService interface {
	IsAIGenerated(imageURL string) (bool, error)
}

type ArtworkService struct {
	repo   uis.ArtworkInterface
	config *settings.Config
	ai     IAIService
}

func NewArtworkService(repo uis.ArtworkInterface, cfg *settings.Config, ai IAIService) *ArtworkService {
	return &ArtworkService{
		repo:   repo,
		config: cfg,
		ai:     ai,
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
	isAI, err := s.ai.IsAIGenerated(artwork.ImageURL)
	if err != nil {
		return errors.New("ERROR_AI_SERVICE")
	}
	if isAI {
		return errors.New("AI_DETECTED")
	}

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

func (s *ArtworkService) LikeArtwork(artworkID string, profileID string) error {
	return s.repo.IncrementLikes(artworkID, profileID)
}

func (s *ArtworkService) GetTrendingArtworks() ([]models.Artwork, error) {
	return s.repo.GetTrending()
}

func (s *ArtworkService) UnlikeArtwork(artworkID string, profileID string) error {
	return s.repo.DecrementLikes(artworkID, profileID)
}

func (s *ArtworkService) DeleteArtwork(id string) error {
	return s.repo.Delete(id)
}
