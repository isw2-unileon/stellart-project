package postgres

import (
	"database/sql"
	"errors"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"

	"github.com/lib/pq"
)

type postgresArtWorkRepo struct {
	db *sql.DB
}

func NewArtworkRepository(db *sql.DB) uis.ArtworkInterface {
	return &postgresArtWorkRepo{
		db: db,
	}
}

func (p *postgresArtWorkRepo) Create(artwork *models.Artwork) error {
	query := `
		INSERT INTO public.artworks (title, description, image_url, artist_id, tags, embedding)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at`

	err := p.db.QueryRow(query,
		artwork.Title,
		artwork.Description,
		artwork.ImageURL,
		artwork.ArtistID,
		pq.Array(artwork.Tags),
		pq.Array(artwork.Embedding),
		artwork.Price,
	).Scan(&artwork.ID, &artwork.CreatedAt)

	return err
}

func (p *postgresArtWorkRepo) GetByArtistID(artistID string) ([]models.Artwork, error) {
	query := `
		SELECT id, title, description, image_url, artist_id, tags, created_at
		FROM public.artworks
		WHERE artist_id = $1`

	rows, err := p.db.Query(query, artistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artworks []models.Artwork

	for rows.Next() {
		var artwork models.Artwork
		err := rows.Scan(
			&artwork.ID,
			&artwork.Title,
			&artwork.Description,
			&artwork.ImageURL,
			&artwork.ArtistID,
			&artwork.Price,
			pq.Array(&artwork.Tags),
			&artwork.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		artworks = append(artworks, artwork)
	}

	return artworks, nil
}

func (p *postgresArtWorkRepo) GetById(id string) *models.Artwork {
	query := `
		SELECT id, title, description, image_url, artist_id, tags, created_at
		FROM public.artworks
		WHERE id = $1`

	var artwork models.Artwork

	err := p.db.QueryRow(query, id).Scan(
		&artwork.ID,
		&artwork.Title,
		&artwork.Description,
		&artwork.ImageURL,
		&artwork.ArtistID,
		&artwork.Price,
		pq.Array(&artwork.Tags),
		&artwork.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return nil
	}

	return &artwork
}

func (p *postgresArtWorkRepo) SearchSimilar(vector []float32, limit int) ([]models.Artwork, error) {
	query := `
		SELECT id, title, description, image_url, artist_id, tags, created_at
		FROM public.artworks
		ORDER BY embedding <=> $1
		LIMIT $2`

	rows, err := p.db.Query(query, pq.Array(vector), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artworks []models.Artwork
	for rows.Next() {
		var artwork models.Artwork
		err := rows.Scan(
			&artwork.ID,
			&artwork.Title,
			&artwork.Description,
			&artwork.ImageURL,
			&artwork.ArtistID,
			&artwork.Price,
			pq.Array(&artwork.Tags),
			&artwork.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		artworks = append(artworks, artwork)
	}

	return artworks, nil
}
