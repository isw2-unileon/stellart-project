package repository

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
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
	var body map[string]interface{}
	var jsonBody []byte
	var req *http.Request
	var resp *http.Response
	var bodyBytes []byte
	var query string
	var err error

	var result struct {
		User struct {
			ID string `json:"id"`
		} `json:"user"`
		Msg string `json:"msg"`
	}

	url = os.Getenv("SUPABASE_URL") + "/auth/v1/signup"
	anonKey = os.Getenv("SUPABASE_ANON_KEY")

	body = map[string]interface{}{
		"email":    strings.TrimSpace(email),
		"password": password,
		"data":     map[string]string{"full_name": nombre},
	}

	jsonBody, err = json.Marshal(body)
	if err != nil {
		return err
	}

	req, err = http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", "Bearer "+anonKey)

	resp, err = (&http.Client{}).Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	bodyBytes, err = io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	err = json.Unmarshal(bodyBytes, &result)
	if err != nil {
		return err
	}

	if resp.StatusCode >= 400 {
		return errors.New("Auth error: " + result.Msg)
	}

	query = "INSERT INTO public.profiles (id, nombre, email) VALUES ($1, $2, $3)"
	_, err = user_repository.database.Exec(query, result.User.ID, nombre, email)

	return err
}
