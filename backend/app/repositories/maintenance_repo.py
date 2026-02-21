"""Maintenance log repository."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.maintenance_log import MaintenanceLog
from app.repositories.base import BaseRepository


class MaintenanceRepository(BaseRepository[MaintenanceLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(MaintenanceLog, db)

    async def get_open_by_vehicle(self, vehicle_id: int) -> list[MaintenanceLog]:
        """Returns incomplete maintenance logs for a vehicle."""
        result = await self.db.execute(
            select(MaintenanceLog).where(
                MaintenanceLog.vehicle_id == vehicle_id,
                MaintenanceLog.is_completed == False,  # noqa: E712
            )
        )
        return list(result.scalars().all())
