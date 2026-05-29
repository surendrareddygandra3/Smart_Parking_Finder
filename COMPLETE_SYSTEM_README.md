# Smart Parking Finder - Complete System Documentation

## Overview

This is a **production-ready Smart Parking Finder & Management System** built with:
- **Backend**: FastAPI + Python + MongoDB
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: JWT Token-based

---

## What's Included

### ✅ Complete Features Implemented

#### **User Features**
- ✅ Registration & Login with JWT authentication
- ✅ Browse available parking lots in real-time
- ✅ Book parking slots with automatic slot selection
- ✅ View active bookings
- ✅ **Cancel bookings** (NEW)
- ✅ Booking history
- ✅ View booking details

#### **Admin Features** 
- ✅ Complete dashboard with analytics
- ✅ **Manage parking lots** (Create, Read, Delete)
- ✅ **View all bookings** (Read, Delete/Cancel)
- ✅ **Manage users** (View, Delete)
- ✅ Real-time statistics
- ✅ Booking status distribution

#### **Backend API**
- ✅ User authentication (register, login, password reset)
- ✅ Parking lot management (CRUD)
- ✅ Booking management (Create, Read, Cancel/Delete)
- ✅ Admin analytics
- ✅ Real-time WebSocket support for updates
- ✅ Comprehensive error handling
- ✅ Input validation

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│         (TypeScript + Tailwind CSS)                    │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ User         │      │ Admin        │               │
│  │ Dashboard    │      │ Dashboard    │               │
│  └──────────────┘      └──────────────┘               │
└────────────┬────────────────────────────┬──────────────┘
             │                            │
             │    REST APIs + JWT Token   │
             ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes:                                          │  │
│  │  • /api/v1/auth/* - Authentication              │  │
│  │  • /api/v1/user/* - User management             │  │
│  │  • /api/v1/parking/* - Parking lots             │  │
│  │  • /api/v1/booking/* - Booking operations       │  │
│  │  • /api/v1/admin/* - Admin operations           │  │
│  └──────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────┘
             │
             │   MongoDB Operations
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB Atlas Database                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Collections:                                     │  │
│  │  • users - User accounts & profiles             │  │
│  │  • parking_lots - Parking locations & slots     │  │
│  │  • bookings - Parking reservations              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Backend API Endpoints

### Authentication (`/api/v1/auth`)
```
POST   /register              - Register new user
POST   /login                 - Login & get JWT token
POST   /Forgot_Password       - Initiate password reset
POST   /verify_otp            - Verify OTP and reset password
```

### User Management (`/api/v1/user`)
```
PUT    /update                - Update user profile
PUT    /change_password       - Change password
POST   /logout                - Logout user
```

### Parking Management (`/api/v1/parking`)
```
GET    /list                  - List all parking lots
GET    /lots/{lot_id}         - Get parking lot details
GET    /slots/available       - Get available slots
```

### Booking Management (`/api/v1/booking`)
```
POST   /create                - Create booking with specific slot
POST   /reserve               - Quick book (auto-select slot)
GET    /list                  - Get user's bookings
GET    /{booking_id}          - Get booking details
DELETE /release/{booking_id}  - Cancel booking (USER)
```

### Admin Operations (`/api/v1/admin`)
```
GET    /analytics/overview    - Dashboard statistics

PARKING LOT MANAGEMENT:
GET    /parking-lots          - List all lots
POST   /parking-lots          - Create new lot
DELETE /parking-lots/{lot_id} - Delete lot

BOOKING MANAGEMENT:
GET    /bookings              - List all bookings
DELETE /bookings/{booking_id} - Cancel booking (ADMIN)

USER MANAGEMENT:
GET    /users                 - List all users
DELETE /users/{email}         - Delete user
```

---

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9876543210",
  "password": "hashed_password",
  "role": "user",
  "created_at": "2024-05-29T10:30:00Z"
}
```

### Parking Lot
```json
{
  "lot_id": 1,
  "lot_name": "Downtown Parking",
  "location": "123 Main St",
  "hourly_rate": 50,
  "total_slots": [
    {
      "slot_id": "1-1",
      "vehicle_type": "car",
      "status": "available"
    }
  ],
  "available_slots": 5,
  "booked_slots": 3
}
```

### Booking
```json
{
  "booking_id": "B12345ABC",
  "user_email": "user@example.com",
  "lot_id": 1,
  "slot_id": "1-5",
  "vehicle_type": "car",
  "status": "active",
  "created_at": "2024-05-29T14:20:00Z",
  "expires_at": null
}
```

---

## Frontend Pages & Components

### Public Pages
- **Landing Page** (`/`) - Welcome & intro
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user signup

### User Pages (Protected)
- **Dashboard** (`/app`) - Parking lots, active bookings, cancel button
- **Map** (`/app/map`) - Visual parking map
- **Booking History** - View completed bookings

### Admin Pages (Protected - Admin only)
- **Admin Dashboard** (`/admin`) - Full management interface
  - **Overview Tab** - Analytics & statistics
  - **Parking Lots Tab** - Create, view, delete lots
  - **Bookings Tab** - View & cancel all bookings
  - **Users Tab** - View & delete users

---

## Key Features

### 1. **Real-time Slot Availability**
- Parking lots update immediately after booking/cancellation
- WebSocket support for live updates
- Available slots counter per lot

### 2. **Smart Booking System**
```
User Types:
- Manual Booking: Select specific lot + vehicle type → Auto-find matching slot
- Quick Booking: One-click reservation with default vehicle type (car)

Slot Selection Logic:
- Matches vehicle type (car, bike, scooter, truck)
- Auto-selects first available slot
- Prevents double booking
```

### 3. **Booking Cancellation** ✨ NEW
- Users can cancel their own active bookings
- Admin can cancel any booking
- Slot automatically becomes available again
- Real-time UI update

### 4. **Admin Complete Control** ✨ NEW
- Create unlimited parking lots with custom slot counts
- Monitor all bookings across the system
- Cancel any booking instantly
- Manage user accounts
- View real-time analytics

### 5. **Error Handling**
- Comprehensive validation for all inputs
- Clear error messages
- HTTP status codes
- Toast notifications for user feedback

---

## Setup & Running

### Backend Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with MongoDB URI, JWT secret, etc.

# 3. Run server
python main.py
```

Server runs on `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Database Collections

### Users Collection
```javascript
db.users.find()
// Fields: _id, email, name, phone, password, role, created_at, updated_at
```

### Parking Lots Collection
```javascript
db.parking_lots.find()
// Fields: lot_id, lot_name, location, hourly_rate, total_slots, 
//         available_slots, booked_slots
```

### Bookings Collection
```javascript
db.bookings.find()
// Fields: booking_id, user_email, lot_id, slot_id, vehicle_type, 
//         status, created_at, expires_at
```

---

## Authentication Flow

```
1. User Registration
   └─ POST /register → Email, Password → Create user → Return token

2. User Login
   └─ POST /login → Email/Phone, Password → Validate → Return JWT token

3. Protected Routes
   └─ Include Authorization: Bearer <token> in header
   └─ Backend verifies token → Grant access

4. Admin Routes
   └─ Only accessible if user role == "admin"
   └─ Token validation + role check
```

---

## Error Responses

### Standard Error Format
```json
{
  "detail": "Descriptive error message"
}
```

### Common Status Codes
```
200 OK                    - Request successful
201 Created              - Resource created
400 Bad Request          - Invalid input
401 Unauthorized         - Missing/invalid token
403 Forbidden            - Access denied (e.g., not admin)
404 Not Found            - Resource doesn't exist
409 Conflict             - Slot not available, double booking, etc.
500 Internal Server Error - Server error
```

---

## Validation Rules

### Booking Creation
- ✅ Valid lot_id exists
- ✅ Valid vehicle_type (car, bike, scooter, truck)
- ✅ Slot availability match
- ✅ User must be authenticated

### Parking Lot Creation (Admin)
- ✅ lot_name not empty
- ✅ location not empty
- ✅ hourly_rate > 0
- ✅ total_slots_count > 0

---

## Performance & Scalability

- **MongoDB Indexing**: Optimized for common queries
- **Async/Await**: Non-blocking API operations
- **Query Optimization**: Minimal database calls
- **Response Caching**: React Query for client-side caching
- **WebSocket**: Real-time updates without polling

---

## Security Features

1. **JWT Authentication** - Stateless token-based auth
2. **Password Hashing** - Bcrypt for secure storage
3. **CORS** - Cross-origin requests controlled
4. **Role-based Access Control** - Admin vs User routes
5. **Input Validation** - Pydantic models
6. **Error Handling** - No sensitive info in errors

---

## Testing

### Test Files Available
- `tests/test_health.py` - Health check
- `tests/test_booking_logic.py` - Booking operations

### Run Tests
```bash
pytest tests/
```

---

## Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart_parking

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=24  # hours

# Admin
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@smartparking.com
ADMIN_PASSWORD=admin123  # Change in production

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (for OTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change JWT_SECRET to strong random value
- [ ] Change ADMIN_PASSWORD
- [ ] Use production MongoDB URI
- [ ] Set CORS_ORIGINS to your domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Load test the system
- [ ] Document admin credentials

---

## Troubleshooting

### Issue: 400 Error on Booking
**Solution**: Check if vehicle_type matches slot type. Use `/reserve` endpoint for auto-selection.

### Issue: Admin Dashboard Not Accessible
**Solution**: Verify user role is "admin" in database. Check JWT token validity.

### Issue: Slots Not Updating
**Solution**: Ensure MongoDB connection is active. Check database for data consistency.

### Issue: Password Reset Not Working
**Solution**: Verify SMTP configuration in `.env`. Check email service is active.

---

## Future Enhancements

1. **Payments Integration** - Stripe/Razorpay
2. **Email Notifications** - Booking confirmations
3. **SMS Alerts** - Real-time slot updates
4. **QR Code Entry** - Smart entry system
5. **Vehicle Management** - Save multiple vehicles
6. **Favorites** - Save preferred parking locations
7. **Reviews & Ratings** - User feedback system
8. **Advanced Analytics** - Revenue reports, occupancy trends
9. **Mobile App** - React Native version
10. **AI Recommendations** - ML-based parking suggestions

---

## Support & Contact

For issues or questions:
- Check the API documentation at `/docs`
- Review error messages in browser console
- Check backend logs for detailed errors

---

## License

This project is part of a professional portfolio. All rights reserved.

---

**Last Updated**: May 29, 2024
**Version**: 2.0 - Complete & Production Ready ✨
