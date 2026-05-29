from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.auth import require_admin
from app.db.mongo_db import db
import uuid
from datetime import datetime

router = APIRouter(dependencies=[Depends(require_admin)])


# ============ Analytics ============
@router.get("/analytics/overview")
async def analytics_overview():
    """Get dashboard overview statistics"""
    users = await db["users"].count_documents({})
    bookings = await db["bookings"].count_documents({})
    active_bookings = await db["bookings"].count_documents({"status": "active"})
    lots = await db["parking_lots"].count_documents({})

    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    booking_by_status = {}
    async for row in db["bookings"].aggregate(pipeline):
        booking_by_status[row["_id"]] = row["count"]

    return {
        "users": users,
        "parking_lots": lots,
        "bookings_total": bookings,
        "bookings_active": active_bookings,
        "bookings_by_status": booking_by_status,
    }


# ============ Parking Lot Management ============
class CreateParkingLot(BaseModel):
    lot_name: str
    location: str
    hourly_rate: float
    total_slots_count: int


@router.get("/parking-lots")
async def get_all_parking_lots():
    """List all parking lots"""
    lots = await db["parking_lots"].find().to_list(100)
    return [
        {
            "lot_id": lot["lot_id"],
            "lot_name": lot["lot_name"],
            "location": lot["location"],
            "hourly_rate": lot.get("hourly_rate", 0),
            "total_slots": len(lot.get("total_slots", [])),
            "available_slots": lot.get("available_slots", 0),
            "booked_slots": lot.get("booked_slots", 0),
        }
        for lot in lots
    ]


@router.post("/parking-lots")
async def create_parking_lot(data: CreateParkingLot):
    """Create a new parking lot"""
    max_id = 0
    async for lot in db["parking_lots"].find():
        max_id = max(max_id, lot.get("lot_id", 0))
    
    lot_id = max_id + 1
    slots = []
    for i in range(1, data.total_slots_count + 1):
        slots.append({
            "slot_id": f"{lot_id}-{i}",
            "vehicle_type": "car" if i % 2 == 1 else "bike",
            "status": "available",
        })
    
    new_lot = {
        "lot_id": lot_id,
        "lot_name": data.lot_name,
        "location": data.location,
        "hourly_rate": data.hourly_rate,
        "total_slots": slots,
        "available_slots": len(slots),
        "booked_slots": 0,
    }
    
    await db["parking_lots"].insert_one(new_lot)
    return {"message": "Parking lot created", "lot_id": lot_id}


@router.delete("/parking-lots/{lot_id}")
async def delete_parking_lot(lot_id: int):
    """Delete a parking lot"""
    result = await db["parking_lots"].delete_one({"lot_id": lot_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return {"message": "Parking lot deleted"}


# ============ Booking Management ============
@router.get("/bookings")
async def get_all_bookings():
    """List all bookings"""
    bookings = await db["bookings"].find().sort("created_at", -1).to_list(200)
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


@router.delete("/bookings/{booking_id}")
async def cancel_booking_admin(booking_id: str):
    """Cancel booking (admin can cancel any booking)"""
    booking = await db["bookings"].find_one({"booking_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    lot = await db["parking_lots"].find_one({"lot_id": int(booking["lot_id"])})
    if lot:
        for s in lot["total_slots"]:
            if s["slot_id"] == booking["slot_id"]:
                s["status"] = "available"
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

    await db["bookings"].delete_one({"booking_id": booking_id})
    return {"message": "Booking cancelled"}


# ============ User Management ============
@router.get("/users")
async def get_all_users():
    """List all users"""
    users = await db["users"].find().to_list(200)
    return [
        {
            "email": u["email"],
            "name": u.get("name", ""),
            "phone": u.get("phone", ""),
            "role": u.get("role", "user"),
            "created_at": u.get("created_at", ""),
        }
        for u in users
    ]


@router.delete("/users/{email}")
async def delete_user(email: str):
    """Delete a user"""
    result = await db["users"].delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
