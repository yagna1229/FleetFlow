"""
Trip model — the core dispatch/logistics entity.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Numeric, DateTime, ForeignKey,
    Enum, CheckConstraint, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.enums import TripStatus


class Trip(Base):
    __tablename__ = "trips"
    __table_args__ = (
        CheckConstraint("cargo_weight_kg >= 0", name="ck_trip_cargo_nonneg"),
        CheckConstraint(
            "end_odometer IS NULL OR end_odometer >= start_odometer",
            name="ck_trip_odometer_order",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False, index=True)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    cargo_weight_kg = Column(Numeric(10, 2), nullable=False)
    cargo_description = Column(Text, nullable=True)
    status = Column(
        Enum(TripStatus, name="tripstatus", create_constraint=True),
        default=TripStatus.DRAFT,
        nullable=False,
        index=True,
    )
    start_odometer = Column(Numeric(12, 2), nullable=True)
    end_odometer = Column(Numeric(12, 2), nullable=True)
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ──
    vehicle = relationship("Vehicle", back_populates="trips", lazy="selectin")
    driver = relationship("Driver", back_populates="trips", lazy="selectin")
    fuel_logs = relationship("FuelLog", back_populates="trip", lazy="select")
    expenses = relationship("TripExpense", back_populates="trip", lazy="select")
    creator = relationship("User", lazy="select")
