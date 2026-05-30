# Stellart

A platform for managing commissions for freelance artists. Artists can showcase their work publicly and receive customized order requests from other users.

## Requirements

- **Go** 1.21+
- **Node.js** 18+ and **npm**
- **PostgreSQL** database (Supabase or any compatible provider)

## Environment Setup

Create a `.env` file at the project root. You can start from `.env.example`:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL` (PostgreSQL / Supabase Postgres)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `CONTACT_EMAIL`
- `COHERE_API_KEY`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL_DEV`, `VITE_BACKEND_URL`, `VITE_STRIPE_PUBLIC_KEY`

Optional but recommended:

- `PORT` (defaults to `3001`)
- `ALLOWED_ORIGINS` (comma-separated CORS origins)
- `AI_RUNTIME_LIB_PATH`, `AI_MODEL_PATH` (for ONNX runtime/model paths)

### Local vs Production backend URLs

To avoid local frontend calls going to production by mistake:

- Use `VITE_BACKEND_URL_DEV` for local development (`npm run dev`).
- Use `VITE_BACKEND_URL` for production build/deploy.

Example:

```env
VITE_BACKEND_URL_DEV=http://localhost:3001
VITE_BACKEND_URL=https://<your-fly-app>.fly.dev
```

For backend CORS, keep `ALLOWED_ORIGINS` as a comma-separated list that includes both your local frontend and your deployed frontend.

## Running the Backend

From the project root, install Go dependencies and start the server:

```bash
go mod download
go run ./backend/main.go
```

The API will be available at `http://localhost:3001` by default.

## Running the Frontend

From the `frontend/stellart-frontend` directory, install dependencies and start the dev server:

```bash
cd frontend/stellart-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).  
The backend exposes `GET /healthz` and `GET /ws/chat`.

## Deploy to Production

### Architecture

- Frontend: Vercel (`frontend/stellart-frontend`)
- Backend: Fly.io (`Dockerfile` + `fly.toml`)
- Database/Auth/Storage: Supabase

### 1) Deploy backend to Fly.io

1. Install and authenticate Fly CLI.
2. Ensure `backend/libonnxruntime.so` and `backend/ai_detector.onnx` are present for Linux runtime.
3. Set backend secrets:

```bash
fly secrets set DATABASE_URL=... STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... RESEND_API_KEY=... CONTACT_EMAIL=... COHERE_API_KEY=... ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

4. Deploy:

```bash
fly launch --no-deploy
fly deploy
```

5. Verify health:

```bash
curl https://<your-fly-app>.fly.dev/healthz
```

### 2) Deploy frontend to Vercel

1. Import `frontend/stellart-frontend` as a Vercel project.
2. Set build-time env vars:
   - `VITE_BACKEND_URL=https://<your-fly-app>.fly.dev`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_STRIPE_PUBLIC_KEY=...`
3. Deploy and confirm client-side routing works (`vercel.json` handles SPA rewrites).

### 3) Post-deploy smoke tests

- Auth: sign up, login, logout.
- Profiles/artworks: create and view artworks, search/trending endpoints.
- Commissions workflow: create/accept/start/submit/approve.
- Payments: create intent and validate Stripe webhook events.
- Chat: connect to `/ws/chat` and verify message echo/persistence.

## Project Structure

```
stellart-project/
├── backend/          # Go backend (chi router, PostgreSQL)
│   ├── main.go
│   └── src/
│       ├── database/
│       ├── handler/
│       ├── models/
│       ├── repository/
│       ├── router/
│       └── service/
├── frontend/
│   └── stellart-frontend/   # React + Vite + Tailwind CSS frontend
├── fly.toml
├── Dockerfile
├── .env.example
├── go.mod
├── go.sum
└── .env             # Not committed — create this manually
```

## Team

Group 5: Alberto Morán Reina, Maxim Berchun, Alonso Carrera Martínez, Jorge Alonso Fernández.
