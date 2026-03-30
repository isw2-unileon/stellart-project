package settings

import (
	"log"
	"os"
)

type Config struct {
	DatabaseURL     string
	SupabaseURL     string
	SupabaseAnonKey string
}

func LoadConfig() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not defined in the .env file")
	}

	return &Config{
		DatabaseURL:     dbURL,
		SupabaseURL:     os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey: os.Getenv("SUPABASE_ANON_KEY"),
	}
}
