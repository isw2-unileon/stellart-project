package router

import (
	"proyecto-grupo-5/backend/src/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func InitRouter(userHandler handler.UserHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	return r
}
