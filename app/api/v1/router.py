from fastapi import APIRouter

from app.routes import user_routes, parking_routes, booking_routes
from app.api.v1 import auth_routes, admin_routes, ws_routes, payment_routes

api_v1_router = APIRouter()

# New v1 routes
api_v1_router.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(admin_routes.router, prefix="/admin", tags=["Admin"])
api_v1_router.include_router(payment_routes.router, prefix="/payments", tags=["Payments"])
api_v1_router.include_router(ws_routes.router, prefix="/ws", tags=["WebSocket"])

# Reuse existing routers to avoid rewriting/breaking contracts.
api_v1_router.include_router(user_routes.router, prefix="/user", tags=["User Management"])
api_v1_router.include_router(parking_routes.router, prefix="/parking", tags=["Parking Management"])
api_v1_router.include_router(booking_routes.router, prefix="/booking", tags=["Booking Management"])

