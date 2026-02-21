"""
Pydantic schemas for Analytics / Dashboard responses.
"""

from decimal import Decimal
from pydantic import BaseModel


class DashboardKPIs(BaseModel):
    active_fleet: int
    in_maintenance: int
    utilization_rate: Decimal
    pending_cargo: int
    total_vehicles: int
    available_vehicles: int
    retired_vehicles: int


class VehicleCostSummary(BaseModel):
    vehicle_id: int
    license_plate: str
    name: str
    total_fuel_cost: Decimal
    total_maintenance_cost: Decimal
    total_expense_cost: Decimal
    total_operational_cost: Decimal
    cost_per_km: Decimal | None
    vehicle_roi: Decimal | None


class FuelEfficiencyReport(BaseModel):
    vehicle_id: int
    license_plate: str
    total_km: Decimal
    total_liters: Decimal
    km_per_liter: Decimal | None
