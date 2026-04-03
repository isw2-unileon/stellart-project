package main

import (
	"log"
	"net/http"
	"os"

	"stellart/backend/src/database/connection"
	"stellart/backend/src/database/repository/postgres"
	"stellart/backend/src/handler"
	"stellart/backend/src/router"
	"stellart/backend/src/service"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		godotenv.Load("../.env")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("Error: DATABASE_URL not set")
	}

	port := "3001"
	db := connection.InitDB(dbURL)
	defer db.Close()

	// Profile
	profileRepo := postgres.NewProfileRepository(db)
	profileSvc := service.NewProfileService(profileRepo)
	profileHdl := handler.NewProfileHandler(profileSvc)

	// Contact
	supportEmail := os.Getenv("CONTACT_EMAIL")
	contactHdl := handler.NewContactHandlerWithEnv(supportEmail)

	// Artwork
	artworkRepo := postgres.NewArtworkRepository(db)
	artworkSvc := service.NewArtworkService(artworkRepo)
	artworkHdl := handler.NewArtworkHandler(artworkSvc)

	// Commission
	commissionRepo := postgres.NewCommissionRepository(db)
	commissionSvc := service.NewCommissionService(commissionRepo)
	commissionHdl := handler.NewCommissionHandler(commissionSvc)

	// Chat WebSocket
	chatHub := handler.NewChatHub()
	go chatHub.Run()
	chatHdl := handler.NewChatHandler(chatHub, commissionSvc)

	r := router.InitRouter(profileHdl, contactHdl, artworkHdl, commissionHdl)

	// Mount WebSocket handler
	http.HandleFunc("/ws/chat", chatHdl.HandleWebSocket)

	log.Printf("Server listening on: http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Fatal: %v", err)
	}
}
