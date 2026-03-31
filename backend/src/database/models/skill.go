package models

type ProfileSkill struct {
	ID        string `json:"id"`
	ProfileID string `json:"profile_id"`
	SkillID   string `json:"skill_id"`
	SkillName string `json:"skill_name,omitempty"`
	Level     int    `json:"level"`
}
