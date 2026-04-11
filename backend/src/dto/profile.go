package dto

import "stellart/backend/src/database/models"

type CreateProfile struct {
	Email    string `json:"email" validate:"required,email"`
	FullName string `json:"full_name"`
}

type UpdateProfile struct {
	FullName        *string `json:"full_name"`
	AvatarURL       *string `json:"avatar_url"`
	Biography       *string `json:"biography"`
	OpenCommissions *bool   `json:"open_commissions"`
}

type UpdateProfileRequest struct {
	Profile models.Profile        `json:"profile"`
	Skills  []models.ProfileSkill `json:"skills"`
}

type UpdateOpenCommissions struct {
	OpenCommissions bool `json:"open_commissions"`
}

type AddToWishlist struct {
	ArtworkID string `json:"artwork_id"`
}
