from fastapi import APIRouter

from app.routes import user_routes, parking_routes, booking_routes
from app.api.v1 import auth_routes

api_v1_router = APIRouter()

# New v1 routes
api_v1_router.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])

# Reuse existing routers to avoid rewriting/breaking contracts.
api_v1_router.include_router(user_routes.router, prefix="/user", tags=["User Management"])
api_v1_router.include_router(parking_routes.router, prefix="/parking", tags=["Parking Management"])
api_v1_router.include_router(booking_routes.router, prefix="/booking", tags=["Booking Management"])

