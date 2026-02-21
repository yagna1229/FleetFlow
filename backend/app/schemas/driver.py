"""
Pydantic schemas for Driver CRUD operations.
"""

from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field

from app.utils.enums import DriverStatus, LicenseCategory


# ── Input ──

class DriverCreate(BaseModel):
    full_name: str = Field(..., max_length=150)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    license_number: str = Field(..., max_length=50)
    license_category: LicenseCategory
    license_expiry: date


class DriverUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=150)
    phone: str | None = None
    license_category: LicenseCategory | None = None
    license_expiry: date | None = None
    status: DriverStatus | None = None
    safety_score: Decimal | None = None


# ── Output ──

class DriverOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None
    license_number: str
    license_category: LicenseCategory
    license_expiry: date
    status: DriverStatus
    safety_score: Decimal
    total_trips: int
    completed_trips: int
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
