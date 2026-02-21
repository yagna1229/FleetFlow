"""
User model — extended from existing with role FK, is_active, is_verified.
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, DateTime, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_google_user = Column(Boolean, default=False)

    # ── New fields ──
    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=True,          # nullable initially for existing rows
        index=True,
    )
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ──
    role = relationship("Role", lazy="selectin")