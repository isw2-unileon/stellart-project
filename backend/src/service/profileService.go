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
