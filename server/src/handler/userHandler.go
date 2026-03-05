package handler

import (
	"net/http"
	"proyecto-grupo-5/server/src/service"
)

type UserHandler struct {
	user_service service.UserService
}

func NewUserHandler(user_service service.UserService) UserHandler {
	var user_handler UserHandler
	user_handler.user_service = user_service
	return user_handler
}

func (user_handler UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var nombre, email, pass string
	var err error

	nombre = r.FormValue("nombre")
	email = r.FormValue("email")
	pass = r.FormValue("passwd")

	err = user_handler.user_service.RegisterUser(nombre, email, pass)
	if err != nil {
		http.Error(w, "Error: "+err.Error(), 500)
		return
	}

	w.Write([]byte("Usuario registrado con exito"))
}
