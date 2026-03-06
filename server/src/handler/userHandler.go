package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"proyecto-grupo-5/server/src/service"
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

func (user_handler UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	var err error

	w.Header().Set("Content-Type", "application/json")

	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		fmt.Println("Error al decodificar JSON:", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "JSON invalido"}`))
		return
	}

	err = user_handler.user_service.RegisterUser(req.Name, req.Email, req.Password)
	if err != nil {
		fmt.Println("Error en el servicio:", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Usuario registrado con exito"}`))
}
