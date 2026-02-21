"""
Maintenance service — auto-status management for vehicles.
"""

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.maintenance_repo import MaintenanceRepository
from app.repositories.vehicle_repo import VehicleRepository
from app.schemas.maintenance import MaintenanceCreate
from app.models.maintenance_log import MaintenanceLog
from app.utils.enums import VehicleStatus


class MaintenanceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MaintenanceRepository(db)
        self.vehicle_repo = VehicleRepository(db)

    async def create_log(self, data: MaintenanceCreate, logged_by: int | None = None) -> MaintenanceLog:
        """Create maintenance log → auto-set vehicle to IN_SHOP."""
        vehicle = await self.vehicle_repo.get_by_id(data.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        if vehicle.status == VehicleStatus.ON_TRIP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot service a vehicle currently on trip",
            )

        # Create the log
        log = await self.repo.create(
            **data.model_dump(),
            logged_by=logged_by,
            is_completed=False,
        )

        # Auto-set vehicle status
        vehicle.status = VehicleStatus.IN_SHOP
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def complete_maintenance(self, log_id: int) -> MaintenanceLog:
        """Mark log as done. If no other open logs, set vehicle → AVAILABLE."""
        log = await self.repo.get_by_id(log_id)
        if not log:
            raise HTTPException(status_code=404, detail="Maintenance log not found")

        if log.is_completed:
            raise HTTPException(status_code=400, detail="Already completed")

        log.is_completed = True
        log.completed_date = date.today()

        # Check if vehicle has other open maintenance logs
        open_logs = await self.repo.get_open_by_vehicle(log.vehicle_id)
        # Exclude the current one (just marked complete but not committed yet)
        remaining = [l for l in open_logs if l.id != log_id]

        if not remaining:
            vehicle = await self.vehicle_repo.get_by_id(log.vehicle_id)
            if vehicle and vehicle.status == VehicleStatus.IN_SHOP:
                vehicle.status = VehicleStatus.AVAILABLE

        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def list_logs(self, offset: int = 0, limit: int = 25, vehicle_id: int | None = None):
        filters = []
        if vehicle_id:
            filters.append(MaintenanceLog.vehicle_id == vehicle_id)
        return await self.repo.list_all(offset=offset, limit=limit, filters=filters)

    async def get_log(self, log_id: int) -> MaintenanceLog:
        log = await self.repo.get_by_id(log_id)
        if not log:
            raise HTTPException(status_code=404, detail="Maintenance log not found")
        return log
