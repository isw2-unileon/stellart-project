# Operations Setup

## Who is this for

- Operators and developers configuring Stellart environments.

## Required services

- PostgreSQL database (Supabase compatible)
- Stripe account (secret key + webhook secret)
- Resend account (email sending)
- Cohere API key
- Supabase project (URL + anon key for frontend auth/storage)

## Environment file

Create root `.env`:

```bash
cp .env.example .env
```

Minimum required keys:

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `COHERE_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL_DEV`
- `VITE_BACKEND_URL`
- `VITE_STRIPE_PUBLIC_KEY`

Recommended keys:

- `PORT` (default `3001`)
- `ALLOWED_ORIGINS` (comma-separated list)
- `AI_MODEL_PATH`
- `AI_RUNTIME_LIB_PATH`

## Local backend URL behavior

- Development frontend (`npm run dev`) should use `VITE_BACKEND_URL_DEV`.
- Production builds should use `VITE_BACKEND_URL`.

Example:

```env
VITE_BACKEND_URL_DEV=http://localhost:3001
VITE_BACKEND_URL=https://your-fly-app.fly.dev
```

## Windows-specific notes

- Backend run expects 64-bit Go and GCC toolchain.
- Ensure `onnxruntime.dll` is available in `backend/`.

## Recovery path

- Backend startup crashes with missing config:
  - Ensure `.env` is at project root.
  - Confirm `DATABASE_URL` is set.
- Browser CORS issues:
  - Add frontend domains to `ALLOWED_ORIGINS` (local and production).
- Wrong API target in local development:
  - Confirm `VITE_BACKEND_URL_DEV` points to local backend.
