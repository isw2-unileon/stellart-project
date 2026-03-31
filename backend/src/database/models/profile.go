package models

import "time"

type Profile struct {
	ID        string    `json:"id"`
	FullName  string    `json:"full_name"`
	Email     string    `json:"email"`
	AvatarURL *string   `json:"avatar_url"`
	Biography *string   `json:"biography"`
	UpdatedAt time.Time `json:"updated_at"`
	CreatedAt time.Time `json:"created_at"`
}
