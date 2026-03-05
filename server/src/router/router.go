package router

import (
	"net/http"
	"proyecto-grupo-5/server/src/handler"

	"github.com/go-chi/chi/v5"
)

func InitRouter(user_handler handler.UserHandler) *chi.Mux {
	var router *chi.Mux
	router = chi.NewRouter()

	router.Get("/register", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "../client/src/pages/register.html")
	})

	router.Post("/register", user_handler.Register)

	return router
}
