"""Maintenance API — service logging + complete. RBAC: manager+safety_officer (write), others (read)."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.maintenance import MaintenanceCreate, MaintenanceOut
from app.services.maintenance_service import MaintenanceService
from app.utils.pagination import PaginationParams
from app.utils.rbac import filter_response

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

MAINTENANCE_EXCLUDES = {}

ALL_ROLES = ["manager", "dispatcher", "safety_officer", "financial_analyst"]


@router.post("/", response_model=MaintenanceOut, status_code=201, response_model_exclude_none=True)
async def create_maintenance_log(
    data: MaintenanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = MaintenanceService(db)
    item = await svc.create_log(data, logged_by=current_user.id)
    out_item = MaintenanceOut.model_validate(item)
    return filter_response(out_item, current_user, MAINTENANCE_EXCLUDES)


@router.get("/", response_model=list[MaintenanceOut], response_model_exclude_none=True)
async def list_maintenance_logs(
    response: Response,
    vehicle_id: int | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = MaintenanceService(db)
    items, total = await svc.list_logs(
        offset=pagination.offset, limit=pagination.limit, vehicle_id=vehicle_id
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    
    out_items = [MaintenanceOut.model_validate(x) for x in items]
    return filter_response(out_items, current_user, MAINTENANCE_EXCLUDES)


@router.get("/{log_id}", response_model=MaintenanceOut, response_model_exclude_none=True)
async def get_maintenance_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = MaintenanceService(db)
    item = await svc.get_log(log_id)
    out_item = MaintenanceOut.model_validate(item)
    return filter_response(out_item, current_user, MAINTENANCE_EXCLUDES)


@router.post("/{log_id}/complete", response_model=MaintenanceOut, response_model_exclude_none=True)
async def complete_maintenance(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = MaintenanceService(db)
    item = await svc.complete_maintenance(log_id)
    out_item = MaintenanceOut.model_validate(item)
    return filter_response(out_item, current_user, MAINTENANCE_EXCLUDES)
