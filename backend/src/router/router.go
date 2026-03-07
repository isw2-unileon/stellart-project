package router

import (
	"proyecto-grupo-5/backend/src/handler"

	"github.com/go-chi/chi/v5"
)

func InitRouter(userHandler handler.UserHandler) *chi.Mux {
	r := chi.NewRouter()

	return r
}
