package repository

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
)

type UserRepository struct {
	database *sql.DB
}

func NewUserRepository(database *sql.DB) UserRepository {
	return UserRepository{database: database}
}

func (user_repository UserRepository) CreateAuthAndProfile(nombre, email, password string) error {
	var url string
	var anonKey string
	var body []byte
	var req *http.Request
	var resp *http.Response
	var err error
	var userID string
	var query string
	var result struct {
		ID   string                 `json:"id"`
		User map[string]interface{} `json:"user"`
	}

	url = os.Getenv("SUPABASE_URL") + "/auth/v1/signup"
	anonKey = os.Getenv("SUPABASE_ANON_KEY")

	body, _ = json.Marshal(map[string]interface{}{
		"email":    strings.TrimSpace(email),
		"password": password,
		"data":     map[string]string{"full_name": nombre},
	})

	req, err = http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", "Bearer "+anonKey)

	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return errors.New("este correo ya está registrado en el sistema de autenticación")
	}

	json.NewDecoder(resp.Body).Decode(&result)

	userID = result.ID
	if userID == "" && result.User != nil {
		userID, _ = result.User["id"].(string)
	}

	if userID == "" {
		return nil
	}

	query = "INSERT INTO public.profiles (id, nombre, email) VALUES ($1, $2, $3)"
	_, err = user_repository.database.Exec(query, userID, nombre, email)

	if err != nil && strings.Contains(err.Error(), "23505") {
		return errors.New("el usuario ya existe en nuestra base de datos")
	}

	return err
}
