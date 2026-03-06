package main

import (
	"database/sql"
	"net/http"
	"proyecto-grupo-5/server/src/database"
	"proyecto-grupo-5/server/src/handler"
	"proyecto-grupo-5/server/src/repository"
	"proyecto-grupo-5/server/src/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	var db *sql.DB
	var svc service.UserService
	var h handler.UserHandler
	var r *chi.Mux
	var rep repository.UserRepository

	_ = godotenv.Load("../.env")

	db = database.InitDB()
	defer db.Close()

	rep = repository.NewUserRepository(db)
	svc = service.NewUserService(rep)
	h = handler.NewUserHandler(svc)

	r = chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Post("/register", h.Register)

	println("Servidor iniciado en http://localhost:3000")
	http.ListenAndServe(":3000", r)
}
