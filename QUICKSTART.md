# Smart Parking Finder - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Git

---

## Backend Setup

### Step 1: Environment Configuration
```bash
cd Smart_Parking_Finder

# Create .env file from template
cp .env.example .env
```

### Step 2: Edit `.env` file
```env
# Database
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/smart_parking?retryWrites=true&w=majority

# JWT Settings
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION=24

# Admin Account
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@smartparking.com
ADMIN_PASSWORD=Admin@123

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (Optional - for password reset)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 3: Install & Run Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

✅ Backend will start on `http://localhost:8000`
📚 API docs at `http://localhost:8000/docs`

---

## Frontend Setup

### Step 1: Navigate to Frontend
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

✅ Frontend will start on `http://localhost:5173`

---

## 🎯 First-Time Testing

### 1. Access the Application
```
http://localhost:5173
```

### 2. Create User Account
- Click **"Register"**
- Enter email, password, name, phone
- Click **"Sign Up"**

### 3. Login
- Click **"Login"**
- Use your email and password
- ✅ You'll see the **User Dashboard**

### 4. Test Booking
- **Available Parking Lots** section shows all lots
- Click **"Book Parking"** button
- ✅ Booking created successfully (see toast notification)
- New booking appears in **"Active Bookings"**

### 5. Cancel Booking
- In **"Active Bookings"**, click **"Cancel"** button
- ✅ Booking cancelled, slot becomes available

### 6. Admin Access
- Create another account (or use admin)
- Navigate to `http://localhost:5173/admin`
- ✅ See **Admin Dashboard**

---

## 🔑 Admin Dashboard Features

### Overview Tab
- Total users, parking lots, bookings
- Booking status distribution

### Parking Lots Tab
- **View All Lots** - See all parking locations
- **Add Parking Lot** - Create new lot (fill form + click Create)
- **Delete Lot** - Remove parking lot

### Bookings Tab
- **View All Bookings** - See every booking in system
- **Cancel Booking** - Admin can cancel any booking

### Users Tab
- **View All Users** - See registered users
- **Delete User** - Remove user account

---

## 📊 API Examples

### Test Booking Creation
```bash
curl -X POST "http://localhost:8000/api/v1/booking/reserve" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lot_id": "1", "vehicle_type": "car"}'
```

### Test Booking Cancellation
```bash
curl -X DELETE "http://localhost:8000/api/v1/booking/release/B12345ABC" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Bookings (Admin)
```bash
curl -X GET "http://localhost:8000/api/v1/admin/bookings" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Create Parking Lot (Admin)
```bash
curl -X POST "http://localhost:8000/api/v1/admin/parking-lots" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lot_name": "New Parking",
    "location": "123 Main St",
    "hourly_rate": 50,
    "total_slots_count": 20
  }'
```

---

## 🧪 Test Scenarios

### Scenario 1: Simple User Flow
1. Register new account
2. Book a parking slot
3. View booking details
4. Cancel booking
5. Verify slot is available again

### Scenario 2: Admin Operations
1. Login as admin
2. Create new parking lot
3. View all users
4. View all bookings
5. Cancel a booking
6. Delete a parking lot

### Scenario 3: Concurrent Bookings
1. Open 2 browser tabs (logged in)
2. Tab 1: Book slot in Lot 1
3. Tab 2: Book slot in same lot
4. Verify different slots assigned
5. Both can cancel independently

---

## 🔍 Database Verification

### Check Collections (MongoDB Atlas UI)
```
Database: smart_parking

Collections:
✅ users - User accounts
✅ parking_lots - Parking locations with slots
✅ bookings - Active reservations
✅ admins - Admin accounts (optional)
```

### Sample Parking Lot Structure
```json
{
  "lot_id": 1,
  "lot_name": "Downtown Parking",
  "location": "123 Main Street",
  "hourly_rate": 50,
  "total_slots": [
    {
      "slot_id": "1-1",
      "vehicle_type": "car",
      "status": "available"
    },
    {
      "slot_id": "1-2",
      "vehicle_type": "bike",
      "status": "booked"
    }
  ],
  "available_slots": 8,
  "booked_slots": 2
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: Cannot connect to MongoDB
```
Error: Connection refused
Solution: 
- Verify MONGODB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure cluster is active
```

### Issue: CORS error in console
```
Error: Access to XMLHttpRequest blocked
Solution:
- Verify CORS_ORIGINS in .env includes http://localhost:5173
- Restart backend server
```

### Issue: JWT token expired
```
Error: 401 Unauthorized
Solution:
- Login again to get new token
- Or increase JWT_EXPIRATION in .env
```

### Issue: Admin cannot access admin routes
```
Error: 403 Forbidden
Solution:
- Verify user role is "admin" in database
- Check admin was created during seeding
```

### Issue: Booking fails with 400 error
```
Error: vehicle_type must be car, bike, scooter, or truck
Solution:
- Use only valid vehicle types
- Or use /reserve endpoint (auto-selects matching slot)
```

---

## 📁 File Structure Overview

```
Smart_Parking_Finder/
├── app/                          # Backend API
│   ├── api/v1/
│   │   ├── admin_routes.py       # ✨ Admin operations
│   │   ├── auth_routes.py        # Authentication
│   │   └── payment_routes.py     # Payments
│   ├── routes/
│   │   ├── booking_routes.py     # ✨ Booking with cancel
│   │   ├── parking_routes.py     # Parking lots
│   │   └── user_routes.py        # User management
│   ├── services/                 # Business logic
│   ├── models/                   # Data models
│   ├── core/                     # Auth, config
│   └── db/                       # Database setup
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── app/
│   │   │   │   ├── UserDashboard.tsx      # ✨ With cancel button
│   │   │   │   └── MapPage.tsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.tsx     # ✨ Complete management
│   │   ├── components/           # React components
│   │   ├── layouts/              # Page layouts
│   │   └── lib/                  # Utilities
├── main.py                       # Backend entry point
├── requirements.txt              # Python dependencies
├── seed.py                       # Database seeding
└── .env.example                  # Environment template
```

---

## 🚀 Deployment Tips

### Backend Deployment (e.g., Render, Railway)
```bash
# Use requirements.txt
pip install -r requirements.txt

# Use main.py as entry point
python main.py
```

### Frontend Deployment (e.g., Vercel, Netlify)
```bash
# Build static files
npm run build

# Deploy dist/ folder
```

### Environment Variables
Set these in your deployment platform:
- `MONGODB_URI`
- `JWT_SECRET` (use strong value!)
- `JWT_ALGORITHM`
- `JWT_EXPIRATION`
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `CORS_ORIGINS` (add your deployed domain)

---

## 📚 Documentation Files

- **[COMPLETE_SYSTEM_README.md](./COMPLETE_SYSTEM_README.md)** - Full system documentation
- **[BACKEND.md](./BACKEND.md)** - Backend technical details
- **[README.md](./README.md)** - General project info

---

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Backend**: FastAPI, MongoDB, JWT authentication, RESTful APIs  
✅ **Frontend**: React, TypeScript, React Query, Tailwind CSS  
✅ **Full Stack**: End-to-end application development  
✅ **Database**: MongoDB schema design, queries, indexes  
✅ **Authentication**: Secure token-based auth  
✅ **Real-time**: WebSocket support  
✅ **Admin Features**: Role-based access control  
✅ **Error Handling**: Comprehensive validation and error responses  
✅ **Production Ready**: Logging, monitoring, deployment ready  

---

## 🆘 Need Help?

1. Check the API docs: `http://localhost:8000/docs`
2. View backend logs: `user_login_api.log`
3. Check browser console for frontend errors
4. Verify `.env` configuration
5. Review MongoDB collections in Atlas UI

---

## ✨ Key Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ | Email-based signup |
| User Login | ✅ | JWT authentication |
| Book Parking | ✅ | Auto-slot selection |
| Cancel Booking | ✅ | Users & admins can cancel |
| View Bookings | ✅ | Active & history |
| Admin Dashboard | ✅ | Full management interface |
| Manage Lots | ✅ | Create, view, delete |
| Manage Users | ✅ | View, delete |
| Real-time Updates | ✅ | WebSocket support |
| Error Handling | ✅ | Comprehensive validation |

---

**Ready to go!** 🎉

Start building your parking management system now!

---

**Last Updated**: May 29, 2024  
**Version**: 2.0 - Complete & Production Ready
