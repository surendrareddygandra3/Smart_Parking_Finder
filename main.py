from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import CORS_ORIGINS
from app.core.error_handlers import install_error_handlers
from app.core.middleware import RequestContextMiddleware
from seed import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_initial_data()
    yield


app = FastAPI(
    title="Smart Parking Finder API",
    description="Production-ready smart parking backend (v1)",
    version="1.0.0",
    lifespan=lifespan,
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

# Single versioned API surface
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "api": "/api/v1", "docs": "/docs"}
