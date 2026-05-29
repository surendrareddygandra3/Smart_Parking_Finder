import pytest
from fastapi import HTTPException

from app.services.booking_service import _pick_available_slot


def test_pick_auto_car_slot():
    slots = [
        {"slot_id": "1-1", "vehicle_type": "bike", "status": "available"},
        {"slot_id": "1-2", "vehicle_type": "car", "status": "available"},
    ]
    picked = _pick_available_slot(slots, "car", None)
    assert picked["slot_id"] == "1-2"


def test_pick_wrong_vehicle_raises():
    slots = [{"slot_id": "1-1", "vehicle_type": "bike", "status": "available"}]
    with pytest.raises(HTTPException) as exc:
        _pick_available_slot(slots, "car", "1-1")
    assert exc.value.status_code == 400
