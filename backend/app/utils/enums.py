"""
Python enums mirroring PostgreSQL ENUM types.

Used in SQLAlchemy models and Pydantic schemas.
"""

import enum


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    IN_SHOP = "IN_SHOP"
    RETIRED = "RETIRED"


class VehicleType(str, enum.Enum):
    TRUCK = "TRUCK"
    VAN = "VAN"
    BIKE = "BIKE"


class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    OFF_DUTY = "OFF_DUTY"
    SUSPENDED = "SUSPENDED"


class LicenseCategory(str, enum.Enum):
    TRUCK = "TRUCK"
    VAN = "VAN"
    BIKE = "BIKE"
    ALL = "ALL"


class TripStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ExpenseCategory(str, enum.Enum):
    TOLL = "TOLL"
    PARKING = "PARKING"
    PENALTY = "PENALTY"
    OTHER = "OTHER"
