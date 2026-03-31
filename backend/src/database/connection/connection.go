package connection

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func InitDB(databaseURL string) *sql.DB {
	var err error
	var db *sql.DB

	db, err = sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal("Error opening the database:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Could not connect to Supabase:", err)
	}

	log.Println("Successfully connected to Supabase")
	return db
}
