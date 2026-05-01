package postgres

import (
	"database/sql"
	"errors"

	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"

	"github.com/lib/pq"
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
        SELECT id, full_name, email, avatar_url, biography, open_commissions, updated_at, created_at
        FROM public.profiles
        WHERE id = $1`

	var profile models.Profile
	err := r.db.QueryRow(query, id).Scan(
		&profile.ID, &profile.FullName, &profile.Email,
		&profile.AvatarURL, &profile.Biography, &profile.OpenCommissions,
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
		INSERT INTO public.profiles (id, full_name, email, avatar_url, biography, open_commissions, updated_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (id) DO UPDATE
		SET full_name = EXCLUDED.full_name,
		    avatar_url = EXCLUDED.avatar_url,
		    biography = EXCLUDED.biography,
		    open_commissions = EXCLUDED.open_commissions,
		    updated_at = CURRENT_TIMESTAMP
		RETURNING updated_at`

	err = tx.QueryRow(queryProfile,
		profile.ID,
		profile.FullName,
		profile.Email,
		profile.AvatarURL,
		profile.Biography,
		profile.OpenCommissions,
	).Scan(&profile.UpdatedAt)

	if err != nil {
		return err
	}

	if len(skills) > 0 {
		_, err = tx.Exec(`DELETE FROM public.profile_skills WHERE profile_id = $1`, profile.ID)
		if err != nil {
			return err
		}

		querySkills := `
			INSERT INTO public.profile_skills (profile_id, skill_id, level) 
			VALUES ($1, $2, $3) Returning id`

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

func (r *postgresProfileRepo) AddToWishlist(profileID, artworkID string) error {
	query := `INSERT INTO public.wishlist (profile_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.db.Exec(query, profileID, artworkID)
	return err
}

func (r *postgresProfileRepo) RemoveFromWishlist(profileID, artworkID string) error {
	query := `DELETE FROM public.wishlist WHERE profile_id = $1 AND artwork_id = $2`
	_, err := r.db.Exec(query, profileID, artworkID)
	return err
}

func (r *postgresProfileRepo) GetWishlist(profileID string) ([]models.Artwork, error) {
	query := `
		SELECT a.id, a.title, a.description, a.image_url, a.artist_id, a.tags, a.created_at, a.price, 
		       (SELECT COUNT(*) FROM public.likes WHERE artwork_id = a.id) as likes_count, 
		       a.product_type
		FROM public.wishlist w
		JOIN public.artworks a ON w.artwork_id = a.id
		WHERE w.profile_id = $1
		ORDER BY w.created_at DESC`

	rows, err := r.db.Query(query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artworks []models.Artwork
	for rows.Next() {
		var a models.Artwork
		err := rows.Scan(
			&a.ID, &a.Title, &a.Description, &a.ImageURL, &a.ArtistID, pq.Array(&a.Tags),
			&a.CreatedAt, &a.Price, &a.LikesCount, &a.ProductType,
		)
		if err != nil {
			return nil, err
		}
		artworks = append(artworks, a)
	}
	return artworks, rows.Err()
}

func (r *postgresProfileRepo) GetMasterSkills() ([]models.MasterSkill, error) {
	query := `SELECT id, name FROM public.master_skills`
	rows, err := r.db.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var skills []models.MasterSkill
	for rows.Next() {
		var s models.MasterSkill
		err := rows.Scan(&s.ID, &s.Name)
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

func (r *postgresProfileRepo) GetOpenCommissionProfiles() ([]models.Profile, error) {
	query := `
		SELECT id, full_name, email, avatar_url, biography, open_commissions, updated_at, created_at
		FROM public.profiles
		WHERE open_commissions = true`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []models.Profile
	for rows.Next() {
		var p models.Profile
		err := rows.Scan(&p.ID, &p.FullName, &p.Email, &p.AvatarURL, &p.Biography, &p.OpenCommissions, &p.UpdatedAt, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		profiles = append(profiles, p)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return profiles, nil
}

func (r *postgresProfileRepo) UpdateOpenCommissions(id string, open bool) error {
	query := `
		INSERT INTO public.profiles (id, full_name, email, open_commissions, updated_at, created_at)
		VALUES ($1, '', '', $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (id) DO UPDATE
		SET open_commissions = EXCLUDED.open_commissions,
			updated_at = CURRENT_TIMESTAMP`
	_, err := r.db.Exec(query, id, open)
	return err
}

func (r *postgresProfileRepo) GetArtistRanking() ([]models.ArtistRanking, error) {
	query := `
		SELECT p.id, COALESCE(p.full_name, p.name, p.username, 'Unknown'), COALESCE(p.avatar_url, ''), COUNT(l.id) as total_likes
		FROM public.profiles p
		LEFT JOIN public.artworks a ON p.id = a.artist_id
		LEFT JOIN public.likes l ON a.id = l.artwork_id
		GROUP BY p.id
		ORDER BY total_likes DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ranking []models.ArtistRanking
	for rows.Next() {
		var a models.ArtistRanking
		err := rows.Scan(&a.ID, &a.FullName, &a.AvatarURL, &a.TotalLikes)
		if err != nil {
			return nil, err
		}
		ranking = append(ranking, a)
	}
	return ranking, nil
}
