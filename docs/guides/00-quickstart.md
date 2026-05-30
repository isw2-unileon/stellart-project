# Quickstart

## Who is this for

- Operators who need to run Stellart locally fast.
- Contributors who need a reliable baseline before using other guides.

## Prerequisites

- Go 1.21+
- Node.js 18+ and npm
- PostgreSQL-compatible database (for example Supabase Postgres)
- A root `.env` file based on `.env.example`

## Happy path: run locally in minutes

1. From project root, create env file:
   ```bash
   cp .env.example .env
   ```
2. Fill required variables:
   - `DATABASE_URL`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`, `CONTACT_EMAIL`
   - `COHERE_API_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `VITE_BACKEND_URL_DEV`, `VITE_BACKEND_URL`, `VITE_STRIPE_PUBLIC_KEY`
3. Install dependencies:
   ```bash
   make install
   ```
4. Start backend:
   ```bash
   make run-backend
   ```
5. Start frontend:
   ```bash
   make run-frontend
   ```
6. Open app:
   - Frontend: `http://localhost:5173`
   - Backend health check: `http://localhost:3001/healthz` (expects `ok`)

## Recovery path

- If backend fails immediately with a `DATABASE_URL` error, set a valid `DATABASE_URL` in `.env`.
- If CORS fails in browser, ensure `ALLOWED_ORIGINS` includes `http://localhost:5173`.
- If frontend calls production API by mistake, confirm `VITE_BACKEND_URL_DEV=http://localhost:3001`.

## Useful commands

- Backend build: `make build-backend`
- Frontend build: `make build-frontend`
- Tests: `make test`
- Lint: `make lint`
- E2E (requires both servers): `make e2e`
