"""
Model registry — import all models here so Alembic and Base.metadata
can discover every table automatically.
"""

from app.models.role import Role
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance_log import MaintenanceLog
from app.models.fuel_log import FuelLog
from app.models.trip_expense import TripExpense

__all__ = [
    "Role",
    "User",
    "Vehicle",
    "Driver",
    "Trip",
    "MaintenanceLog",
    "FuelLog",
    "TripExpense",
]
