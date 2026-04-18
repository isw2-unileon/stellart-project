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

func (p *postgresAddressRepo) GetByProfileID(profileID string) ([]models.Address, error) {
	query := `
		SELECT id, profile_id, address_label, street, city, postal_code, country 
		FROM public.shipping_addresses 
		WHERE profile_id = $1`

	rows, err := p.db.Query(query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []models.Address
	for rows.Next() {
		var addr models.Address
		err := rows.Scan(
			&addr.ID,
			&addr.ArtistID,
			&addr.Label,
			&addr.Street,
			&addr.City,
			&addr.PostalCode,
			&addr.Country,
		)
		if err != nil {
			return nil, err
		}
		addresses = append(addresses, addr)
	}
	return addresses, nil
}

func (p *postgresAddressRepo) Update(address *models.Address) error {
	query := `
		UPDATE public.shipping_addresses 
		SET address_label = $1, street = $2, city = $3, postal_code = $4, country = $5 
		WHERE id = $6`

	_, err := p.db.Exec(query,
		address.Label,
		address.Street,
		address.City,
		address.PostalCode,
		address.Country,
		address.ID,
	)
	return err
}

func (p *postgresAddressRepo) Delete(id string) error {
	query := `DELETE FROM public.shipping_addresses WHERE id = $1`
	_, err := p.db.Exec(query, id)
	return err
}
