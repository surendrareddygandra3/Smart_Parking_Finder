from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import HTTPException

from app.core.ws_manager import manager
from app.db.mongo_db import db
from app.models.booking_models import CreateBookingRequest
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _norm_vehicle(value: str) -> str:
    return value.strip().lower()


def _pick_available_slot(slots: list[dict], vehicle_type: str, preferred_slot_id: str | None) -> dict | None:
    vtype = _norm_vehicle(vehicle_type)

    if preferred_slot_id:
        slot = next((s for s in slots if s.get("slot_id") == preferred_slot_id), None)
        if not slot:
            return None
        if _norm_vehicle(slot.get("vehicle_type", "")) != vtype:
            raise HTTPException(status_code=400, detail=f"Slot {preferred_slot_id} is not for vehicle type {vtype}")
        if slot.get("status") != "available":
            raise HTTPException(status_code=409, detail=f"Slot {preferred_slot_id} is not available")
        return slot

    for slot in slots:
        if slot.get("status") == "available" and _norm_vehicle(slot.get("vehicle_type", "")) == vtype:
            return slot
    return None


async def create_booking(data: CreateBookingRequest, user: dict):
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=400, detail="Invalid user: email missing from token")

    try:
        lot_id = int(data.lot_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid lot_id")

    vehicle_type = _norm_vehicle(data.vehicle_type)
    if vehicle_type not in {"car", "bike", "scooter", "truck"}:
        raise HTTPException(status_code=400, detail="vehicle_type must be car, bike, scooter, or truck")

    lot = await db["parking_lots"].find_one({"lot_id": lot_id})
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")

    slot = _pick_available_slot(lot.get("total_slots", []), vehicle_type, data.slot_id)
    if not slot:
        raise HTTPException(status_code=409, detail=f"No available {vehicle_type} slots in this lot")

    slot_id = slot["slot_id"]
    booking_id = "B" + uuid.uuid4().hex[:8].upper()
    now = datetime.utcnow()

    await db["bookings"].insert_one(
        {
            "booking_id": booking_id,
            "user_email": user_email,
            "lot_id": lot["lot_id"],
            "slot_id": slot_id,
            "vehicle_type": vehicle_type,
            "status": "active",
            "created_at": now,
            "expires_at": None,
        }
    )

    for s in lot["total_slots"]:
        if s["slot_id"] == slot_id:
            s["status"] = "booked"
            break

    available_count = sum(1 for s in lot["total_slots"] if s.get("status") == "available")
    booked_count = len(lot["total_slots"]) - available_count

    await db["parking_lots"].update_one(
        {"lot_id": lot["lot_id"]},
        {
            "$set": {
                "total_slots": lot["total_slots"],
                "available_slots": available_count,
                "booked_slots": booked_count,
            }
        },
    )

    logger.info("Booking %s created for %s at lot %s slot %s", booking_id, user_email, lot_id, slot_id)

    try:
        await manager.broadcast(
            "booking_created",
            {"booking_id": booking_id, "lot_id": lot["lot_id"], "slot_id": slot_id, "status": "active"},
        )
    except Exception:
        pass

    return {
        "message": "Booking successful. Slot reserved.",
        "booking_id": booking_id,
        "lot_id": lot["lot_id"],
        "slot_id": slot_id,
        "vehicle_type": vehicle_type,
        "user_email": user_email,
        "status": "active",
    }


async def list_bookings(user_email: str | None = None):
    query = {"user_email": user_email} if user_email else {}
    bookings = await db["bookings"].find(query).sort("created_at", -1).to_list(200)

    return [
        {
            "booking_id": b["booking_id"],
            "user_email": b["user_email"],
            "lot_id": b["lot_id"],
            "slot_id": b["slot_id"],
            "vehicle_type": b["vehicle_type"],
            "status": b["status"],
            "created_at": b["created_at"],
        }
        for b in bookings
    ]


async def get_booking_by_id(booking_id: str, user_email: str | None = None):
    query = {"booking_id": booking_id}
    if user_email:
        query["user_email"] = user_email

    booking = await db["bookings"].find_one(query)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.pop("_id", None)
    booking["lot_id"] = str(booking["lot_id"])
    return booking


async def release_booking(booking_id: str, user_email: str | None = None):
    query = {"booking_id": booking_id}
    if user_email:
        query["user_email"] = user_email

    booking = await db["bookings"].find_one(query)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    lot = await db["parking_lots"].find_one({"lot_id": int(booking["lot_id"])})
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")

    for s in lot["total_slots"]:
        if s["slot_id"] == booking["slot_id"]:
            s["status"] = "available"
            break

    await db["bookings"].delete_one({"booking_id": booking_id})

    available_count = sum(1 for s in lot["total_slots"] if s.get("status") == "available")
    booked_count = len(lot["total_slots"]) - available_count

    await db["parking_lots"].update_one(
        {"lot_id": lot["lot_id"]},
        {
            "$set": {
                "total_slots": lot["total_slots"],
                "available_slots": available_count,
                "booked_slots": booked_count,
            }
        },
    )

    return {
        "message": "Booking released successfully",
        "booking_id": booking_id,
        "lot_id": booking["lot_id"],
        "slot_id": booking["slot_id"],
        "status": "released",
    }
