from fastapi import FastAPI
from app.routes import user_routes,parking_routes, booking_routes
from seed import seed_initial_data
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import CORS_ORIGINS
from app.api.v1.router import api_v1_router
from app.core.middleware import RequestContextMiddleware
from app.core.error_handlers import install_error_handlers
 
app = FastAPI(
    title="Smart Parking Finder API",
    version="0.1.0",
)

app.add_middleware(RequestContextMiddleware)
install_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router, prefix="/user", tags=["User Management"])

app.include_router(parking_routes.router, prefix="/parking", tags=["Parking Management"])

app.include_router(booking_routes.router, prefix="/booking", tags=["Booking Management"])

# Versioned API (recommended for production clients)
app.include_router(api_v1_router, prefix="/api/v1")


# Run seeding at startup
@app.on_event("startup")
async def startup_event():
    await seed_initial_data()