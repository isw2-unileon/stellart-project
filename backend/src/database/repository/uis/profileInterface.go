package uis

import "stellart/backend/src/database/models"

type ProfileRepository interface {
	GetByID(id string) (*models.Profile, error)
	Update(profile *models.Profile, skills []models.ProfileSkill) error
	GetSkillsByProfileID(profileID string) ([]models.ProfileSkill, error)
}
