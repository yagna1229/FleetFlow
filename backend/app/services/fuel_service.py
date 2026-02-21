"""
Fuel log service.
"""

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.fuel_repo import FuelRepository
from app.repositories.trip_repo import TripRepository
from app.schemas.fuel import FuelLogCreate
from app.models.fuel_log import FuelLog


class FuelService:
    def __init__(self, db: AsyncSession):
        self.repo = FuelRepository(db)
        self.trip_repo = TripRepository(db)

    async def create_log(self, data: FuelLogCreate, logged_by: int | None = None) -> FuelLog:
        trip = await self.trip_repo.get_by_id(data.trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        return await self.repo.create(**data.model_dump(), logged_by=logged_by)

    async def list_logs(self, offset: int = 0, limit: int = 25, vehicle_id: int | None = None):
        filters = []
        if vehicle_id:
            filters.append(FuelLog.vehicle_id == vehicle_id)
        return await self.repo.list_all(offset=offset, limit=limit, filters=filters)

    async def get_log(self, log_id: int) -> FuelLog:
        log = await self.repo.get_by_id(log_id)
        if not log:
            raise HTTPException(status_code=404, detail="Fuel log not found")
        return log
