"""
Pydantic schemas for Trip Expense operations.
"""

from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.utils.enums import ExpenseCategory


# ── Input ──

class ExpenseCreate(BaseModel):
    trip_id: int
    category: ExpenseCategory
    amount: Decimal = Field(..., ge=0)
    description: str | None = None
    expense_date: date


# ── Output ──

class ExpenseOut(BaseModel):
    id: int
    trip_id: int
    category: ExpenseCategory
    amount: Decimal
    description: str | None
    expense_date: date
    logged_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
