"""
Analytics service — KPI computations, cost summaries, fuel efficiency.
"""

from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.maintenance_log import MaintenanceLog
from app.models.fuel_log import FuelLog
from app.models.trip_expense import TripExpense
from app.utils.enums import VehicleStatus, TripStatus
from app.schemas.analytics import DashboardKPIs, VehicleCostSummary, FuelEfficiencyReport


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_kpis(self) -> DashboardKPIs:
        # Vehicle counts by status
        result = await self.db.execute(
            select(Vehicle.status, func.count(Vehicle.id)).group_by(Vehicle.status)
        )
        counts = {row[0]: row[1] for row in result.all()}

        total = sum(counts.values())
        active = counts.get(VehicleStatus.ON_TRIP, 0)
        in_shop = counts.get(VehicleStatus.IN_SHOP, 0)
        available = counts.get(VehicleStatus.AVAILABLE, 0)
        retired = counts.get(VehicleStatus.RETIRED, 0)

        utilization = Decimal(active) / Decimal(total) * 100 if total > 0 else Decimal("0")

        # Pending cargo (DRAFT trips)
        pending = (await self.db.execute(
            select(func.count(Trip.id)).where(Trip.status == TripStatus.DRAFT)
        )).scalar() or 0

        return DashboardKPIs(
            active_fleet=active,
            in_maintenance=in_shop,
            utilization_rate=round(utilization, 2),
            pending_cargo=pending,
            total_vehicles=total,
            available_vehicles=available,
            retired_vehicles=retired,
        )

    async def get_vehicle_cost_summary(self, vehicle_id: int) -> VehicleCostSummary:
        vehicle = (await self.db.execute(
            select(Vehicle).where(Vehicle.id == vehicle_id)
        )).scalar_one_or_none()

        if not vehicle:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Fuel cost
        fuel_total = (await self.db.execute(
            select(func.coalesce(func.sum(FuelLog.cost), 0))
            .where(FuelLog.vehicle_id == vehicle_id)
        )).scalar()

        # Maintenance cost
        maint_total = (await self.db.execute(
            select(func.coalesce(func.sum(MaintenanceLog.cost), 0))
            .where(MaintenanceLog.vehicle_id == vehicle_id)
        )).scalar()

        # Trip expense cost
        expense_total = (await self.db.execute(
            select(func.coalesce(func.sum(TripExpense.amount), 0))
            .select_from(TripExpense)
            .join(Trip, TripExpense.trip_id == Trip.id)
            .where(Trip.vehicle_id == vehicle_id)
        )).scalar()

        total_ops = Decimal(str(fuel_total)) + Decimal(str(maint_total)) + Decimal(str(expense_total))

        # Cost per km
        odometer = Decimal(str(vehicle.odometer_km or 0))
        cost_per_km = (total_ops / odometer) if odometer > 0 else None

        # ROI
        acq = Decimal(str(vehicle.acquisition_cost or 0))
        roi = ((Decimal("0") - total_ops) / acq) if acq > 0 else None  # Revenue placeholder = 0

        return VehicleCostSummary(
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate,
            name=vehicle.name,
            total_fuel_cost=Decimal(str(fuel_total)),
            total_maintenance_cost=Decimal(str(maint_total)),
            total_expense_cost=Decimal(str(expense_total)),
            total_operational_cost=total_ops,
            cost_per_km=round(cost_per_km, 4) if cost_per_km else None,
            vehicle_roi=round(roi, 4) if roi else None,
        )

    async def get_fuel_efficiency(self, vehicle_id: int) -> FuelEfficiencyReport:
        vehicle = (await self.db.execute(
            select(Vehicle).where(Vehicle.id == vehicle_id)
        )).scalar_one_or_none()

        if not vehicle:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Vehicle not found")

        total_liters = (await self.db.execute(
            select(func.coalesce(func.sum(FuelLog.liters), 0))
            .where(FuelLog.vehicle_id == vehicle_id)
        )).scalar()

        total_km = Decimal(str(vehicle.odometer_km or 0))
        total_l = Decimal(str(total_liters))
        km_per_l = (total_km / total_l) if total_l > 0 else None

        return FuelEfficiencyReport(
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate,
            total_km=total_km,
            total_liters=total_l,
            km_per_liter=round(km_per_l, 2) if km_per_l else None,
        )
