# Smart Parking Finder

Production-style smart parking platform: FastAPI + MongoDB backend, React + TypeScript frontend.

## Stack

- **Backend**: FastAPI, Motor (MongoDB), JWT (access + refresh), WebSockets
- **Frontend**: React, Vite, TypeScript, Tailwind, React Query, Zustand, Leaflet, Recharts

## Quick start (local)

### 1. Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env: JWT_SECRET, MONGO_URI
uvicorn main:app --reload
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

### 3. Docker (optional)

```bash
copy .env.example .env
docker compose up --build
```

## API routes

| Area | Base path |
|------|-----------|
| Versioned API | `/api/v1` |
| Auth (login, refresh, me) | `/api/v1/auth` |
| User (legacy) | `/api/v1/user` |
| Parking | `/api/v1/parking` |
| Bookings | `/api/v1/booking` |
| Admin analytics | `/api/v1/admin` |
| Payments | `/api/v1/payments` |
| WebSocket | `/api/v1/ws/live` |

## Admin account

On first startup, a default admin is created automatically (configure via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`). Login via `POST /api/v1/auth/login`.

## Project structure

```
app/
  api/v1/          # Versioned routers (auth, admin, payments, ws)
  core/            # Config, security, auth deps, middleware
  routes/          # Legacy route modules (reused under /api/v1)
  services/        # Business logic
  models/          # Pydantic schemas
  db/              # Mongo client
frontend/
  src/pages/       # Landing, auth, user app, admin
  src/layouts/     # User & admin shells
```

## Environment

See `.env.example` and `frontend/.env.example`.
