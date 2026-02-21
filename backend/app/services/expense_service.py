"""
Expense service.
"""

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.expense_repo import ExpenseRepository
from app.repositories.trip_repo import TripRepository
from app.schemas.expense import ExpenseCreate
from app.models.trip_expense import TripExpense


class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.repo = ExpenseRepository(db)
        self.trip_repo = TripRepository(db)

    async def create_expense(self, data: ExpenseCreate, logged_by: int | None = None) -> TripExpense:
        trip = await self.trip_repo.get_by_id(data.trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        return await self.repo.create(**data.model_dump(), logged_by=logged_by)

    async def list_expenses(self, offset: int = 0, limit: int = 25, trip_id: int | None = None):
        filters = []
        if trip_id:
            filters.append(TripExpense.trip_id == trip_id)
        return await self.repo.list_all(offset=offset, limit=limit, filters=filters)

    async def get_expense(self, expense_id: int) -> TripExpense:
        expense = await self.repo.get_by_id(expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return expense
