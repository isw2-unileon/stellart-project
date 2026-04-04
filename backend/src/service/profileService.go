package service

import (
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type ProfileService struct {
	repo uis.ProfileRepository
}

func NewProfileService(repo uis.ProfileRepository) *ProfileService {
	return &ProfileService{repo: repo}
}

func (s *ProfileService) GetProfile(id string) (*models.Profile, error) {
	return s.repo.GetByID(id)
}

func (s *ProfileService) UpdateProfile(p *models.Profile, skills []models.ProfileSkill) error {
	return s.repo.Update(p, skills)
}

func (s *ProfileService) GetProfileSkills(profileID string) ([]models.ProfileSkill, error) {
	return s.repo.GetSkillsByProfileID(profileID)
}

func (s *ProfileService) GetMasterSkills() ([]models.MasterSkill, error) {
	return s.repo.GetMasterSkills()
}

func (s *ProfileService) GetOpenCommissionProfiles() ([]models.Profile, error) {
	return s.repo.GetOpenCommissionProfiles()
}

func (s *ProfileService) UpdateOpenCommissions(id string, open bool) error {
	return s.repo.UpdateOpenCommissions(id, open)
}

func (s *ProfileService) AddToWishlist(profileID, artworkID string) error {
	return s.repo.AddToWishlist(profileID, artworkID)
}

func (s *ProfileService) RemoveFromWishlist(profileID, artworkID string) error {
	return s.repo.RemoveFromWishlist(profileID, artworkID)
}

func (s *ProfileService) GetWishlist(profileID string) ([]models.Artwork, error) {
	return s.repo.GetWishlist(profileID)
}
