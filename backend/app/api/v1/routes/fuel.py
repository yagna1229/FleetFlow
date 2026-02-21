"""Fuel logs API. RBAC: manager + financial_analyst."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.fuel import FuelLogCreate, FuelLogOut
from app.services.fuel_service import FuelService
from app.utils.pagination import PaginationParams

router = APIRouter(prefix="/fuel", tags=["Fuel Logs"])


@router.post("/", response_model=FuelLogOut, status_code=201)
async def create_fuel_log(
    data: FuelLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = FuelService(db)
    return await svc.create_log(data, logged_by=current_user.id)


@router.get("/", response_model=list[FuelLogOut])
async def list_fuel_logs(
    response: Response,
    vehicle_id: int | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "financial_analyst")),
):
    svc = FuelService(db)
    items, total = await svc.list_logs(
        offset=pagination.offset, limit=pagination.limit, vehicle_id=vehicle_id
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    return items


@router.get("/{log_id}", response_model=FuelLogOut)
async def get_fuel_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "financial_analyst")),
):
    svc = FuelService(db)
    return await svc.get_log(log_id)
