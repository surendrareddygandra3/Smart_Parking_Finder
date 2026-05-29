import os
from datetime import datetime, timezone

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME
from app.core.security import encrypt_password
from app.db.mongo_db import db


async def seed_admin():
    admins = db["admins"]
    if await admins.count_documents({}) > 0:
        return

    now = datetime.now(timezone.utc)
    await admins.insert_one(
        {
            "username": ADMIN_USERNAME,
            "email": ADMIN_EMAIL,
            "password": encrypt_password(ADMIN_PASSWORD),
            "role": "admin",
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        }
    )
    print(f"Admin seeded: {ADMIN_EMAIL} (change ADMIN_PASSWORD in .env for production)")


async def seed_parking_lots():
    lots_collection = db["parking_lots"]
    if await lots_collection.count_documents({}) > 0:
        print("Parking lots already exist — skip seed.")
        return

    vehicle_types = ["car", "bike"]
    lots = []
    for lot_id in range(1, 6):
        slots = []
        for slot_id in range(1, 7):
            slots.append(
                {
                    "slot_id": f"{lot_id}-{slot_id}",
                    "vehicle_type": vehicle_types[slot_id % 2],
                    "status": "available",
                }
            )
        lots.append(
            {
                "lot_id": lot_id,
                "lot_name": f"Parking Lot {lot_id}",
                "location": f"Area {lot_id}",
                "total_slots": slots,
                "available_slots": len(slots),
                "booked_slots": 0,
            }
        )

    await lots_collection.insert_many(lots)
    print("Parking lots seeded.")


async def seed_initial_data():
    await seed_admin()
    await seed_parking_lots()
