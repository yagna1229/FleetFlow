"""
Pydantic schemas for Fuel Log operations.
"""

from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field


# ── Input ──

class FuelLogCreate(BaseModel):
    trip_id: int
    vehicle_id: int
    liters: Decimal = Field(..., gt=0)
    cost: Decimal = Field(..., ge=0)
    refuel_date: date
    odometer_at_refuel: Decimal | None = None


# ── Output ──

class FuelLogOut(BaseModel):
    id: int
    trip_id: int
    vehicle_id: int
    liters: Decimal
    cost: Decimal
    refuel_date: date
    odometer_at_refuel: Decimal | None
    logged_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
