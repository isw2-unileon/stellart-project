package handler

import (
	"proyecto-grupo-5/backend/src/service"
)

type UserHandler struct {
	user_service service.UserService
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewUserHandler(user_service service.UserService) UserHandler {
	var user_handler UserHandler
	user_handler.user_service = user_service
	return user_handler
}
