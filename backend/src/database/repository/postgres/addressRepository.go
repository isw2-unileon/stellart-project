package postgres

import (
	"database/sql"

	"stellart/backend/src/database/models"
	"stellart/backend/src/database/repository/uis"
)

type postgresAddressRepo struct {
	db *sql.DB
}

func NewAddressRepository(db *sql.DB) uis.AddressInterface {
	return &postgresAddressRepo{db: db}
}

func (p *postgresAddressRepo) Create(address *models.Address) error {
	query := `
        INSERT INTO public.shipping_addresses (profile_id, address_label, street, city, postal_code, country)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`

	err := p.db.QueryRow(query,
		address.ArtistID,
		address.Label,
		address.Street,
		address.City,
		address.PostalCode,
		address.Country,
	).Scan(&address.ID)

	return err
}
