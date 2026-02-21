"""Trip expense repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trip_expense import TripExpense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[TripExpense]):
    def __init__(self, db: AsyncSession):
        super().__init__(TripExpense, db)
