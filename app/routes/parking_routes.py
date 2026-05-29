from fastapi import APIRouter, Depends, Query

from app.core.auth import get_auth_context
from app.models.parking_models import ParkingLotResponse
from app.services.parking_services import list_parkings_service, parking_details, available_slots
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/list", response_model=ParkingLotResponse)
async def get_parkings(
    vehicle_type: str | None = Query(default=None),
    auth: dict = Depends(get_auth_context),
):
    _ = auth
    parkings_list = await list_parkings_service(vehicle_type)
    return {"parkings": parkings_list}


@router.get("/lots/{lot_id}")
async def get_parking_details(lot_id: int, auth: dict = Depends(get_auth_context)):
    _ = auth
    return await parking_details(lot_id)


@router.get("/slots/available")
async def get_available_slots(
    vehicle_type: str | None = Query(None),
    auth: dict = Depends(get_auth_context),
):
    _ = auth
    return await available_slots(vehicle_type)
