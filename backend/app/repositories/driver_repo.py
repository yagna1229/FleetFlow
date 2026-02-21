"""Driver repository — domain-specific queries."""

from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.driver import Driver
from app.repositories.base import BaseRepository
from app.utils.enums import DriverStatus


class DriverRepository(BaseRepository[Driver]):
    def __init__(self, db: AsyncSession):
        super().__init__(Driver, db)

    async def get_by_license_number(self, number: str) -> Driver | None:
        result = await self.db.execute(
            select(Driver).where(Driver.license_number == number)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Driver | None:
        result = await self.db.execute(
            select(Driver).where(Driver.email == email)
        )
        return result.scalar_one_or_none()

    async def get_available(self) -> list[Driver]:
        result = await self.db.execute(
            select(Driver).where(Driver.status == DriverStatus.AVAILABLE)
        )
        return list(result.scalars().all())

    async def get_expiring_licenses(self, within_days: int = 30) -> list[Driver]:
        """Drivers whose license expires within the given number of days."""
        threshold = date.today()
        from datetime import timedelta
        end = threshold + timedelta(days=within_days)
        result = await self.db.execute(
            select(Driver).where(
                Driver.license_expiry <= end,
                Driver.license_expiry >= threshold,
            )
        )
        return list(result.scalars().all())

    async def get_by_id_for_update(self, id: int) -> Driver | None:
        result = await self.db.execute(
            select(Driver).where(Driver.id == id).with_for_update()
        )
        return result.scalar_one_or_none()
