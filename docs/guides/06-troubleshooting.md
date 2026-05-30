# Troubleshooting

## Who is this for

- End users and operators diagnosing common Stellart issues.

## Common issues

## Backend startup fails

- Symptom: startup exits immediately with config error.
- Likely cause: missing `DATABASE_URL` in `.env`.
- Fix:
  - Confirm `.env` exists at repository root.
  - Set a valid `DATABASE_URL`.

## CORS errors in browser

- Symptom: frontend requests blocked by browser policy.
- Likely cause: `ALLOWED_ORIGINS` missing current frontend URL.
- Fix:
  - Add local and production frontend URLs to `ALLOWED_ORIGINS`.

## Local frontend hits production backend

- Symptom: local app shows production data or fails unexpectedly.
- Likely cause: `VITE_BACKEND_URL_DEV` not configured.
- Fix:
  - Set `VITE_BACKEND_URL_DEV=http://localhost:3001`.
  - Restart frontend dev server.

## Upload rejected or publish fails

- Symptom: artwork create/upload errors.
- Likely causes:
  - Invalid image or metadata payload.
  - AI moderation detects forbidden content.
  - Storage/auth misconfiguration in Supabase.
- Fix:
  - Retry with valid image and required fields.
  - Confirm Supabase URL/anon key and storage buckets.

## Commission cannot progress

- Symptom: artist cannot accept/start, or buyer cannot approve.
- Likely causes:
  - Advance payment not marked paid.
  - Remaining payment required before final approval.
- Fix:
  - Complete requested payment action in commission detail.
  - Re-open `/commissions/:id` and confirm status update.

## E2E tests failing

- Symptom: Playwright tests fail quickly.
- Likely cause: backend/frontend not running on expected ports.
- Fix:
  - Start backend on `:3001`.
  - Start frontend on `:5173`.
  - Re-run `make e2e`.

## Windows backend dependency issues

- Symptom: backend cannot initialize AI runtime.
- Likely cause: missing `onnxruntime.dll` or toolchain mismatch.
- Fix:
  - Place `onnxruntime.dll` in `backend/`.
  - Ensure compatible Go architecture and GCC toolchain.
