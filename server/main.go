package main

import (
	"database/sql"
	"net/http"
	"proyecto-grupo-5/server/src/database"
	"proyecto-grupo-5/server/src/handler"
	"proyecto-grupo-5/server/src/repository"
	"proyecto-grupo-5/server/src/router"
	"proyecto-grupo-5/server/src/service"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	var db *sql.DB
	var svc service.UserService
	var h handler.UserHandler
	var r *chi.Mux
	var err error
	var rep repository.UserRepository

	err = godotenv.Load("../.env")
	if err != nil {
		println("Error al cargar .env")
	}

	// Conexion base de datos
	db = database.InitDB()
	defer db.Close()

	rep = repository.NewUserRepository(db)
	svc = service.NewUserService(rep)
	h = handler.NewUserHandler(svc)

	// Router
	r = router.InitRouter(h)

	// Iniciar el servidor
	println("http://localhost:3000/register")
	http.ListenAndServe(":3000", r)
}
