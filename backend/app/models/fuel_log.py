"""
Fuel log model — per-trip fuel consumption tracking.
"""

from sqlalchemy import (
    Column, Integer, Numeric, Date, DateTime, ForeignKey,
    CheckConstraint, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class FuelLog(Base):
    __tablename__ = "fuel_logs"
    __table_args__ = (
        CheckConstraint("liters > 0", name="ck_fuel_liters_positive"),
        CheckConstraint("cost >= 0", name="ck_fuel_cost_nonneg"),
    )

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    liters = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(12, 2), nullable=False)
    refuel_date = Column(Date, nullable=False, index=True)
    odometer_at_refuel = Column(Numeric(12, 2), nullable=True)
    logged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──
    trip = relationship("Trip", back_populates="fuel_logs", lazy="selectin")
    vehicle = relationship("Vehicle", back_populates="fuel_logs", lazy="selectin")
    logger = relationship("User", lazy="select")
