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


class EfficiencyDataPoint(BaseModel):
    month: str
    val1: int | float
    val2: int | float


class CostliestVehicleData(BaseModel):
    label: str
    cost: int | float
    name: str
    actual_cost: str


class FinancialSummaryRow(BaseModel):
    month: str
    revenue: str
    fuel: str
    maint: str
    profit: str


class DashboardAggregate(BaseModel):
    fuelCost: str
    roi: str
    utilization: str
    efficiency_data: list[EfficiencyDataPoint]
    costliest_data: list[CostliestVehicleData]
    financial_data: list[FinancialSummaryRow]
