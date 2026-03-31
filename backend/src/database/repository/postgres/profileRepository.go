package postgres

import (
	"database/sql"
	"errors"

	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type postgresProfileRepo struct {
	db *sql.DB
}

func NewProfileRepository(db *sql.DB) uis.ProfileRepository {
	return &postgresProfileRepo{
		db: db,
	}
}

func (r *postgresProfileRepo) GetByID(id string) (*models.Profile, error) {
	query := `
        SELECT id, full_name, email, avatar_url, biography, updated_at, created_at
        FROM public.profiles
        WHERE id = $1`

	var profile models.Profile
	err := r.db.QueryRow(query, id).Scan(
		&profile.ID, &profile.FullName, &profile.Email,
		&profile.AvatarURL, &profile.Biography,
		&profile.UpdatedAt, &profile.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &profile, nil
}

func (r *postgresProfileRepo) Update(profile *models.Profile, skills []models.ProfileSkill) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	queryProfile := `
		UPDATE public.profiles 
		SET full_name = $1, avatar_url = $2, biography = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
		RETURNING updated_at`

	err = tx.QueryRow(queryProfile,
		profile.FullName,
		profile.AvatarURL,
		profile.Biography,
		profile.ID,
	).Scan(&profile.UpdatedAt)

	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM public.profile_skills WHERE profile_id = $1`, profile.ID)
	if err != nil {
		return err
	}

	if len(skills) > 0 {
		querySkills := `
			INSERT INTO public.profile_skills (profile_id, skill_id, level) 
			VALUES ($1, $2, $3)`

		for i, s := range skills {
			var newID string
			err = tx.QueryRow(querySkills, profile.ID, s.SkillID, s.Level).Scan(&newID)

			skills[i].ID = newID

			if err != nil && err != sql.ErrNoRows {
				return err
			}
		}
	}

	return tx.Commit()
}

func (r *postgresProfileRepo) GetSkillsByProfileID(profileID string) ([]models.ProfileSkill, error) {
	// Usamos un JOIN para obtener el nombre de la skill desde master_skills
	query := `
		SELECT ps.id, ps.profile_id, ps.skill_id, ms.name, ps.level
		FROM public.profile_skills ps
		JOIN public.master_skills ms ON ps.skill_id = ms.id
		WHERE ps.profile_id = $1`

	rows, err := r.db.Query(query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skills []models.ProfileSkill
	for rows.Next() {
		var s models.ProfileSkill
		err := rows.Scan(&s.ID, &s.ProfileID, &s.SkillID, &s.SkillName, &s.Level)
		if err != nil {
			return nil, err
		}
		skills = append(skills, s)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return skills, nil
}
