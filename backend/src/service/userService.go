package service

import (
	"proyecto-grupo-5/backend/src/repository"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return UserService{repo: repo}
}
