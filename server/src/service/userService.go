package service

import (
	"proyecto-grupo-5/server/src/repository"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return UserService{repo: repo}
}

func (user_service UserService) RegisterUser(nombre, email, password string) error {

	return user_service.repo.CreateAuthAndProfile(nombre, email, password)
}
