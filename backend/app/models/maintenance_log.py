"""
Maintenance log model — vehicle service tracking.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Date, DateTime,
    Boolean, ForeignKey, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    service_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Numeric(12, 2), nullable=False, default=0)
    service_date = Column(Date, nullable=False, index=True)
    completed_date = Column(Date, nullable=True)
    is_completed = Column(Boolean, default=False)
    logged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──
    vehicle = relationship("Vehicle", back_populates="maintenance_logs", lazy="selectin")
    logger = relationship("User", lazy="select")
