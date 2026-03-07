package repository

import (
	"database/sql"
)

type UserRepository struct {
	database *sql.DB
}

func NewUserRepository(database *sql.DB) UserRepository {
	return UserRepository{database: database}
}
