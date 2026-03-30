package main

import (
	"database/sql"
	"net/http"
	"proyecto-grupo-5/backend/src/database"
	"proyecto-grupo-5/backend/src/handler"
	"proyecto-grupo-5/backend/src/repository"
	"proyecto-grupo-5/backend/src/router"
	"proyecto-grupo-5/backend/src/service"
	"proyecto-grupo-5/backend/src/settings"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	var db *sql.DB
	var svc service.UserService
	var h handler.UserHandler
	var r *chi.Mux
	var rep repository.UserRepository

	_ = godotenv.Load("../.env")

	cfg := settings.LoadConfig()

	db = database.InitDB(cfg.DatabaseURL)
	defer db.Close()

	rep = repository.NewUserRepository(db)
	svc = service.NewUserService(rep)
	h = handler.NewUserHandler(svc)

	r = router.InitRouter(h)

	println("Server started at http://localhost:3000")
	http.ListenAndServe(":3000", r)
}
