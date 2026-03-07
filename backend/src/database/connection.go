package database

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func InitDB() *sql.DB {

	var err error
	var url string
	var db *sql.DB

	err = godotenv.Load("../.env")
	if err != nil {
		log.Fatal("Error cargando el archivo .env")
	}

	url = os.Getenv("DATABASE_URL")
	if url == "" {
		log.Fatal("DATABASE_URL no está definida en el archivo .env")
	}

	db, err = sql.Open("postgres", url)
	if err != nil {
		log.Fatal("Error al abrir la base de datos:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("No se pudo conectar a Supabase:", err)
	}

	log.Println("Conexión exitosa a Supabase")
	return db
}
