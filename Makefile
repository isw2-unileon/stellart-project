.PHONY: install run-backend run-frontend build-backend build-frontend test lint e2e

## Install all dependencies
install:
	go install github.com/air-verse/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	cd backend && go get github.com/yalue/onnxruntime_go
	go mod download
	cd frontend/stellart-frontend && npm install
	cd e2e && npm install
	@echo "Remember to place onnxruntime.dll in the backend folder and have TDM-GCC installed."

## Run backend (requires 64-bit Go, gcc, onnxruntime.dll in backend/)
run-backend:
	cd backend && powershell -NoProfile -ExecutionPolicy Bypass -File run.ps1

## Run frontend dev server
run-frontend:
	cd frontend/stellart-frontend && npm run dev

## Build backend binary
build-backend:
	go build -o backend/bin/server ./backend/main.go

## Build frontend for production
build-frontend:
	cd frontend/stellart-frontend && npm run build

## Run all tests
test:
	go test -v ./...
	cd frontend/stellart-frontend && npm run test

## Run linters
lint:
	golangci-lint run
	cd frontend/stellart-frontend && npm run lint

## Run E2E tests (requires backend + frontend running)
e2e:
	cd e2e && npx playwright test