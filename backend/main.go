// backend/main.go
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
	"stellart/backend/src/settings"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		godotenv.Load("../.env")
	}

	cfg := settings.LoadConfig()

	port := os.Getenv("PORT")

	db := connection.InitDB(cfg.DatabaseURL)
	defer db.Close()

	// Profile
	profileRepo := postgres.NewProfileRepository(db)
	profileSvc := service.NewProfileService(profileRepo)
	profileHdl := handler.NewProfileHandler(profileSvc)

	// Contact
	emailSender := handler.NewResendEmailSender(cfg.ResendAPIKey)
	contactHdl := handler.NewContactHandler(cfg.ContactEmail, emailSender)

	// Artwork
	artworkRepo := postgres.NewArtworkRepository(db)
	artworkSvc := service.NewArtworkService(artworkRepo, cfg)
	artworkHdl := handler.NewArtworkHandler(artworkSvc, cfg)

	// Commission
	commissionRepo := postgres.NewCommissionRepository(db)
	commissionSvc := service.NewCommissionService(commissionRepo)
	commissionHdl := handler.NewCommissionHandler(commissionSvc)

	// Chat WebSocket
	chatRepo := postgres.NewChatRepository(db)
	chatService := service.NewChatService(chatRepo)
	chatHdl := handler.NewChatHandler(chatService)

	r := router.InitRouter(profileHdl, contactHdl, artworkHdl, commissionHdl)

	// Mount WebSocket handler
	http.HandleFunc("/ws/chat", chatHdl.HandleWebSocket)

	log.Printf("Server listening on: http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Fatal: %v", err)
	}
}
