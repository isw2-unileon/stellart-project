package models

type User struct {
	ID       int
	Nombre   string
	Email    string
	Password string `json:"-"` // "-" hace que nunca se envíe en un JSON
}
