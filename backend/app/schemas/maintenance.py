"""
Pydantic schemas for Maintenance Log operations.
"""

from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field


# ── Input ──

class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: str = Field(..., max_length=100)
    description: str | None = None
    cost: Decimal = Field(default=Decimal("0"), ge=0)
    service_date: date


class MaintenanceComplete(BaseModel):
    completed_date: date | None = None


# ── Output ──

class MaintenanceOut(BaseModel):
    id: int
    vehicle_id: int
    service_type: str
    description: str | None
    cost: Decimal
    service_date: date
    completed_date: date | None
    is_completed: bool
    logged_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
