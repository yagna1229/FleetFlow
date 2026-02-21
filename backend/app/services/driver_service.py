"""
Driver service — business logic for driver management & compliance.
"""

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.driver_repo import DriverRepository
from app.schemas.driver import DriverCreate, DriverUpdate
from app.models.driver import Driver
from app.utils.enums import DriverStatus


class DriverService:
    def __init__(self, db: AsyncSession):
        self.repo = DriverRepository(db)

    async def create_driver(self, data: DriverCreate) -> Driver:
        # Uniqueness checks
        if await self.repo.get_by_license_number(data.license_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"License number '{data.license_number}' already registered",
            )
        if await self.repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{data.email}' already registered",
            )

        # License validity
        if data.license_expiry <= date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot register a driver with an expired license",
            )

        return await self.repo.create(**data.model_dump())

    async def get_driver(self, driver_id: int) -> Driver:
        driver = await self.repo.get_by_id(driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        return driver

    async def list_drivers(
        self, offset: int = 0, limit: int = 25, status_filter: DriverStatus | None = None
    ):
        filters = []
        if status_filter:
            filters.append(Driver.status == status_filter)
        return await self.repo.list_all(offset=offset, limit=limit, filters=filters)

    async def update_driver(self, driver_id: int, data: DriverUpdate) -> Driver:
        driver = await self.get_driver(driver_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(driver, **update_data)

    async def get_available_drivers(self) -> list[Driver]:
        return await self.repo.get_available()

    async def get_expiring_licenses(self, within_days: int = 30) -> list[Driver]:
        return await self.repo.get_expiring_licenses(within_days)

    def is_license_valid(self, driver: Driver) -> bool:
        return driver.license_expiry > date.today()
