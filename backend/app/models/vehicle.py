"""
Vehicle model — physical fleet assets.
"""

from sqlalchemy import (
    Column, Integer, String, Numeric, DateTime, Enum, CheckConstraint, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.enums import VehicleStatus, VehicleType


class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        CheckConstraint("max_capacity_kg > 0", name="ck_vehicle_capacity_positive"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model = Column(String(100), nullable=True)
    vehicle_type = Column(
        Enum(VehicleType, name="vehicletype", create_constraint=True),
        nullable=False,
    )
    license_plate = Column(String(20), unique=True, nullable=False, index=True)
    max_capacity_kg = Column(Numeric(10, 2), nullable=False)
    odometer_km = Column(Numeric(12, 2), default=0)
    acquisition_cost = Column(Numeric(12, 2), default=0)
    status = Column(
        Enum(VehicleStatus, name="vehiclestatus", create_constraint=True),
        default=VehicleStatus.AVAILABLE,
        nullable=False,
        index=True,
    )
    region = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ──
    trips = relationship("Trip", back_populates="vehicle", lazy="select")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle", lazy="select")
    fuel_logs = relationship("FuelLog", back_populates="vehicle", lazy="select")
