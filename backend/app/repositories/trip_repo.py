"""Trip repository — domain-specific queries."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trip import Trip
from app.repositories.base import BaseRepository
from app.utils.enums import TripStatus


class TripRepository(BaseRepository[Trip]):
    def __init__(self, db: AsyncSession):
        super().__init__(Trip, db)

    async def get_by_id_with_relations(self, id: int) -> Trip | None:
        result = await self.db.execute(
            select(Trip)
            .options(selectinload(Trip.vehicle), selectinload(Trip.driver))
            .where(Trip.id == id)
        )
        return result.scalar_one_or_none()

    async def get_active_by_vehicle(self, vehicle_id: int) -> Trip | None:
        """Returns a currently dispatched trip for a vehicle, if any."""
        result = await self.db.execute(
            select(Trip).where(
                Trip.vehicle_id == vehicle_id,
                Trip.status == TripStatus.DISPATCHED,
            )
        )
        return result.scalar_one_or_none()

    async def get_active_by_driver(self, driver_id: int) -> Trip | None:
        result = await self.db.execute(
            select(Trip).where(
                Trip.driver_id == driver_id,
                Trip.status == TripStatus.DISPATCHED,
            )
        )
        return result.scalar_one_or_none()
