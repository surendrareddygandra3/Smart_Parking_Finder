from fastapi import APIRouter, Depends, Query

from app.core.auth import get_auth_context
from app.models.booking_models import CreateBookingRequest, BookingsResponse
from app.services.booking_service import create_booking, list_bookings, get_booking_by_id, release_booking
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/create")
async def create_booking_route(booking_data: CreateBookingRequest, auth: dict = Depends(get_auth_context)):
    return await create_booking(booking_data, auth["payload"])


@router.post("/reserve")
async def reserve_booking_route(
    lot_id: int,
    vehicle_type: str,
    auth: dict = Depends(get_auth_context),
):
    """Simple booking: only lot + vehicle type (auto-picks slot)."""
    payload = CreateBookingRequest(lot_id=lot_id, vehicle_type=vehicle_type, slot_id=None)
    return await create_booking(payload, auth["payload"])


@router.get("/list", response_model=list[BookingsResponse])
async def list_bookings_route(
    user_email: str | None = Query(default=None),
    auth: dict = Depends(get_auth_context),
):
    email = auth["payload"].get("email")
    role = auth["payload"].get("role", "user")
    if role != "admin":
        return await list_bookings(email)
    return await list_bookings(user_email or email)


@router.get("/{booking_id}")
async def get_booking_route(booking_id: str, auth: dict = Depends(get_auth_context)):
    role = auth["payload"].get("role", "user")
    email = None if role == "admin" else auth["payload"].get("email")
    return await get_booking_by_id(booking_id, email)


@router.delete("/release/{booking_id}")
async def release_booking_route(booking_id: str, auth: dict = Depends(get_auth_context)):
    role = auth["payload"].get("role", "user")
    email = None if role == "admin" else auth["payload"].get("email")
    return await release_booking(booking_id, email)
