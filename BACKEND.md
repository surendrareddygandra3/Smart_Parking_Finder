# Smart Parking Finder — Backend v1

Simple, production-style FastAPI API. All routes live under **`/api/v1`**.

## Setup

```bash
pip install -r requirements.txt
copy .env.example .env
```

Required in `.env`:

```env
JWT_SECRET=your_long_random_secret
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=smart_parking_db
```

Run:

```bash
uvicorn main:app --reload
```

- Health: http://localhost:8000/health  
- Swagger: http://localhost:8000/docs  

## Auth flow (use this — not legacy email token login)

### 1. Register user

```http
POST /api/v1/user/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john@gmail.com",
  "phone_number": 9876543210,
  "password": "Secure@123",
  "dob": "2000-01-01",
  "doj": "2024-01-01",
  "address": "Hyderabad"
}
```

### 2. Login (returns JWT in response)

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "john@gmail.com",
  "password": "Secure@123"
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

Use header on all protected routes:

```
Authorization: Bearer <access_token>
```

### 3. Admin login

On first startup, a default admin is created if none exists (see `.env`):

- `ADMIN_EMAIL` (default: `admin@smartparking.local`)
- `ADMIN_PASSWORD` (default: `Admin@12345`)

```http
POST /api/v1/auth/login
{ "identifier": "admin@smartparking.local", "password": "Admin@12345" }
```

## Booking (fixed — auto slot selection)

**Why booking failed before:** slots alternate `car` / `bike`. Booking lot 1 slot `1-1` with `car` fails because `1-1` is a bike slot.

### Easy reserve (recommended)

```http
POST /api/v1/booking/reserve?lot_id=1&vehicle_type=car
Authorization: Bearer <access_token>
```

Server picks the first available slot for that vehicle type.

### Full create (optional slot)

```http
POST /api/v1/booking/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "lot_id": 1,
  "vehicle_type": "car",
  "slot_id": null
}
```

### List my bookings

```http
GET /api/v1/booking/list
Authorization: Bearer <access_token>
```

### Release booking

```http
DELETE /api/v1/booking/release/BXXXXXXXX
Authorization: Bearer <access_token>
```

## Parking

```http
GET /api/v1/parking/list
GET /api/v1/parking/lots/1
GET /api/v1/parking/slots/available?vehicle_type=car
```

## Admin analytics

```http
GET /api/v1/admin/analytics/overview
Authorization: Bearer <admin_access_token>
```

## Notes

- Auth is **JWT + blacklist** (no fragile per-request session match).
- Legacy `/user/login` sends token by email — use **`/api/v1/auth/login`** for apps.
