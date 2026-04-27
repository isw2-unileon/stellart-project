package models

type ArtistRanking struct {
	ID         string `json:"id"`
	FullName   string `json:"full_name"`
	AvatarURL  string `json:"avatar_url"`
	TotalLikes int    `json:"total_likes"`
}
