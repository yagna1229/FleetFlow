"""Maintenance API — service logging + complete. RBAC: manager only."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.maintenance import MaintenanceCreate, MaintenanceOut
from app.services.maintenance_service import MaintenanceService
from app.utils.pagination import PaginationParams

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("/", response_model=MaintenanceOut, status_code=201)
async def create_maintenance_log(
    data: MaintenanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = MaintenanceService(db)
    return await svc.create_log(data, logged_by=current_user.id)


@router.get("/", response_model=list[MaintenanceOut])
async def list_maintenance_logs(
    response: Response,
    vehicle_id: int | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = MaintenanceService(db)
    items, total = await svc.list_logs(
        offset=pagination.offset, limit=pagination.limit, vehicle_id=vehicle_id
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    return items


@router.get("/{log_id}", response_model=MaintenanceOut)
async def get_maintenance_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = MaintenanceService(db)
    return await svc.get_log(log_id)


@router.post("/{log_id}/complete", response_model=MaintenanceOut)
async def complete_maintenance(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = MaintenanceService(db)
    return await svc.complete_maintenance(log_id)
