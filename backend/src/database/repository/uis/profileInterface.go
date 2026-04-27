package uis

import "stellart/backend/src/database/models"

type ProfileRepository interface {
	GetByID(id string) (*models.Profile, error)
	GetOpenCommissionProfiles() ([]models.Profile, error)
	Update(profile *models.Profile, skills []models.ProfileSkill) error
	UpdateOpenCommissions(id string, open bool) error
	GetSkillsByProfileID(profileID string) ([]models.ProfileSkill, error)
	GetMasterSkills() ([]models.MasterSkill, error)
	AddToWishlist(profileID, artworkID string) error
	RemoveFromWishlist(profileID, artworkID string) error
	GetWishlist(profileID string) ([]models.Artwork, error)
	GetArtistRanking() ([]models.ArtistRanking, error)
}
