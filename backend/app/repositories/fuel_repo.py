"""Fuel log repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fuel_log import FuelLog
from app.repositories.base import BaseRepository


class FuelRepository(BaseRepository[FuelLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(FuelLog, db)
