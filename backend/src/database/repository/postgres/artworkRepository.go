package postgres

import (
	"database/sql"
	"fmt"
	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
	"strings"

	"github.com/lib/pq"
)

type postgresArtWorkRepo struct {
	db *sql.DB
}

func NewArtworkRepository(db *sql.DB) uis.ArtworkInterface {
	return &postgresArtWorkRepo{db: db}
}

func (p *postgresArtWorkRepo) Create(artwork *models.Artwork) error {
	query := `
        INSERT INTO public.artworks (title, description, image_url, artist_id, tags, embedding, price, product_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at`

	err := p.db.QueryRow(query,
		artwork.Title,
		artwork.Description,
		artwork.ImageURL,
		artwork.ArtistID,
		pq.Array(artwork.Tags),
		formatVector(artwork.Embedding),
		artwork.Price,
		artwork.ProductType,
	).Scan(&artwork.ID, &artwork.CreatedAt)

	artwork.LikesCount = 0
	return err
}

func (p *postgresArtWorkRepo) SearchSimilar(vector []float32, limit int) ([]models.Artwork, error) {
	query := `
        SELECT id, title, description, image_url, artist_id, tags, created_at, price, product_type,
               (SELECT COUNT(*) FROM public.likes WHERE artwork_id = artworks.id) as likes_count
        FROM public.artworks
        ORDER BY embedding <=> $1
        LIMIT $2`

	rows, err := p.db.Query(query, formatVector(vector), limit)
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
			pq.Array(&artwork.Tags),
			&artwork.CreatedAt,
			&artwork.Price,
			&artwork.ProductType,
			&artwork.LikesCount,
		)
		if err != nil {
			return nil, err
		}
		artworks = append(artworks, artwork)
	}
	return artworks, nil
}

func (p *postgresArtWorkRepo) GetByArtistID(artistID string) ([]models.Artwork, error) {
	query := `
        SELECT id, title, description, image_url, artist_id, tags, created_at, price, product_type,
               (SELECT COUNT(*) FROM public.likes WHERE artwork_id = artworks.id) as likes_count
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
			pq.Array(&artwork.Tags),
			&artwork.CreatedAt,
			&artwork.Price,
			&artwork.ProductType,
			&artwork.LikesCount,
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
        SELECT id, title, description, image_url, artist_id, tags, created_at, price, product_type,
               (SELECT COUNT(*) FROM public.likes WHERE artwork_id = artworks.id) as likes_count
        FROM public.artworks WHERE id = $1`
	var artwork models.Artwork
	err := p.db.QueryRow(query, id).Scan(
		&artwork.ID,
		&artwork.Title,
		&artwork.Description,
		&artwork.ImageURL,
		&artwork.ArtistID,
		pq.Array(&artwork.Tags),
		&artwork.CreatedAt,
		&artwork.Price,
		&artwork.ProductType,
		&artwork.LikesCount,
	)
	if err != nil {
		return nil
	}
	return &artwork
}

func formatVector(v []float32) string {
	strValues := make([]string, len(v))
	for i, val := range v {
		strValues[i] = fmt.Sprintf("%f", val)
	}
	return "[" + strings.Join(strValues, ",") + "]"
}

func (p *postgresArtWorkRepo) IncrementLikes(artworkID string, profileID string) error {
	checkQuery := `SELECT id FROM public.likes WHERE artwork_id = $1 AND profile_id = $2`
	var temp string
	err := p.db.QueryRow(checkQuery, artworkID, profileID).Scan(&temp)

	if err == sql.ErrNoRows {
		query := `INSERT INTO public.likes (artwork_id, profile_id) VALUES ($1, $2)`
		_, err = p.db.Exec(query, artworkID, profileID)
		return err
	}
	return err
}

func (p *postgresArtWorkRepo) GetTrending() ([]models.Artwork, error) {
	query := `
		SELECT a.id, a.artist_id, a.title, a.description, a.image_url, a.tags, a.price, a.product_type, a.created_at,
		       COUNT(l.id) as likes_count
		FROM public.artworks a
		LEFT JOIN public.likes l ON a.id = l.artwork_id
		GROUP BY a.id
		ORDER BY likes_count DESC, a.created_at DESC 
		LIMIT 10
	`
	rows, err := p.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artworks []models.Artwork
	for rows.Next() {
		var a models.Artwork
		err := rows.Scan(
			&a.ID,
			&a.ArtistID,
			&a.Title,
			&a.Description,
			&a.ImageURL,
			pq.Array(&a.Tags),
			&a.Price,
			&a.ProductType,
			&a.CreatedAt,
			&a.LikesCount,
		)
		if err != nil {
			return nil, err
		}
		artworks = append(artworks, a)
	}
	return artworks, nil
}

func (p *postgresArtWorkRepo) DecrementLikes(artworkID string, profileID string) error {
	query := `DELETE FROM public.likes WHERE artwork_id = $1 AND profile_id = $2`
	_, err := p.db.Exec(query, artworkID, profileID)
	return err
}

func (r *postgresArtWorkRepo) Delete(id string) error {
	_, _ = r.db.Exec("DELETE FROM public.likes WHERE artwork_id = $1", id)
	_, _ = r.db.Exec("DELETE FROM public.wishlist WHERE artwork_id = $1", id)
	_, err := r.db.Exec("DELETE FROM public.artworks WHERE id = $1", id)
	return err
}
