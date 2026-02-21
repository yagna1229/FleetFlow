"""Vehicle repository — domain-specific queries."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vehicle import Vehicle
from app.repositories.base import BaseRepository
from app.utils.enums import VehicleStatus


class VehicleRepository(BaseRepository[Vehicle]):
    def __init__(self, db: AsyncSession):
        super().__init__(Vehicle, db)

    async def get_by_license_plate(self, plate: str) -> Vehicle | None:
        result = await self.db.execute(
            select(Vehicle).where(Vehicle.license_plate == plate)
        )
        return result.scalar_one_or_none()

    async def get_available(self) -> list[Vehicle]:
        result = await self.db.execute(
            select(Vehicle).where(Vehicle.status == VehicleStatus.AVAILABLE)
        )
        return list(result.scalars().all())

    async def get_by_id_for_update(self, id: int) -> Vehicle | None:
        """SELECT ... FOR UPDATE — row-level lock for race-condition safety."""
        result = await self.db.execute(
            select(Vehicle).where(Vehicle.id == id).with_for_update()
        )
        return result.scalar_one_or_none()
