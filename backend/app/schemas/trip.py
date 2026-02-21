"""
Pydantic schemas for Trip operations.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.utils.enums import TripStatus
from app.schemas.vehicle import VehicleOut
from app.schemas.driver import DriverOut


# ── Input ──

class TripCreate(BaseModel):
    vehicle_id: int
    driver_id: int
    origin: str = Field(..., max_length=255)
    destination: str = Field(..., max_length=255)
    cargo_weight_kg: Decimal = Field(..., ge=0)
    cargo_description: str | None = None


class TripDispatch(BaseModel):
    start_odometer: Decimal


class TripComplete(BaseModel):
    end_odometer: Decimal = Field(..., ge=0)


# ── Output ──

class TripOut(BaseModel):
    id: int
    vehicle_id: int
    driver_id: int
    origin: str
    destination: str
    cargo_weight_kg: Decimal
    cargo_description: str | None
    status: TripStatus
    start_odometer: Decimal | None
    end_odometer: Decimal | None
    dispatched_at: datetime | None
    completed_at: datetime | None
    created_by: int | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class TripDetailOut(TripOut):
    """Includes nested vehicle and driver objects."""
    vehicle: VehicleOut | None = None
    driver: DriverOut | None = None
