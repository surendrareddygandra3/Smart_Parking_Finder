from typing import List
from fastapi import APIRouter, Header, HTTPException, Depends, Query
from app.services.parking_services import list_parkings_service, parking_details, available_slots, available_slots_by_vehicle_type
from app.utils.decorator import handle_exceptions
from app.models.parking_models import ParkingLotResponse
from app.utils.logger import get_logger
from app.core.auth import get_auth_context

router = APIRouter()

logger = get_logger(__name__)

@router.get("/list", response_model=ParkingLotResponse)
async def get_parkings(
    vehicle_type: str | None = Query(default=None),
    auth: dict = Depends(get_auth_context),
):
    """
    List all parking lots. Optional filter by vehicle_type.
    Requires Authorization header: Bearer <token>
    """
    # `auth` is validated (JWT + session + blacklist). Keep service signature for now.
    parkings_list = await list_parkings_service(auth["token"], vehicle_type)
    
    return {"parkings": parkings_list}

@router.get("/parkings/{lot_id}", response_model=dict)
async def get_parking_details(
    lot_id: int,
    auth: dict = Depends(get_auth_context),
):  
    logger.info("Parkings List requested.")

    # ✅ Pass only lot_id to service
    return await parking_details(lot_id)

@router.get("/slots/available")
async def get_available_slots(
    vehicle_type: str | None = Query(None, description="Filter by vehicle type (car/bike/etc)"),
    auth: dict = Depends(get_auth_context),
):  

    return await available_slots(vehicle_type)