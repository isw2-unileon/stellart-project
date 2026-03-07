@echo off
start cmd /k "cd backend && go run main.go"
start cmd /k "cd frontend/stellart-frontend && npm run dev"