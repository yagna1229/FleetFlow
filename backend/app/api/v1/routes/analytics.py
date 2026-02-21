"""Analytics API — dashboard KPIs, cost summaries, fuel efficiency. RBAC: all roles for KPIs, manager+financial for deep analytics."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.analytics import DashboardKPIs, VehicleCostSummary, FuelEfficiencyReport
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# Dashboard KPIs — all authenticated roles can access
@router.get("/dashboard", response_model=DashboardKPIs)
async def get_dashboard_kpis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = AnalyticsService(db)
    return await svc.get_dashboard_kpis()


# Aggregate Dashboard Data for "Big Picture" view
@router.get("/dashboard-aggregate")
async def get_dashboard_aggregate(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = AnalyticsService(db)
    return await svc.get_dashboard_aggregate()


# Deep analytics — manager + financial_analyst
@router.get("/vehicle/{vehicle_id}/costs", response_model=VehicleCostSummary)
async def get_vehicle_costs(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "financial_analyst")),
):
    svc = AnalyticsService(db)
    return await svc.get_vehicle_cost_summary(vehicle_id)


@router.get("/vehicle/{vehicle_id}/fuel-efficiency", response_model=FuelEfficiencyReport)
async def get_fuel_efficiency(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "financial_analyst")),
):
    svc = AnalyticsService(db)
    return await svc.get_fuel_efficiency(vehicle_id)
