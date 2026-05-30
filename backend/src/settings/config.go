package settings

import (
	"log"
	"os"
	"strings"
)

type Config struct {
	DatabaseURL     string
	SupabaseURL     string
	SupabaseAnonKey string
	ResendAPIKey    string
	ContactEmail    string
	CohereAPIKey    string
	StripeSecretKey string
	Port            string
	AllowedOrigins  []string
}

func LoadConfig() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not defined in the .env file")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	allowedOrigins := parseListEnv("ALLOWED_ORIGINS")
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"http://localhost:5173"}
	}

	return &Config{
		DatabaseURL:     dbURL,
		SupabaseURL:     os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey: os.Getenv("SUPABASE_ANON_KEY"),
		ResendAPIKey:    os.Getenv("RESEND_API_KEY"),
		ContactEmail:    os.Getenv("CONTACT_EMAIL"),
		CohereAPIKey:    os.Getenv("COHERE_API_KEY"),
		StripeSecretKey: os.Getenv("STRIPE_SECRET_KEY"),
		Port:            port,
		AllowedOrigins:  allowedOrigins,
	}
}

func parseListEnv(key string) []string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return nil
	}

	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		candidate := strings.TrimSpace(part)
		if candidate != "" {
			out = append(out, candidate)
		}
	}

	return out
}
