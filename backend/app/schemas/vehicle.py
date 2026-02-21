"""
Pydantic schemas for Vehicle CRUD operations.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.utils.enums import VehicleStatus, VehicleType


# ── Input ──

class VehicleCreate(BaseModel):
    name: str = Field(..., max_length=100)
    model: str | None = Field(None, max_length=100)
    vehicle_type: VehicleType
    license_plate: str = Field(..., max_length=20)
    max_capacity_kg: Decimal = Field(..., gt=0)
    odometer_km: Decimal = Field(default=Decimal("0"))
    acquisition_cost: Decimal = Field(default=Decimal("0"))
    region: str | None = Field(None, max_length=50)


class VehicleUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    model: str | None = Field(None, max_length=100)
    max_capacity_kg: Decimal | None = Field(None, gt=0)
    odometer_km: Decimal | None = None
    region: str | None = None
    status: VehicleStatus | None = None


# ── Output ──

class VehicleOut(BaseModel):
    id: int
    name: str
    model: str | None
    vehicle_type: VehicleType
    license_plate: str
    max_capacity_kg: Decimal
    odometer_km: Decimal
    acquisition_cost: Decimal
    status: VehicleStatus
    region: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
