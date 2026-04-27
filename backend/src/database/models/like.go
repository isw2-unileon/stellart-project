package models

type Like struct {
	ID        string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ProfileID string `gorm:"type:uuid;not null" json:"profile_id"`
	ArtworkID string `gorm:"type:uuid;not null" json:"artwork_id"`
}
