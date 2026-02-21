"""
Trip expense model — toll, parking, penalty, and other costs.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey,
    Enum, CheckConstraint, func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.enums import ExpenseCategory


class TripExpense(Base):
    __tablename__ = "trip_expenses"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_expense_amount_nonneg"),
    )

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    category = Column(
        Enum(ExpenseCategory, name="expensecategory", create_constraint=True),
        nullable=False,
    )
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(Text, nullable=True)
    expense_date = Column(Date, nullable=False)
    logged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──
    trip = relationship("Trip", back_populates="expenses", lazy="selectin")
    logger = relationship("User", lazy="select")
