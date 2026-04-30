package dto

type UpdateTrackingDTO struct {
	TrackingCode string `json:"tracking_code" validate:"required"`
}
