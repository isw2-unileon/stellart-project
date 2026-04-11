package settings

import (
	"log"
	"os"
)

type Config struct {
	DatabaseURL     string
	SupabaseURL     string
	SupabaseAnonKey string
	ResendAPIKey    string
	ContactEmail    string
	CohereAPIKey    string
	Port            string
}

func LoadConfig() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not defined in the .env file")
	}

	port := os.Getenv("PORT")

	return &Config{
		DatabaseURL:     dbURL,
		SupabaseURL:     os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey: os.Getenv("SUPABASE_ANON_KEY"),
		ResendAPIKey:    os.Getenv("RESEND_API_KEY"),
		ContactEmail:    os.Getenv("CONTACT_EMAIL"),
		CohereAPIKey:    os.Getenv("COHERE_API_KEY"),
		Port:            port,
	}
}
