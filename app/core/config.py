import os
from dotenv import load_dotenv

load_dotenv()

# Security
SECRET_KEY = os.getenv("JWT_SECRET", "")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "14"))

# Database
# IMPORTANT: never hardcode credentials in code. Use `.env` / secrets manager.
# Default is local Mongo for developer convenience.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "smart_parking_db")

# CORS
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

# Default admin (created on first startup if no admin exists)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@smartparking.local")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@12345")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")

# Redis (optional caching / rate limiting)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Razorpay (payments)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
