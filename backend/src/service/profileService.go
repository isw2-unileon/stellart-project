package service

import (
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"stellart/backend/src/dto"
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

func (s *ProfileService) UpdateProfile(p *dto.UpdateProfile, skills []models.ProfileSkill) error {
	var id string
	if p.ID != nil {
		id = *p.ID
	}
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	
	profile := &models.Profile{ID: id}
	if existing != nil {
		profile.FullName = existing.FullName
		profile.Email = existing.Email
		profile.AvatarURL = existing.AvatarURL
		profile.Biography = existing.Biography
		profile.OpenCommissions = existing.OpenCommissions
	}
	
	if p.FullName != nil {
		profile.FullName = *p.FullName
	}
	if p.AvatarURL != nil {
		profile.AvatarURL = p.AvatarURL
	}
	if p.Biography != nil {
		profile.Biography = p.Biography
	}
	if p.OpenCommissions != nil {
		profile.OpenCommissions = *p.OpenCommissions
	}
	
	return s.repo.Update(profile, skills)
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

func (s *ProfileService) GetArtistRanking() ([]models.ArtistRanking, error) {
	return s.repo.GetArtistRanking()
}
