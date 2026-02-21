"""
Trip service — the core dispatch workflow with full validation.
"""

from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.trip_repo import TripRepository
from app.repositories.vehicle_repo import VehicleRepository
from app.repositories.driver_repo import DriverRepository
from app.schemas.trip import TripCreate
from app.models.trip import Trip
from app.utils.enums import TripStatus, VehicleStatus, DriverStatus, LicenseCategory


class TripService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.trip_repo = TripRepository(db)
        self.vehicle_repo = VehicleRepository(db)
        self.driver_repo = DriverRepository(db)

    async def create_trip(self, data: TripCreate, created_by: int | None = None) -> Trip:
        """Create a trip in DRAFT status after full validation."""

        # 1. Fetch vehicle & driver
        vehicle = await self.vehicle_repo.get_by_id(data.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        driver = await self.driver_repo.get_by_id(data.driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        # 2. Vehicle availability
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle is not available (current status: {vehicle.status.value})",
            )

        # 3. Driver availability
        if driver.status != DriverStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver is not available (current status: {driver.status.value})",
            )

        # 4. License expiry
        if driver.license_expiry <= date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver's license has expired — cannot assign to trip",
            )

        # 5. License category match
        if driver.license_category != LicenseCategory.ALL:
            if driver.license_category.value != vehicle.vehicle_type.value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Driver license category '{driver.license_category.value}' does not match vehicle type '{vehicle.vehicle_type.value}'",
                )

        # 6. Capacity check
        if data.cargo_weight_kg > vehicle.max_capacity_kg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cargo weight ({data.cargo_weight_kg} kg) exceeds vehicle capacity ({vehicle.max_capacity_kg} kg)",
            )

        return await self.trip_repo.create(
            **data.model_dump(),
            created_by=created_by,
            status=TripStatus.DRAFT,
        )

    async def dispatch_trip(self, trip_id: int, start_odometer: Decimal) -> Trip:
        """
        DRAFT → DISPATCHED.
        Uses SELECT FOR UPDATE on both vehicle and driver to prevent races.
        """
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.status != TripStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only dispatch DRAFT trips (current: {trip.status.value})",
            )

        # Lock rows
        vehicle = await self.vehicle_repo.get_by_id_for_update(trip.vehicle_id)
        driver = await self.driver_repo.get_by_id_for_update(trip.driver_id)

        if not vehicle or vehicle.status != VehicleStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Vehicle no longer available")
        if not driver or driver.status != DriverStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Driver no longer available")

        # Transition
        vehicle.status = VehicleStatus.ON_TRIP
        driver.status = DriverStatus.ON_TRIP
        driver.total_trips = (driver.total_trips or 0) + 1
        trip.status = TripStatus.DISPATCHED
        trip.start_odometer = start_odometer
        trip.dispatched_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(trip)
        return trip

    async def complete_trip(self, trip_id: int, end_odometer: Decimal) -> Trip:
        """DISPATCHED → COMPLETED. Releases vehicle & driver."""
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.status != TripStatus.DISPATCHED:
            raise HTTPException(
                status_code=400,
                detail=f"Can only complete DISPATCHED trips (current: {trip.status.value})",
            )

        if trip.start_odometer is not None and end_odometer < trip.start_odometer:
            raise HTTPException(
                status_code=400,
                detail="End odometer cannot be less than start odometer",
            )

        vehicle = await self.vehicle_repo.get_by_id_for_update(trip.vehicle_id)
        driver = await self.driver_repo.get_by_id_for_update(trip.driver_id)

        # Update trip
        trip.status = TripStatus.COMPLETED
        trip.end_odometer = end_odometer
        trip.completed_at = datetime.now(timezone.utc)

        # Release vehicle
        if vehicle:
            vehicle.status = VehicleStatus.AVAILABLE
            vehicle.odometer_km = end_odometer

        # Release driver
        if driver:
            driver.status = DriverStatus.AVAILABLE
            driver.completed_trips = (driver.completed_trips or 0) + 1

        await self.db.commit()
        await self.db.refresh(trip)
        return trip

    async def cancel_trip(self, trip_id: int) -> Trip:
        """DRAFT or DISPATCHED → CANCELLED."""
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.status not in (TripStatus.DRAFT, TripStatus.DISPATCHED):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel a {trip.status.value} trip",
            )

        # If dispatched, release vehicle & driver
        if trip.status == TripStatus.DISPATCHED:
            vehicle = await self.vehicle_repo.get_by_id_for_update(trip.vehicle_id)
            driver = await self.driver_repo.get_by_id_for_update(trip.driver_id)
            if vehicle:
                vehicle.status = VehicleStatus.AVAILABLE
            if driver:
                driver.status = DriverStatus.AVAILABLE

        trip.status = TripStatus.CANCELLED
        await self.db.commit()
        await self.db.refresh(trip)
        return trip

    async def get_trip(self, trip_id: int) -> Trip:
        trip = await self.trip_repo.get_by_id_with_relations(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        return trip

    async def list_trips(
        self, offset: int = 0, limit: int = 25, status_filter: TripStatus | None = None
    ):
        filters = []
        if status_filter:
            filters.append(Trip.status == status_filter)
        return await self.trip_repo.list_all(offset=offset, limit=limit, filters=filters)
