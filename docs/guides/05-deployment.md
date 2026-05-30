# Deployment Guide

## Who is this for

- Operators deploying Stellart to production.

## Target architecture

- Frontend: Vercel (`frontend/stellart-frontend`)
- Backend: Fly.io (`Dockerfile` + `fly.toml`)
- Database/Auth/Storage: Supabase

## Happy path

### 1) Deploy backend on Fly.io

1. Install Fly CLI and authenticate.
2. Ensure Linux AI assets exist:
   - `backend/libonnxruntime.so`
   - `backend/ai_detector.onnx`
3. Set backend secrets:
   ```bash
   fly secrets set DATABASE_URL=... STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... RESEND_API_KEY=... CONTACT_EMAIL=... COHERE_API_KEY=... ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
4. Deploy:
   ```bash
   fly launch --no-deploy
   fly deploy
   ```
5. Verify:
   ```bash
   curl https://<your-fly-app>.fly.dev/healthz
   ```

### 2) Deploy frontend on Vercel

1. Import `frontend/stellart-frontend` as project.
2. Configure build env vars:
   - `VITE_BACKEND_URL=https://<your-fly-app>.fly.dev`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_STRIPE_PUBLIC_KEY=...`
3. Deploy and verify SPA routes resolve correctly.

### 3) Post-deploy smoke tests

- Auth: register, login, logout.
- Profiles/artworks: upload, view, search.
- Commissions: create, accept, start, submit, approve.
- Payments: create intent and verify Stripe webhook.
- Chat: validate `/ws/chat` session.

## Recovery path

- **Frontend cannot call backend**
  - Re-check `VITE_BACKEND_URL`.
  - Ensure Fly app URL is reachable and healthy.
- **CORS failures in production**
  - Include deployed frontend URL in `ALLOWED_ORIGINS`.
- **Payments failing**
  - Validate Stripe keys and webhook secret in Fly secrets.
