package router

import (
	"stellart/backend/src/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func InitRouter(ph handler.ProfileHandler, ch handler.ContactHandler, ah handler.ArtworkHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	// Profiles
	r.Route("/profiles", func(r chi.Router) {
		r.Get("/{id}", ph.GetProfile)
		r.Put("/", ph.UpdateProfile)
	})

	// Contact
	r.Post("/contact", ch.SubmitContact)

	// Artworks
	r.Route("/artworks", func(r chi.Router) {
		r.Post("/", ah.CreateArtwork)
		r.Get("/{id}", ah.GetArtwork)
		r.Get("/artist/{artistId}", ah.GetArtworksByArtist)
		r.Post("/search", ah.SearchSimilar)
	})

	return r
}
