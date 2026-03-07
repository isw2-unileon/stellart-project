# Stellart

A platform for managing commissions for freelance artists. Artists can showcase their work publicly and receive customized order requests from other users.

## Requirements

- **Go** 1.21+
- **Node.js** 18+ and **npm**
- **PostgreSQL** database (Supabase or any compatible provider)

## Environment Setup

Create a `.env` file at the project root with the following variable:

```env
DATABASE_URL=postgres://user:password@host:port/dbname
```

Replace the value with your actual PostgreSQL connection string.

## Running the Backend

From the project root, install Go dependencies and start the server:

```bash
go mod download
go run ./server/main.go
```

The API will be available at `http://localhost:3000`.

## Running the Frontend

From the `frontend/stellart-frontend` directory, install dependencies and start the dev server:

```bash
cd frontend/stellart-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

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
├── go.mod
├── go.sum
└── .env             # Not committed — create this manually
```

## Team

Group 5: Alberto Morán Reina, Maxim Berchun, Alonso Carrera Martínez, Jorge Alonso Fernández.
