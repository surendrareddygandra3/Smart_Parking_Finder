from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import get_current_user_payload
from app.core.config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from app.db.mongo_db import db

router = APIRouter()


class CreateOrderRequest(BaseModel):
    booking_id: str
    amount_inr: int


@router.post("/create-order")
async def create_order(body: CreateOrderRequest, user: dict = Depends(get_current_user_payload)):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Razorpay not configured")

    booking = await db["bookings"].find_one({"booking_id": body.booking_id, "user_email": user.get("email")})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Production: call razorpay.Order.create(...)
    order_id = f"order_{body.booking_id}"
    await db["payments"].insert_one(
        {
            "order_id": order_id,
            "booking_id": body.booking_id,
            "user_email": user.get("email"),
            "amount_inr": body.amount_inr,
            "status": "created",
        }
    )
    return {"order_id": order_id, "key_id": RAZORPAY_KEY_ID, "amount": body.amount_inr, "currency": "INR"}


@router.get("/history")
async def payment_history(user: dict = Depends(get_current_user_payload)):
    payments = await db["payments"].find({"user_email": user.get("email")}).to_list(100)
    for p in payments:
        p.pop("_id", None)
    return {"payments": payments}
