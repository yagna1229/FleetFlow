"""
Vehicle service — business logic for fleet asset management.
"""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.vehicle_repo import VehicleRepository
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
from app.models.vehicle import Vehicle
from app.utils.enums import VehicleStatus


class VehicleService:
    def __init__(self, db: AsyncSession):
        self.repo = VehicleRepository(db)

    async def create_vehicle(self, data: VehicleCreate) -> Vehicle:
        # Check uniqueness
        existing = await self.repo.get_by_license_plate(data.license_plate)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"License plate '{data.license_plate}' already registered",
            )
        return await self.repo.create(**data.model_dump())

    async def get_vehicle(self, vehicle_id: int) -> Vehicle:
        vehicle = await self.repo.get_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle

    async def list_vehicles(
        self, offset: int = 0, limit: int = 25, status_filter: VehicleStatus | None = None
    ):
        filters = []
        if status_filter:
            filters.append(Vehicle.status == status_filter)
        return await self.repo.list_all(offset=offset, limit=limit, filters=filters)

    async def update_vehicle(self, vehicle_id: int, data: VehicleUpdate) -> Vehicle:
        vehicle = await self.get_vehicle(vehicle_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(vehicle, **update_data)

    async def retire_vehicle(self, vehicle_id: int) -> Vehicle:
        vehicle = await self.get_vehicle(vehicle_id)
        if vehicle.status == VehicleStatus.ON_TRIP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot retire a vehicle that is currently on trip",
            )
        return await self.repo.update(vehicle, status=VehicleStatus.RETIRED)

    async def get_available_vehicles(self) -> list[Vehicle]:
        return await self.repo.get_available()
