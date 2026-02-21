"""
Driver model — human resources & compliance.
"""

from sqlalchemy import (
    Column, Integer, String, Numeric, Date, DateTime, Enum, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.enums import DriverStatus, LicenseCategory


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    license_number = Column(String(50), unique=True, nullable=False)
    license_category = Column(
        Enum(LicenseCategory, name="licensecategory", create_constraint=True),
        nullable=False,
    )
    license_expiry = Column(Date, nullable=False)
    status = Column(
        Enum(DriverStatus, name="driverstatus", create_constraint=True),
        default=DriverStatus.AVAILABLE,
        nullable=False,
        index=True,
    )
    safety_score = Column(Numeric(5, 2), default=100.00)
    total_trips = Column(Integer, default=0)
    completed_trips = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ──
    trips = relationship("Trip", back_populates="driver", lazy="select")
