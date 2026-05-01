package router

import (
	"stellart/backend/src/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func InitRouter(ph handler.ProfileHandler, ch handler.ContactHandler, ah handler.ArtworkHandler, comh handler.CommissionHandler, addrh handler.AddressHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	r.Route("/profiles", func(r chi.Router) {
		r.Get("/ranking", ph.GetArtistRanking)
		r.Get("/open-commissions", ph.GetOpenCommissionProfiles)
		r.Get("/master-skills", ph.GetMasterSkills)
		r.Get("/{id}/skills", ph.GetProfileSkills)
		r.Get("/{id}", ph.GetProfile)
		r.Put("/{id}/open-commissions", ph.UpdateOpenCommissions)
		r.Put("/{id}", ph.UpdateProfile)
		r.Get("/{id}/wishlist", ph.GetWishlist)
		r.Post("/{id}/wishlist", ph.AddToWishlist)
		r.Delete("/{id}/wishlist/{artworkId}", ph.RemoveFromWishlist)
	})

	r.Post("/contact", ch.SubmitContact)

	r.Route("/artworks", func(r chi.Router) {
		r.Get("/search", ah.SearchArtworks)
		r.Post("/search", ah.SearchSimilar)
		r.Get("/trending", ah.GetTrendingArtworks)
		r.Get("/artist/{artistId}", ah.GetArtworksByArtist)
		r.Get("/{id}", ah.GetArtwork)
		r.Post("/{id}/like", ah.LikeArtwork)
		r.Post("/{id}/unlike", ah.UnlikeArtwork)
		r.Post("/", ah.CreateArtwork)
		r.Post("/{id}/report", ah.ReportArtwork)
		r.Delete("/{id}", ah.DeleteArtwork)
	})

	r.Route("/commissions", func(r chi.Router) {
		r.Post("/", comh.CreateCommission)
		r.Get("/buyer", comh.GetBuyerCommissions)
		r.Get("/artist", comh.GetArtistCommissions)

		r.Post("/payments", comh.CreateAdvancePayment)
		r.Post("/remaining-payments", comh.CreateRemainingPayment)
		r.Post("/work-uploads", comh.UploadWork)
		r.Post("/revisions", comh.RequestRevision)
		r.Post("/refunds", comh.CreateRefund)
		r.Post("/messages", comh.SendMessage)

		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", comh.GetCommission)
			r.Post("/accept", comh.AcceptCommission)
			r.Post("/deny", comh.DenyCommission)
			r.Post("/start", comh.StartCommission)
			r.Post("/submit-review", comh.SubmitForReview)
			r.Post("/approve", comh.ApproveWork)
			r.Post("/cancel", comh.CancelCommission)
			r.Get("/payment", comh.GetAdvancePayment)
			r.Post("/payment/mark-paid", comh.MarkPaymentPaid)
			r.Post("/payment/release", comh.ReleasePayment)
			r.Get("/remaining-payment", comh.GetRemainingPayment)
			r.Post("/remaining-payment/mark-paid", comh.MarkRemainingPaymentPaid)
			r.Get("/work-uploads", comh.GetWorkUploads)
			r.Get("/revisions", comh.GetRevisions)
			r.Get("/refund", comh.GetRefund)
			r.Get("/messages", comh.GetMessages)
			r.Post("/messages/read", comh.MarkMessagesRead)
			r.Post("/refund/process", comh.ProcessRefund)
		})

		r.Route("/revisions/{revisionId}", func(r chi.Router) {
			r.Post("/approve", comh.ApproveRevision)
			r.Post("/reject", comh.RejectRevision)
			r.Post("/respond", comh.RespondToRevision)
		})
	})

	r.Route("/addresses", func(r chi.Router) {
		r.Post("/", addrh.CreateAddress)
		r.Get("/{artistId}", addrh.GetAddresses)
		r.Put("/{id}", addrh.UpdateAddress)
		r.Delete("/{id}", addrh.DeleteAddress)
	})

	return r
}
