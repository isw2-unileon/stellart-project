package router

import (
	"stellart/backend/src/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func InitRouter(ph handler.ProfileHandler, ch handler.ContactHandler, ah handler.ArtworkHandler, comh handler.CommissionHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	// Profiles
	r.Route("/profiles", func(r chi.Router) {
		r.Get("/open-commissions", ph.GetOpenCommissionProfiles)
		r.Get("/{id}/skills", ph.GetProfileSkills)
		r.Get("/{id}", ph.GetProfile)
		r.Put("/{id}/open-commissions", ph.UpdateOpenCommissions)
		r.Put("/{id}", ph.UpdateProfile)
		r.Get("/master-skills", ph.GetMasterSkills)
	})

	// Contact
	r.Post("/contact", ch.SubmitContact)

	// Artworks
	r.Route("/artworks", func(r chi.Router) {
		r.Get("/search", ah.SearchArtworks)
		r.Post("/", ah.CreateArtwork)
		r.Get("/{id}", ah.GetArtwork)
		r.Get("/artist/{artistId}", ah.GetArtworksByArtist)
		r.Post("/search", ah.SearchSimilar)
	})

	// Commissions
	r.Route("/commissions", func(r chi.Router) {
		r.Post("/", comh.CreateCommission)
		r.Get("/buyer", comh.GetBuyerCommissions)
		r.Get("/artist", comh.GetArtistCommissions)
		r.Get("/{id}", comh.GetCommission)
		r.Post("/{id}/accept", comh.AcceptCommission)
		r.Post("/{id}/start", comh.StartCommission)
		r.Post("/{id}/submit-review", comh.SubmitForReview)
		r.Post("/{id}/approve", comh.ApproveWork)
		r.Post("/{id}/cancel", comh.CancelCommission)

		// Payments
		r.Post("/payments", comh.CreateAdvancePayment)
		r.Get("/{commissionId}/payment", comh.GetAdvancePayment)
		r.Post("/{commissionId}/payment/mark-paid", comh.MarkPaymentPaid)
		r.Post("/{commissionId}/payment/release", comh.ReleasePayment)

		// Remaining Payments
		r.Post("/remaining-payments", comh.CreateRemainingPayment)
		r.Get("/{commissionId}/remaining-payment", comh.GetRemainingPayment)
		r.Post("/{commissionId}/remaining-payment/mark-paid", comh.MarkRemainingPaymentPaid)

		// Work Uploads
		r.Post("/work-uploads", comh.UploadWork)
		r.Get("/{commissionId}/work-uploads", comh.GetWorkUploads)

		// Revisions
		r.Post("/revisions", comh.RequestRevision)
		r.Get("/{commissionId}/revisions", comh.GetRevisions)
		r.Post("/revisions/{revisionId}/approve", comh.ApproveRevision)
		r.Post("/revisions/{revisionId}/reject", comh.RejectRevision)

		// Refunds
		r.Post("/refunds", comh.CreateRefund)
		r.Get("/{commissionId}/refund", comh.GetRefund)
		r.Post("/{commissionId}/refund/process", comh.ProcessRefund)

		// Chat Messages
		r.Post("/messages", comh.SendMessage)
		r.Get("/{commissionId}/messages", comh.GetMessages)
		r.Post("/{commissionId}/messages/read", comh.MarkMessagesRead)
	})

	// WebSocket Chat - handled by ChatHandler separately in main.go
	// Mount at /ws/chat with chatHandler.HandleWebSocket

	return r
}
