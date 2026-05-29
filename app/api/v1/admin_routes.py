from fastapi import APIRouter, Depends

from app.core.auth import require_admin
from app.db.mongo_db import user_collection, bookings_collection, parkings_collection

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/analytics/overview")
async def analytics_overview():
    users = await user_collection.count_documents({})
    bookings = await bookings_collection.count_documents({})
    active_bookings = await bookings_collection.count_documents({"status": "active"})
    lots = await parkings_collection.count_documents({})

    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    booking_by_status = {}
    async for row in bookings_collection.aggregate(pipeline):
        booking_by_status[row["_id"]] = row["count"]

    return {
        "users": users,
        "parking_lots": lots,
        "bookings_total": bookings,
        "bookings_active": active_bookings,
        "bookings_by_status": booking_by_status,
    }
